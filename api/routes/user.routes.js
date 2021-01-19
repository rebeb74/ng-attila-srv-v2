const express = require('express');
const User = require('../models/user');
const {
    auth
} = require('../middleware');

module.exports = function (io) {
    const userRouter = express.Router();

    userRouter.get('/users', auth, async (req, res) => {
        await User.find()
            .sort({
                'createdOn': -1
            })
            .exec()
            .then(users => {
                const parsedUsers = [];
                users.forEach(user => {
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
                res.status(200).json(parsedUsers)
            })
            .catch(err => res.status(500).json({
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
            .catch(err => res.status(500).json({
                message: `user with id ${id} not found`,
                error: err,
                code: 'user_not_found'
            }));
    });
    //////////////////////////////////////////////////////////
    //     let isSharedAdded = false;

    //     if (req.body.share != []) {
    //         req.body.share.forEach(element => {
    //             User.findById(element.id).exec()
    //                 .then((userShare) => {
    //                     if (userShare.isShared != []) {
    //                         let isAlreadyAdded = false;
    //                         userShare.isShared.forEach((isSharedUser => {
    //                             if (isSharedUser.id == req.body._id) {
    //                                 isAlreadyAdded = true;
    //                             }
    //                         }));
    //                         if (!isAlreadyAdded) {
    //                             userShare.isShared.push({
    //                                 id: req.user._id,
    //                                 email: req.user.email,
    //                                 username: req.user.username
    //                             });
    //                             User.findByIdAndUpdate(userShare._id, userShare)
    //                                 .exec()
    //                                 .then((success) => console.log(success))
    //                                 .catch((error) => console.log(error))
    //                             isSharedAdded = true;
    //                         }
    //                     } else {
    //                         userShare.isShared.push({
    //                             id: req.user._id,
    //                             email: req.user.email,
    //                             username: req.user.username
    //                         });
    //                         User.findByIdAndUpdate(userShare._id, userShare)
    //                             .exec()
    //                             .then((success) => console.log(success))
    //                             .catch((error) => console.log(error))
    //                         isSharedAdded = true;
    //                     }
    //                 })
    //                 .catch((error) => console.log(error));
    //         });
    //     }
    // };
    ////////////////////////////////////////

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
                            User.findById(req.user._id).exec().then(
                                currentUser => {
                                    // Check if there is a new friend, and add currentUser to the new friend
                                    const newFriend = req.body.friend.filter(friend => !currentUser.friend.includes(friend));
                                    console.log('newFriend', newFriend)
                                    if (newFriend.length != 0) {
                                        User.findById(newFriend[0].userId).exec().then(
                                            newFriendUser => {
                                                console.log('newFriendUser', newFriendUser)
                                                newFriendUser.friend = newFriendUser.friend.push({
                                                    userId: currentUser._id,
                                                    email: currentUser.email,
                                                    username: currentUser.username
                                                })
                                                User.findByIdAndUpdate(newFriendUser._id, newFriendUser).exec().then(
                                                    result => console.log('result', result),
                                                    err => console.log('error', err)
                                                )
                                            }
                                        )
                                    }

                                    // Check if a friend has been deleted, and remove currentUser to the old friend
                                    const oldFriend = currentUser.friend.filter(friend => !req.body.friend.includes(friend));
                                    console.log('oldFriend', oldFriend)
                                    if (oldFriend.length != 0) {
                                        User.findById(oldFriend[0].userId).exec().then(
                                            oldFriendUser => {
                                                console.log('oldFriendUser', oldFriendUser)
                                                oldFriendUser.friend = oldFriendUser.friend.filter(friend => friend.userId != currentUser._id)
                                                User.findByIdAndUpdate(oldFriendUser._id, oldFriendUser).exec().then(
                                                    result => console.log('result', result),
                                                    err => console.log('error', err)
                                                )
                                            }
                                        )
                                    }
                                }
                            )

                            // Update currentUser
                            User.findByIdAndUpdate(id, {
                                    username: req.body.username,
                                    email: req.body.email,
                                    friend: req.body.friend,
                                    birthdate: req.body.birthdate,
                                    lang: req.body.lang,
                                    updatedOn: Date.now()
                                },
                                (err, user) => {
                                    if (err) {
                                        return res.status(500).json({
                                            message: 'User Update Failed',
                                            code: 'user_update_failed'
                                        });
                                    }
                                    io.of('/user').emit('user');
                                    res.status(202).json({
                                        msg: `user updated`
                                    });
                                });
                        } else {
                            return res.status(409).json({
                                message: `email or user already exist`,
                                code: 'email_username_already_used'
                            });
                        }
                    });
                } else {
                    return res.status(409).json({
                        message: `email or user already exist`,
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


    return userRouter;
};