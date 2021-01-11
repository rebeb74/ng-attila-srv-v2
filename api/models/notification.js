const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    notificationUserId: String,
    code: String,
    read: Boolean,
    senderUserId: String,
    senderUsername: String,
    senderEmail: String,
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('notification', notificationSchema);