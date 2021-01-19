const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    isAdmin: Boolean,
    birthdate: String,
    lang: String,
    friend: [{
        userId: String,
        email: String,
        username: String,
    }],
    createdOn: {
        type: Date,
        default: Date.now()
    },
    updatedOn: {
        type: Date,
        default: Date.now()
    }
});


module.exports = mongoose.model('user', userSchema);