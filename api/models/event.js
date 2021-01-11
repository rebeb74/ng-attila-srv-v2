const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: String,
    title: String,
    description: String,
    startTime: { type: Date },
    startHour: String,
    place: String,
    alert: { type: Date },
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('event', eventSchema);