const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    notificationUserId: String,
    notificationUsername: String,
    notificationUserEmail: String,
    code: String,
    read: Boolean,
    senderUserId: String,
    senderUsername: String,
    senderEmail: String,
    createdOn: String
});

module.exports = mongoose.model('notification', notificationSchema);