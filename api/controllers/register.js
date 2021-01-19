const User = require('../models/user');
const bcrypt = require('bcryptjs');
const {
    MissingRequiredParameterError
  } = require('../errors');

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
module.exports.register = (req, res) => {
    
    // Check parameters
    if (req.body.email == null || req.body.username == null || req.body.password == null) {
        throw new MissingRequiredParameterError({
            info: {
              body: ['email, username, password']
            }
          });
    }

    User.find({
        $or: [{email: req.body.email}, { username: req.body.username }]
    }, (err, result) => {
        // Check if email or username already exist
        if (result == '') {
            // bcrypt password and create new user
            bcrypt.hash(req.body.password, 5, (err, bcryptedPassword) => {
                const user = new User(req.body);
                user.password = bcryptedPassword;
                user.isAdmin = false;
                user.friend = [];
                user.save((err, user) => {
                    if (err) {
                        return res.status(500).json({
                            message: 'cannot add user',
                            error: err,
                            code: 'cant_add_user'
                        });
                    }
                    res.status(201).json(user);
                });
            });
        } else {
            return res.status(409).json({
                message: `email ${req.body.email} or user ${req.body.username} already exist`,
                code: 'email_username_already_used'
            });
        }
    });
};