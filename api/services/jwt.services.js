// Imports
const jwt = require('jsonwebtoken');
const {
    token: config
} = require('../config');
const crypto = require('crypto');
const RefreshToken = require('../models/refreshToken');
const User = require('../models/user');

// Exported functions
module.exports = {

    generateTokenForUser: (userData) => {
        const accessToken = jwt.sign({
                userId: userData.id,
                isAdmin: userData.isAdmin
            },
            config.accessToken.secret, {
                expiresIn: config.accessToken.expiresIn
            }
        );
        const refreshToken = crypto.randomBytes(128).toString('base64');
        const newRefreshToken = new RefreshToken({
            userId: userData.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + config.refreshToken.expiresIn)
        });
        return {
            accessToken,
            newRefreshToken
        };
    },

    parseAuthorization: (authorization) => {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },

    getUserId: (authorization) => {
        var userId = -1;
        var isAdmin = false;
        const token = this.parseAuthorization(authorization);
        if (token != null) {
            try {
                var jwtToken = jwt.verify(token, config.accessToken.secret);
                if (jwtToken != null) {
                    userId = jwtToken.userId;
                    isAdmin = jwtToken.isAdmin;
                }
            } catch (err) {
                console.log('getUserId error');
            }
        }
        return {
            userId,
            isAdmin
        };
    },

    refreshToken: (accessToken) => {
        const token = accessToken.token;
        const oldRefreshToken = accessToken.refreshToken;
        if (!token) {
            return res.status(400).json({
                'error': 'missing parameters - token required'
            });
        }

        if (oldRefreshToken.expiresAt < new Date()) {
            return res.status(401).json({
                'error': `Refresh Token expired`
            });
        }

        User.find({
                _id: accessToken.userId
            })
            .exec()
            .then((user) => {
                const newRefreshToken = this.generateTokenForUser(user);
                RefreshToken.findByIdAndUpdate(req.userId, {
                        userId: userData.id,
                        token: newRefreshToken,
                        expiresAt: new Date(Date.now() + config.refreshToken.expiresIn)
                    },
                    (err, refreshToken) => {
                        if (err) {
                            return res.status(401).json({
                                message: 'Invalid Token',
                                error: err
                            });
                        } else {
                            return newRefreshToken;
                        }
                    });
            })
            .catch(err => res.status(500).json({
                message: `Token user with id ${userData.userId} not found`,
                error: err
            }));
    }
};