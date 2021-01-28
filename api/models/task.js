const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: String,
    title: String,
    description: String,
    startTime: { type: Date },
    repeat: String,
    altern: String,
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('task', taskSchema);
