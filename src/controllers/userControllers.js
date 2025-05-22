import User from '../models/userModels.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Generate Access & Refresh Tokens
const generateToken = (id) => {
    const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20d' });
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
    return { accessToken, refreshToken };
};

// Register Controller
const register = async (req, res) => {
    const { name, phone, email, password, address } = req.body;

    if (!name || !phone || !email || !password || !address) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingPhone = await User.findOne({ phone });
        const existingEmail = await User.findOne({ email });

        if (existingPhone) return res.status(400).json({ message: 'Phone already registered' });
        if (existingEmail) return res.status(400).json({ message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, phone, email, password: hashedPassword, address });
        const { accessToken, refreshToken } = generateToken(newUser._id);

        return res.status(201).json({
            message: 'User registered successfully',
            token: accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

// Login Controller
const login = async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: 'Phone and password are required' });
    }

    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Set session for web (EJS)
        req.session.userId = user._id;

        const { accessToken, refreshToken } = generateToken(user._id);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(200).json({
                message: 'Login successful',
                token: accessToken,
                refreshToken
            });
        } else {
            return res.redirect('/');
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

// Logout Controller
const logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

// Get Profile Controller
const getProfile = async (req, res) => {
    try {
        const userId = req.session?.userId || req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ message: 'Profile fetch failed', error: error.message });
    }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ message: 'User found', userId: user._id });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ message: 'Forgot password failed', error: error.message });
    }
};

// Verify Phone Controller
const verifyPhone = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ message: 'Phone verified', userId: user._id });
    } catch (error) {
        console.error('Verify phone error:', error);
        return res.status(500).json({ message: 'Phone verification failed', error: error.message });
    }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) return res.status(400).json({ message: 'All fields are required' });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: 'Password reset failed', error: error.message });
    }
};

// Optional Script to Update Users Missing Names
const updateUsersWithoutNames = async () => {
    try {
        await User.updateMany(
            { name: { $exists: false } },
            { $set: { name: 'Not provided' } }
        );
        console.log('Users updated successfully');
    } catch (error) {
        console.error('Update users error:', error);
    }
};

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    verifyPhone,
    resetPassword,
    updateUsersWithoutNames
};
