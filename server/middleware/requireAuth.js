const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const requireAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        res.redirect('/login');
    }
};

module.exports = requireAuth;
