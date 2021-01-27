const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    title: String,
    description: String,
    startTime: String,
    startHour: String,
    place: String,
    alert: String,
    repeat: String,
    altern: String,
    type: 'meeting' | 'task',
    createdOn: String,
    updatedOn: String
});

module.exports = mongoose.model('event', eventSchema);