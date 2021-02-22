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
            await User.find().exec().then((users) => {
                    const usernameAlreadyInUse = !users.find((user) => user.username.toLowerCase() == req.body.username.toLowerCase());
                    const emailAlreadyInUse = !users.find((user) => user.email == req.body.email);
                    if (emailAlreadyInUse || usernameAlreadyInUse || req.user._id == req.body._id) {
                        // update all friends with new current user email and username
                        const currentUserIsFriendInUserFriends = users.filter((user) => user.friend.find((friend) => friend.userId == req.user._id));
                        currentUserIsFriendInUserFriends.forEach((user) => {
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
                                    Socket.find({
                                        user: updatedUser._id,
                                        namespace: '/user'
                                    }).then(
                                        (socketUser) => {
                                            if (socketUser.length > 0) {
                                                io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('user', socketUser[0].user);
                                            }
                                        }
                                    );
                                });
                        });
                        // Update currentUser
                        User.findByIdAndUpdate(id, {
                                ...req.body
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
                                    const newFriendUser = users.find((user) => user._id == newFriend[0].userId);
                                    let tempNewFriendUser = _.cloneDeep(newFriendUser);
                                    tempNewFriendUser.friend.push({
                                        userId: currentUser._id,
                                        email: currentUser.email,
                                        username: currentUser.username
                                    });
                                    User.findByIdAndUpdate(tempNewFriendUser._id, tempNewFriendUser).exec().then(
                                        (result) => {
                                            Socket.find({
                                                user: result._id,
                                                namespace: '/user'
                                            }).then(
                                                (socketUser) => {
                                                    if (socketUser.length > 0) {
                                                        io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('user', socketUser[0].user);
                                                    }
                                                }
                                            );
                                        },
                                        (err) => console.log('error', err)
                                    );
                                }

                                // Check if a friend has been deleted, and remove currentUser to the old friend
                                const oldFriend = req.user.friend.filter((friend) => !currentUser.friend.find((friend2) => friend.userId == friend2.userId));
                                if (oldFriend.length != 0) {
                                    const oldFriendUser = users.find((user) => user._id == oldFriend[0].userId);
                                    let tempOldFriendUser = _.cloneDeep(oldFriendUser);
                                    tempOldFriendUser.friend = tempOldFriendUser.friend.filter((friend) => friend.userId != currentUser._id);
                                    User.findByIdAndUpdate(tempOldFriendUser._id, tempOldFriendUser).exec().then(
                                        (result) => {
                                            Socket.find({
                                                user: result._id,
                                                namespace: '/user'
                                            }).then(
                                                (socketUser) => {
                                                    if (socketUser.length > 0) {
                                                        io.of(socketUser[0].namespace).to(socketUser[0]._id).emit('user', socketUser[0].user);
                                                    }
                                                }
                                            );
                                        },
                                        (err) => console.log('error', err)
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
                    } else {
                        return res.status(409).json({
                            message: 'email or user already exist',
                            code: 'email_username_already_used'
                        });
                    }
                })
                .catch((error) => {
                    console.log('error', error);
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
