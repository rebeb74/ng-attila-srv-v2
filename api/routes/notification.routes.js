const express = require('express');
const Notification = require('../models/notification');
const {
    auth
} = require('../middleware');

module.exports = function (io) {
    const notificationRouter = express.Router();

    notificationRouter.post('/notification', auth, async (req, res) => {
        try {

            const notification = new Notification(req.body);

            await notification.save();

            io.of('/notification').emit('notification', notification);

            res.send(notification);

        } catch (error) {
            console.log(error)
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
            .then(notifications => {
                res.status(200).json(notifications)
            })
            .catch(err => res.status(500).json({
                message: 'no notifications found :(',
                code: 'notifications_not_found',
                error: err
            }));
    });

    notificationRouter.get('/notification/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Notification.findById(id)
            .then((notification) => {
                if (notification.notificationUserId == req.user._id || req.user.isAdmin) {
                    return res.status(200).json(notification);
                } else {
                    return res.status(403).json({
                        message: 'unauthorized access',
                        code: 'unauthorized_access'
                    });
                }

            })
            .catch(err => res.status(404).json({
                message: `notification not found`,
                error: err,
                code: 'notification_not_found'
            }));
    });

    notificationRouter.put('/notification/:id', auth, async (req, res) => {
        const id = req.params.id;
        const notification = await Notification.findByIdAndUpdate(id, {
                read: req.body.read,
            },
            (err, notification) => {
                if (err) {
                    return res.status(404).json({
                        message: `notification with id ${id} not found`,
                        error: err,
                        code: 'notification_not_found'
                    });
                }
            });
        io.of('/notification').emit('notification', notification);
        res.status(202).json(notification);
    });

    notificationRouter.delete('/notification/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Notification.findById(id).exec().then(
            notification => {
                io.of('/notification').emit('notification', notification)
                Notification.findByIdAndDelete(id, (err, notification) => {
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
        )
    });


    return notificationRouter;
};