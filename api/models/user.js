const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    userId: String,
    email: String,
    username: String,
});

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    isAdmin: Boolean,
    birthdate: String,
    lang: String,
    friend: {
        type: [friendSchema],
        default: undefined
    },
    createdOn: String,
    updatedOn: String,
    secretKey: String
});


module.exports = mongoose.model('user', userSchema);
