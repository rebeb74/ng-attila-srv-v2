const express = require('express');
const User = require('../models/user');
const Socket = require('../models/socketUsers');
const {
    auth
} = require('../middleware');
const _ = require('lodash');
const {
    MissingRequiredParameterError
} = require('../errors');

module.exports = function(io) {
    const userRouter = express.Router();

    userRouter.get('/users', auth, async (req, res) => {
        await User.find()
            .sort({
                'createdOn': -1
            })
            .exec()
            .then((users) => {
                const parsedUsers = [];
                users.forEach((user) => {
                    parsedUsers.push({
                        _id: user._id,
                        email: user.email,
                        username: user.username,
                        lang: user.lang,
                        birthdate: user.birthdate,
                        createdOn: user.createdOn,
                        updatedOn: user.updatedOn,
                        friend: user.friend
                    });
                });
                res.status(200).json(parsedUsers);
            })
            .catch((err) => res.status(500).json({
                message: 'users not found :(',
                error: err,
                code: 'user_not_found'
            }));
    });

    userRouter.get('/user/:id', auth, async (req, res) => {
        const id = req.params.id;
        await User.findById(id)
            .then((user) => {
                return res.status(200).json({
                    _id: user[0]._id,
                    email: user[0].email,
                    username: user[0].username,
                    lang: user[0].lang,
                    birthdate: user[0].birthdate,
                    createdOn: user[0].createdOn,
                    updatedOn: user[0].updatedOn,
                    friend: user[0].friend
                });
            })
            .catch((err) => res.status(500).json({
                message: `user with id ${id} not found`,
                error: err,
                code: 'user_not_found'
            }));
    });

    userRouter.put('/user/:id', auth, async (req, res) => {
        const id = req.params.id;

        if (req.body.email == null || req.body.username == null) {
            throw new MissingRequiredParameterError({
                info: {
                    body: ['email, username']
                }
            });
        }

        if (id == req.user._id || req.user.isAdmin) {
            await User.find({
                username: req.body.username
            }, (err, result) => {
                if (result == '' || req.user._id.toString() === result[0]._id.toString()) {
                    User.find({
                        email: req.body.email
                    }, (err, result) => {
                        if (result == '' || req.user._id.toString() === result[0]._id.toString()) {

                            User.find({
                                'friend.userId': req.user._id
                            }).then(
                                (result) => {
                                    // update all friends with new current user email and username
                                    result.forEach((user) => {
                                        let updatedUser = _.cloneDeep(user);
                                        updatedUser.friend.forEach((friend) => {
                                            if (friend.userId == req.user._id) {
                                                friend.email = req.body.email;
                                                friend.username = req.body.username;
                                            }
                                        });
                                        User.findByIdAndUpdate(updatedUser._id, updatedUser, {
                                            new: true
                                        }).then(
                                            (updatedUser) => {
                                                Socket.findOne({
                                                    user: updatedUser._id,
                                                    namespace: '/user'
                                                }).then(
                                                    (socketUser) => {
                                                        io.of(socketUser.namespace).to(socketUser._id).emit('user', socketUser.user);
                                                    }
                                                );
                                            });
                                    });
                                    // Update currentUser
                                    User.findByIdAndUpdate(id, {
                                            ...req.body,
                                            updatedOn: Date.now()
                                        }, {
                                            new: true
                                        },
                                        (err, currentUser) => {
                                            if (err) {
                                                return res.status(500).json({
                                                    message: 'User Update Failed',
                                                    code: 'user_update_failed'
                                                });
                                            }

                                            // Check if there is a new friend, and add currentUser to the new friend
                                            const newFriend = currentUser.friend.filter((friend) => !req.user.friend.find((friend2) => friend.userId == friend2.userId));
                                            if (newFriend.length != 0) {
                                                User.findById(newFriend[0].userId).exec().then(
                                                    (newFriendUser) => {
                                                        let tempNewFriendUser = _.cloneDeep(newFriendUser);
                                                        tempNewFriendUser.friend.push({
                                                            userId: currentUser._id,
                                                            email: currentUser.email,
                                                            username: currentUser.username
                                                        });
                                                        User.findByIdAndUpdate(tempNewFriendUser._id, tempNewFriendUser).exec().then(
                                                            (result) => {
                                                                Socket.findOne({
                                                                    user: result._id,
                                                                    namespace: '/user'
                                                                }).then(
                                                                    (socketUser) => {
                                                                        io.of(socketUser.namespace).to(socketUser._id).emit('user', socketUser.user);
                                                                    }
                                                                );
                                                            },
                                                            (err) => console.log('error', err)
                                                        );
                                                    }
                                                );
                                            }

                                            // Check if a friend has been deleted, and remove currentUser to the old friend
                                            const oldFriend = req.user.friend.filter((friend) => !currentUser.friend.find((friend2) => friend.userId == friend2.userId));
                                            if (oldFriend.length != 0) {
                                                User.findById(oldFriend[0].userId).exec().then(
                                                    (oldFriendUser) => {
                                                        let tempOldFriendUser = _.cloneDeep(oldFriendUser);
                                                        tempOldFriendUser.friend = tempOldFriendUser.friend.filter((friend) => friend.userId != currentUser._id);
                                                        User.findByIdAndUpdate(tempOldFriendUser._id, tempOldFriendUser).exec().then(
                                                            (result) => {
                                                                Socket.findOne({
                                                                    user: result._id,
                                                                    namespace: '/user'
                                                                }).then(
                                                                    (socketUser) => {
                                                                        io.of(socketUser.namespace).to(socketUser._id).emit('user', socketUser.user);
                                                                    }
                                                                );
                                                            },
                                                            (err) => console.log('error', err)
                                                        );
                                                    }
                                                );
                                            }
                                            Socket.findOne({
                                                user: req.user._id,
                                                namespace: '/user'
                                            }).then(
                                                (socketUser) => {
                                                    io.of(socketUser.namespace).to(socketUser._id).emit('user', socketUser.user);
                                                }
                                            );
                                            res.status(202).json({
                                                msg: 'user updated'
                                            });
                                        });
                                });

                        } else {
                            return res.status(409).json({
                                message: 'email or user already exist',
                                code: 'email_username_already_used'
                            });
                        }
                    });
                } else {
                    return res.status(409).json({
                        message: 'email or user already exist',
                        code: 'email_username_already_used'
                    });
                }
            });

        } else {
            return res.status(403).json({
                message: 'unauthorized access',
                code: 'unauthorized_access'
            });
        }
    });

    userRouter.delete('/user/:id', auth, async (req, res) => {
        const id = req.params.id;
        if (req.user.isAdmin) {
            await User.findByIdAndDelete(id, (err, user) => {
                if (err) {
                    return res.status(500).json(err);
                }
                io.of('/user').emit('user');
                res.status(202).json({
                    msg: `${user} id ${id} deleted`
                });
            });
        } else {
            return res.status(403).json({
                message: 'unauthorized access',
                code: 'unauthorized_access'
            });
        }
    });

    userRouter.get('/key', auth, async (req, res) => {
        res.status(200).json(req.user.secretKey);
    });

    return userRouter;
};
