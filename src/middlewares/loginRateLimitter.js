const limitter = require('express-rate-limit');

const loginRateLimitter = limitter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 tries within 5 minutes max
    message: {
        access: false,
        tooManyAttempts: true,
        message: 'Too many login attempts. Please try again later.'
    },
    headers: true,
    onLimitReached: (req, res, options) => {
        const remainingTime = Math.ceil((options.windowMs - (Date.now() - options.startTime)) / 1000);
        res.status(429).json({ message: `Too many login attempts. Please try again in ${remainingTime} seconds.` });
    }
});

module.exports = loginRateLimitter;
