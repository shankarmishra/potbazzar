import User from '../models/userModels.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Helper: Generate JWT tokens
const generateToken = (id) => {
    const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '20d',
    });

    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '30d',
    });

    return { accessToken, refreshToken };
};

// Register a new user
const register = async (req, res) => {
    const { name, phone, email, password, address } = req.body;

    if (!name || !phone || !email || !password || !address) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, phone, email, password: hashedPassword, address });
        await newUser.save();

        const { accessToken, refreshToken } = generateToken(newUser._id);

        return res.status(201).json({
            message: 'User registered successfully',
            token: accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// Login user
const login = async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: 'Phone and password are required' });
    }

    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register first.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateToken(user._id);

        return res.status(200).json({
            message: 'Login successful',
            user,
            token: accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        return res.status(200).json({ user });

    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ message: 'Server error while fetching profile', error: error.message });
    }
};

// Forgot Password - Step 1: Check if user exists
const forgotPassword = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register first.' });
        }

        return res.status(200).json({
            message: 'User found. You can now set a new password.',
            userId: user._id
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ message: 'Server error during forgot password', error: error.message });
    }
};

// Phone verification before password reset
const verifyPhone = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register first.' });
        }

        return res.status(200).json({
            message: 'Phone number verified. You can now reset your password.',
            userId: user._id
        });

    } catch (error) {
        console.error('Verify phone error:', error);
        return res.status(500).json({ message: 'Server error during phone verification', error: error.message });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
        return res.status(400).json({ message: 'User ID and new password are required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: 'Server error during password reset', error: error.message });
    }
};

// Update users with missing names
const updateUsersWithoutNames = async () => {
    try {
        await User.updateMany(
            { name: { $exists: false } },
            { $set: { name: "Not provided" } }
        );
        console.log("Users updated successfully");
    } catch (error) {
        console.error("Error updating users:", error);
    }
};

// Call the update function (you might want to call this in a different context, like a script or a specific route)
// updateUsersWithoutNames();

export {
    register,
    login,
    getProfile,
    forgotPassword,
    resetPassword,
    verifyPhone
};
