const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'replied'],
        default: 'unread'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);