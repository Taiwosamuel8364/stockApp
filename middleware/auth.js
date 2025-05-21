const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Found token in Authorization header:', token.substring(0, 20) + '...');
        }

        // If no token found, return unauthorized
        if (!token) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        try {
            // Verify token
            console.log('Using JWT_SECRET:', process.env.JWT_SECRET ? 'JWT_SECRET is set' : 'JWT_SECRET is missing');
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Successfully decoded token:', decoded);

            // Get user from database
            const user = await User.findById(decoded.id).select('-password');
            console.log('Found user:', user ? 'User exists' : 'User not found');

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Add user info to request
            req.user = {
                id: user._id,
                username: user.username,
                email: user.email
            };

            console.log('Authentication successful for user:', user.username);
            next();
        } catch (err) {
            console.error('Token verification error:', err);
            console.error('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
            return res.status(401).json({ 
                message: 'Invalid token',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
