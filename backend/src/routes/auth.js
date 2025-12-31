const express = require('express');

const { User, toSafeUser } = require('../models/User');
const { validateBody } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { signupSchema, loginSchema } = require('../validation/auth');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

const authRouter = express.Router();

authRouter.post('/signup', validateBody(signupSchema), async (req, res, next) => {
	try {
		const { fullName, email, password } = req.body;

		const existing = await User.findOne({ email });
		if (existing) {
			return res
				.status(409)
				.json({ error: { code: 'EMAIL_IN_USE', message: 'Email already registered' } });
		}

		const passwordHash = await hashPassword(password);
		const user = await User.create({ fullName, email, passwordHash, role: 'user', status: 'active' });

		const token = signToken({ sub: user._id.toString(), role: user.role });
		return res.status(201).json({ token, user: toSafeUser(user) });
	} catch (err) {
		return next(err);
	}
});

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
		}
		if (user.status !== 'active') {
			return res.status(403).json({ error: { code: 'INACTIVE_ACCOUNT', message: 'Account inactive' } });
		}

		const ok = await verifyPassword(password, user.passwordHash);
		if (!ok) {
			return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
		}

		user.lastLoginAt = new Date();
		await user.save();

		const token = signToken({ sub: user._id.toString(), role: user.role });
		return res.json({ token, user: toSafeUser(user) });
	} catch (err) {
		return next(err);
	}
});

authRouter.get('/me', requireAuth, async (req, res) => {
	return res.json({ user: toSafeUser(req.user) });
});

// JWT logout is client-side (delete token). Endpoint included to match spec.
authRouter.post('/logout', (req, res) => {
	return res.status(204).send();
});

module.exports = { authRouter };
