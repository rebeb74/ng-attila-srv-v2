const express = require('express');
const Notification = require('../models/notification');
const Socket = require('../models/socketUsers');
const {
    auth
} = require('../middleware');

module.exports = function(io) {
    const notificationRouter = express.Router();

    notificationRouter.post('/notification', auth, async (req, res) => {
        try {

            const notification = new Notification(req.body);

            await notification.save();

            await Socket.find({
                $or: [{
                    user: notification.notificationUserId
                }, {
                    user: notification.senderUserId
                }],
                namespace: '/notification'
            }).then(
                (result) => {
                    if (result.length > 0) {
                        result.forEach((socketUser) => {
                            io.of(socketUser.namespace).to(socketUser._id).emit('notification', notification);
                        });
                    }
                }
            );

            res.send(notification);

        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    });

    notificationRouter.get('/notifications', auth, async (req, res) => {
        await Notification.find({
                $or: [{
                    notificationUserId: req.user._id
                }, {
                    senderUserId: req.user._id
                }]
            })
            .sort({
                'createdOn': -1
            })
            .exec()
            .then((notifications) => {
                res.status(200).json(notifications);
            })
            .catch((err) => res.status(500).json({
                message: 'no notifications found :(',
                code: 'notifications_not_found',
                error: err
            }));
    });

    notificationRouter.delete('/notification/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Notification.findById(id).exec().then(
            (notification) => {
                Socket.find({
                    $or: [{
                        user: notification.notificationUserId
                    }, {
                        user: notification.senderUserId
                    }],
                    namespace: '/notification'
                }).then(
                    (result) => {
                        if (result.length > 0) {
                            result.forEach((socketUser) => {
                                io.of(socketUser.namespace).to(socketUser._id).emit('notification', {
                                    action: 'delete',
                                    notification
                                });
                            });
                        }
                    }
                );
                Notification.findByIdAndDelete(id, (err) => {
                    if (err) {
                        return res.status(404).json({
                            message: `notification with id ${id} not found`,
                            error: err,
                            code: 'notification_not_found'
                        });
                    }
                    res.status(202).json('notification deleted');
                });
            }
        );
    });


    return notificationRouter;
};
