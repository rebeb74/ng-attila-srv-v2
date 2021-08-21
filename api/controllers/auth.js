const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
    BadCredentialsError,
    InvalidTokenError,
    ExpiredTokenError,
    MissingRequiredParameterError
} = require('../errors');
const {
    token: config
} = require('../config');
const RefreshToken = require('../models/refreshToken');
const User = require('../models/user');
const bcrypt = require('bcryptjs');


async function generateToken(user) {
    const accessToken = await jwt.sign({
            username: user.username,
            email: user.email
        },
        config.accessToken.secret, {
            expiresIn: config.accessToken.expiresIn / 1000,
            subject: user.id.toString()
        }
    );

    const refreshToken = crypto.randomBytes(128).toString('base64');
    const expiresAt =  new Date(Date.now() + config.refreshToken.expiresIn);
    console.log('expiresAt', expiresAt);
    const newRefreshToken = await new RefreshToken({
        userId: user.id,
        token: refreshToken,
        expiresAt: expiresAt
    });
    newRefreshToken.save();


    return {
        accessToken,
        refreshToken
    };
}

/**
 * Auth controller.
 * @module controllers/auth
 */

/**
 * Login controller.
 * @function login
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
module.exports.login = async (req, res, next) => {
    try {
        const {
            username,
            password
        } = req.body;
        if (!username) {
            throw new MissingRequiredParameterError({
                info: {
                    body: ['usename']
                }
            });
        }

        if (!password) {
            throw new MissingRequiredParameterError({
                info: {
                    body: ['password']
                }
            });
        }
        const users = await User.find().exec();
        var user = users.find((user) => user.username.toLowerCase() == username.toLowerCase());
        if (!!user) {
            var resBcrypt = await bcrypt.compare(password, user.password);
            if (!resBcrypt) {
                throw new BadCredentialsError({
                    message: 'username_password_invalid',
                    code: 'username_password_invalid'
                });
            } else {
                // Generate token
                const {
                    accessToken,
                    refreshToken
                } = await generateToken(user);

                await res.json({
                    user: {
                        _id: user._id,
                        email: user.email,
                        username: user.username,
                        lang: user.lang,
                        birthdate: user.birthdate,
                        createdOn: user.createdOn,
                        updatedOn: user.updatedOn,
                        friend: user.friend,
                    },
                    tokens: {
                        accessToken,
                        accessTokenExpiresIn: config.accessToken.expiresIn,
                        refreshToken,
                        refreshTokenExpiresIn: config.refreshToken.expiresIn,
                    }
                });
            }

        } else {
            throw new BadCredentialsError({
                message: 'username_password_invalid',
                code: 'username_password_invalid'
            });
        }


    } catch (err) {
        console.error('pass', err.stack);
        next(err);
    }
};

/**
 * Refresh token controller.
 * @function refreshToken
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
module.exports.refreshToken = async (req, res, next) => {
    try {
        const {
            token
        } = req.body;
        if (!token) {
            throw new MissingRequiredParameterError({
                info: {
                    body: ['token']
                }
            });
        }
        const oldRefreshToken = await RefreshToken.find({
            token: token
        }).exec();
        if (oldRefreshToken == '') {
            throw new InvalidTokenError();
        }

        if (oldRefreshToken.expiresAt < new Date()) {
            throw new ExpiredTokenError({
                info: {
                    expiresAt: oldRefreshToken.expiresAt
                }
            });
        }
        const user = await User.findById(oldRefreshToken[0].userId).exec();

        const {
            accessToken,
            refreshToken: newRefreshToken
        } = await generateToken(
            user
        );

        await RefreshToken.deleteOne({
            _id: oldRefreshToken[0]._id
        });

        res.json({
            accessToken,
            accessTokenExpiresIn: config.accessToken.expiresIn,
            refreshToken: newRefreshToken,
            refreshTokenExpiresIn: config.refreshToken.expiresIn
        });
    } catch (err) {
        next(err);
    }
};

module.exports.logout = async (req, res, next) => {
    try {
        const refreshToken = req.body.token;
        if (!refreshToken) {
            throw new MissingRequiredParameterError({
                info: {
                    body: ['token']
                }
            });
        }

        await RefreshToken.deleteOne({
            token: refreshToken
        });

        res.status(200).json({
            msg: 'logged out'
        });
    } catch (err) {
        next(err);
    }
};
