const express = require('express');
const Checklist = require('../models/checklist');
const Socket = require('../models/socketUsers');
const {
    auth
} = require('../middleware');

module.exports = function(io) {
    const checklistsRouter = express.Router();

    checklistsRouter.post('/checklist', auth, async (req, res) => {
        const checklist = await new Checklist(req.body);
        checklist.userId = req.user._id;
        checklist.save((err, list) => {
            if (err) {
                return res.status(500).json(err);
            }
            if (checklist.friendShares.length > 0) {
                checklist.friendShares.forEach((friend) => {
                    Socket.find({
                        user: friend.userId,
                        namespace: '/checklist'
                    }).then(
                        (socketUser) => {
                            if (socketUser.length > 0) {
                                io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('checklist', {
                                    action: 'add',
                                    checklist
                                });
                            }
                        }
                    );
                });
            }
            res.status(201).json(list);
        });

    });

    checklistsRouter.get('/checklists', auth, async (req, res) => {
        var allChecklistList = [];

        await Checklist.find({
                '$or': [{
                        userId: req.user._id
                    },
                    {
                        'friendShares.userId': req.user._id.toString()
                    }
                ]
            })
            .exec()
            .then((myCheklists) => {
                myCheklists.forEach((cheklist) => {
                    allChecklistList.push(cheklist);
                });

                res.status(200).json(allChecklistList);
            })
            .catch((err) => res.status(500).json({
                message: 'no list found :(',
                error: err
            }));
    });

    checklistsRouter.put('/checklist/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Checklist.findById(id)
            .then((checklist) => {
                if (checklist.userId == req.user._id || req.user.isAdmin || req.user.friend.find((friend) => friend.userId == checklist.userId)) {
                    Checklist.findByIdAndUpdate(id, req.body,
                        (err) => {
                            if (err) {
                                return res.status(500).json(err);
                            }
                            const newShareFriends = req.body.friendShares.filter((friend1) => !checklist.friendShares.find((friend2) => friend1.userId == friend2.userId));
                            const removedShareFriends = checklist.friendShares.filter((friend1) => !req.body.friendShares.find((friend2) => friend1.userId == friend2.userId));

                            if (newShareFriends.length > 0) {
                                newShareFriends.forEach((friend) => {
                                    Socket.find({
                                        user: friend.userId,
                                        namespace: '/checklist'
                                    }).then(
                                        (socketUser) => {
                                            if (socketUser.length > 0) {
                                                io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('checklist', {
                                                    action: 'update',
                                                    checklist: req.body
                                                });
                                            }
                                        }
                                    );
                                });
                            }
                            if (removedShareFriends.length > 0) {
                                removedShareFriends.forEach((friend) => {
                                    Socket.find({
                                        user: friend.userId,
                                        namespace: '/checklist'
                                    }).then(
                                        (socketUser) => {
                                            if (socketUser.length > 0) {
                                                io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('checklist', {
                                                    action: 'update',
                                                    checklist: req.body
                                                });
                                            }
                                        }
                                    );
                                });
                            }
                            if (req.body.friendShares.length > 0) {
                                if (req.user._id == req.body.userId) {
                                    req.body.friendShares.forEach((friend) => {
                                        Socket.find({
                                            user: friend.userId,
                                            namespace: '/checklist'
                                        }).then(
                                            (socketUser) => {
                                                if (socketUser.length > 0) {
                                                    io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('checklist', {
                                                        action: 'update',
                                                        checklist: req.body
                                                    });
                                                }
                                            }
                                        );
                                    });
                                } else {
                                    Socket.find({
                                        user: req.body.userId,
                                        namespace: '/checklist'
                                    }).then(
                                        (socketUser) => {
                                            if (socketUser.length > 0) {
                                                io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('checklist', {
                                                    action: 'update',
                                                    checklist: req.body
                                                });
                                            }
                                        }
                                    );
                                    req.body.friendShares.forEach((friend) => {
                                        if (friend.userId !== req.user._id) {
                                            Socket.find({
                                                user: friend.userId,
                                                namespace: '/checklist'
                                            }).then(
                                                (socketUser) => {
                                                    if (socketUser.length > 0) {
                                                        io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('checklist', {
                                                            action: 'update',
                                                            checklist: req.body
                                                        });
                                                    }
                                                }
                                            );
                                        }
                                    });
                                }
                            }
                            res.status(202).json({
                                msg: `checklist id ${checklist._id} updated`
                            });
                        });
                } else {
                    return res.status(403).json({
                        message: 'unauthorized access'
                    });
                }
            })
            .catch((err) => res.status(404).json({
                message: `checklist with id ${id} not found`,
                error: err
            }));
    });

    checklistsRouter.delete('/checklist/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Checklist.findById(id)
            .then((checklist) => {
                if (checklist.userId == req.user._id || req.user.isAdmin || req.user.friend.find((friend) => friend.userId == checklist.userId)) {
                    Checklist.findByIdAndDelete(id, (err) => {
                        if (err) {
                            return res.status(500).json(err);
                        }
                        if (req.user._id == checklist.userId) {
                            checklist.friendShares.forEach((friend) => {
                                Socket.find({
                                    user: friend.userId,
                                    namespace: '/checklist'
                                }).then(
                                    (socketUser) => {
                                        if (socketUser.length > 0) {
                                            io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('checklist', {
                                                action: 'delete',
                                                checklist
                                            });
                                        }
                                    }
                                );
                            });
                        } else {
                            Socket.find({
                                user: checklist.userId,
                                namespace: '/checklist'
                            }).then(
                                (socketUser) => {
                                    if (socketUser.length > 0) {
                                        io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('checklist', {
                                            action: 'delete',
                                            checklist
                                        });
                                    }
                                }
                            );
                            checklist.friendShares.forEach((friend) => {
                                if (friend.userId !== req.user._id) {
                                    Socket.find({
                                        user: friend.userId,
                                        namespace: '/checklist'
                                    }).then(
                                        (socketUser) => {
                                            if (socketUser.length > 0) {
                                                io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('checklist', {
                                                    action: 'delete',
                                                    checklist
                                                });
                                            }
                                        }
                                    );
                                }
                            });
                        }
                        res.status(202).json({
                            msg: 'checklist deleted'
                        });
                    });
                } else {
                    return res.status(403).json({
                        message: 'unauthorized access'
                    });
                }
            })
            .catch((err) => res.status(404).json({
                message: `checklist with id ${id} not found`,
                error: err
            }));
    });

    return checklistsRouter;
};
