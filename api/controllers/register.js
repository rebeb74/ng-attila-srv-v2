const User = require('../models/user');
const bcrypt = require('bcryptjs');
const {
    MissingRequiredParameterError
  } = require('../errors');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,15}$/;

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

    // Check username length
    if (req.body.username.length >= 12 || req.body.username.length <= 3) {
        return res.status(400).json({
            'error': 'wrong username (must be length 3 - 12)'
        });
    }

    // Validate email
    if (!EMAIL_REGEX.test(req.body.email)) {
        return res.status(400).json({
            'error': 'email is not valid'
        });
    }
    
    // validate password
    if (!PASSWORD_REGEX.test(req.body.password)) {
        return res.status(400).json({
            'error': 'password invalid (must length 4-15 and include 1 number)'
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
                user.share = [];
                user.save((err, user) => {
                    if (err) {
                        return res.status(500).json({
                            message: 'cannot add user',
                            error: err
                        });
                    }
                    res.status(201).json(user);
                });
            });
        } else {
            return res.status(409).json({
                message: `email ${req.body.email} or user ${req.body.username} already exist`
            });
        }
    });
};