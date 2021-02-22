const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    value: String,
    createdOn: String,
});

// const friendSchema = new mongoose.Schema({
//     userId: String,
//     email: String,
//     username: String,
// });

const checklistSchema = new mongoose.Schema({
    userId: String,
    checklistName: String,
    items: [ItemSchema] | [],
    friendShares: [{
        userId: String,
        email: String,
        username: String,
    }] | [],
    public: Boolean,
    createdOn: String
});

module.exports = mongoose.model('checklist', checklistSchema);
