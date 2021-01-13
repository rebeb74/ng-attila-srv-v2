const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    isAdmin: Boolean,
    birthdate: String,
    lang: String,
    share: [{
        id: String,
        email: String,
        username: String,
    }],
    isShared: [{
        id: String,
        email: String,
        username: String
    }],
    createdOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    }
});

// userSchema.pre('save', async function(next){
//     if (this.isNew || this.isModified('password')) this.password = await bcrypt.hash(this.password, 5)
//     next()
//   })

module.exports = mongoose.model('user', userSchema);