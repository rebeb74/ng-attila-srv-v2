const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    userId: String,
    email: String,
    username: String,
});

const eventSchema = new mongoose.Schema({
    userId: String,
    title: String,
    description: String,
    startTime: String,
    startHour: String,
    place: String,
    alert: String,
    repeat: String,
    altern: friendSchema | '',
    type: 'meeting' | 'task',
    createdOn: String,
    updatedOn: String
});

module.exports = mongoose.model('event', eventSchema);
