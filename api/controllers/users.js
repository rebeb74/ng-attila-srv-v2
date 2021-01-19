const User = require('../models/user');
const mongoose = require('mongoose');
const {
  check
} = require('prettier');
const {
  forEach
} = require('lodash');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Anything controller.
 * @module controllers/users
 */

/**
 * Example controller to get information about request.
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
module.exports.getUsers = (req, res) => {
  User.find()
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
};

module.exports.getUserById = (req, res) => {
  const id = req.params.id;
  User.findById(id)
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
};

module.exports.updateUserById = (req, res) => {
  console.log('PASS OLD')
  const id = req.params.id;

  if (req.body.email == null || req.body.username == null) {
    throw new MissingRequiredParameterError({
      info: {
        body: ['email, username']
      }
    });
  }

  if (id == req.user._id || req.user.isAdmin) {
    User.find({
      username: req.body.username
    }, (err, result) => {
      if (result == '' || req.user._id.toString() === result[0]._id.toString()) {
        User.find({
          email: req.body.email
        }, (err, result) => {
          if (result == '' || req.user._id.toString() === result[0]._id.toString()) {
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

};

module.exports.deleteUserById = (req, res) => {
  const id = req.params.id;
  if (req.user.isAdmin) {
    User.findByIdAndDelete(id, (err, user) => {
      if (err) {
        return res.status(500).json(err);
      }
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
};