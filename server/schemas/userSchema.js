const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    calendars: {
        type: Array,
        default: []
    },
    refreshToken: {
        type: String,
        default: ''
    },
    createdAt: {
        required: true,
        type: Date,
        default: Date.now
    }
}, { collection: 'users' });

const User = model('User', userSchema);

module.exports = User;