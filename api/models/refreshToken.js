const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: String,
    token: String,
    expiresAt: { type: Date }
});

module.exports = mongoose.model('refreshToken', refreshTokenSchema);
