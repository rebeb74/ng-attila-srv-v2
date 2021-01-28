const mongoose = require('mongoose');


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
    createdOn: String,
    updatedOn: String,
    secretKey: String
});


module.exports = mongoose.model('user', userSchema);
