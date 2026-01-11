// middleware/auth.js
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.session.userId && req.session.role === 'admin') {
        return next();
    }
    res.status(403).send('Access Denied: Admin only');
};

const isGuest = (req, res, next) => {
    if (!req.session.userId) {
        return next();
    }
    res.redirect('/dashboard');
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isGuest
};
