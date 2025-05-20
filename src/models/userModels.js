import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^\d{10}$/, 'Phone number must be 10 digits long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Set up a pre-save hook to update the updatedAt field
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the model
export default User;
