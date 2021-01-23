const { Schema, model } = require('mongoose')


const socketSchema = new Schema({
    _id: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
    namespace: String,
    createdOn: {
        type: Date,
        default: Date.now()
    }
});


module.exports = model('Socket', socketSchema);