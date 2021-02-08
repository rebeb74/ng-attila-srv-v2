const express = require('express');
const Event = require('../models/event');
const Socket = require('../models/socketUsers');
// const Socket = require('../models/socketUsers');
const {
    auth
} = require('../middleware');

module.exports = function(io) {
    const eventsRouter = express.Router();

    eventsRouter.post('/event', auth, async (req, res) => {
        const event = new Event(req.body);
        await event.save((err, event) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }
            if (req.user._id == req.body.userId) {
                req.user.friend.forEach((friend) => {
                    Socket.find({
                        user: friend.userId,
                        namespace: '/event'
                    }).then(
                        (socketUser) => {
                            io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('event', {
                                action: 'add',
                                event
                            });
                        }
                    );
                });
            } else {
                Socket.find({
                    user: event.userId,
                    namespace: '/event'
                }).then(
                    (socketUser) => {
                        io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('event', {
                            action: 'add',
                            event
                        });
                    }
                );
            }
            res.status(201).json(event);
        });

    });

    eventsRouter.get('/events', auth, async (req, res) => {
        await Event.find({
                userId: req.user._id
            })
            .exec()
            .then((events) => {
                if (req.user.friend.length > 0) {
                    req.user.friend.forEach((friend, index) => {
                        Event.find({
                                userId: friend.userId
                            })

                            .exec()
                            .then((friendEvents) => {
                                events = [...events, ...friendEvents];
                                if ((index + 1) === req.user.friend.length) {
                                    events.sort(function(a, b) {
                                        var keyA = new Date(a.createdOn);
                                        var keyB = new Date(b.createdOn);
                                        if (keyA < keyB) return -1;
                                        if (keyA > keyB) return 1;
                                        return 0;
                                    });
                                    res.status(200).json(events);
                                }
                            });
                    });
                } else {
                    events.sort(function(a, b) {
                        var keyA = new Date(a.createdOn);
                        var keyB = new Date(b.createdOn);
                        if (keyA < keyB) return -1;
                        if (keyA > keyB) return 1;
                        return 0;
                    });
                    res.status(200).json(events);
                }
            })
            .catch((err) => res.status(500).json({
                message: 'no events found :(',
                error: err
            }));
    });

    eventsRouter.get('/event/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Event.findById(id)
            .then((event) => {
                if (event.userId == req.user._id || req.user.isAdmin) {
                    return res.status(200).json(event);
                } else {
                    return res.status(403).json({
                        message: 'unauthorized access'
                    });
                }

            })
            .catch((err) => res.status(404).json({
                message: 'event not found',
                error: err
            }));
    });

    eventsRouter.put('/event/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Event.findById(id)
            .then((event) => {
                if (event.userId == req.user._id || req.user.isAdmin || req.user.friend.find((friend) => friend.userId == event.userId)) {
                    Event.findByIdAndUpdate(id, req.body,
                        (err, event) => {
                            if (err) {
                                return res.status(500).json(err);
                            }
                            if (req.user._id == event.userId) {
                                req.user.friend.forEach((friend) => {
                                    Socket.find({
                                        user: friend.userId,
                                        namespace: '/event'
                                    }).then(
                                        (socketUser) => {
                                            io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('event', {
                                                action: 'update',
                                                event
                                            });
                                        }
                                    );
                                });
                            } else {
                                Socket.find({
                                    user: event.userId,
                                    namespace: '/event'
                                }).then(
                                    (socketUser) => {
                                        io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('event', {
                                            action: 'update',
                                            event
                                        });
                                    }
                                );
                            }
                            res.status(202).json({
                                msg: `event id ${event._id} updated`
                            });
                        });
                } else {
                    return res.status(403).json({
                        message: 'unauthorized access'
                    });
                }
            })
            .catch((err) => res.status(404).json({
                message: `event with id ${id} not found`,
                error: err
            }));
    });

    eventsRouter.delete('/event/:id', auth, async (req, res) => {
        const id = req.params.id;
        await Event.findById(id)
            .then((event) => {
                if (event.userId == req.user._id || req.user.isAdmin || req.user.friend.find((friend) => friend.userId === event.userId)) {
                    Event.findByIdAndDelete(id, (err, event) => {
                        if (err) {
                            return res.status(500).json(err);
                        }
                        if (req.user._id == event.userId) {
                            req.user.friend.forEach((friend) => {
                                Socket.find({
                                    user: friend.userId,
                                    namespace: '/event'
                                }).then(
                                    (socketUser) => {
                                        io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('event', {
                                            action: 'delete',
                                            event
                                        });
                                    }
                                );
                            });
                        } else {
                            Socket.find({
                                user: event.userId,
                                namespace: '/event'
                            }).then(
                                (socketUser) => {
                                    io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('event', {
                                        action: 'delete',
                                        event
                                    });
                                }
                            );
                        }
                        res.status(202).json({
                            msg: `event id ${event._id} deleted`
                        });
                    });
                } else {
                    return res.status(403).json({
                        message: 'unauthorized access'
                    });
                }
            })
            .catch((err) => res.status(404).json({
                message: `event with id ${id} not found`,
                error: err
            }));
    });


    return eventsRouter;
};
