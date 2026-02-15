// ============================================
// USER MODEL
// - Stores registered users with phone number
// - Used for login/signup authentication
// ============================================
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // User's display name (shown in chat)
    name: {
        type: String,
        required: true,
        trim: true        // Remove extra spaces
    },

    // Phone number (used as unique login ID)
    phone: {
        type: String,
        required: true,
        unique: true,      // No two users can have the same phone
        trim: true
    },

    // Simple password for demo (in production, use bcrypt hashing!)
    password: {
        type: String,
        required: true
    },

    // Profile avatar color (randomly assigned on signup)
    avatarColor: {
        type: String,
        default: '#00a884'
    },

    // Account creation timestamp
    created_at: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
