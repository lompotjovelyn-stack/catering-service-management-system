const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;

        if (!token) {
            return res.status(401).json({ message: 'Authentication token required' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(payload.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid or inactive user' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to access this resource' });
        }

        next();
    };
}

module.exports = {
    authenticate,
    authorize
};
