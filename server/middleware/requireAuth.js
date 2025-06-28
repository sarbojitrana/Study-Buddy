const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).lean();

        if (!user) {
            return res.redirect('/auth/login');
        }

        req.user = user; // 🔥 Attach full user (with username/email) here
        next();
    } catch (err) {
        console.error('Auth Error:', err);
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
};
