const express = require('express');

const { User, toSafeUser } = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { updateMeSchema, changePasswordSchema } = require('../validation/users');
const { hashPassword, verifyPassword } = require('../utils/password');

const usersRouter = express.Router();

usersRouter.get('/me', requireAuth, async (req, res) => {
	return res.json({ user: toSafeUser(req.user) });
});

usersRouter.put('/me', requireAuth, validateBody(updateMeSchema), async (req, res, next) => {
	try {
		const { fullName, email } = req.body;

		if (email && email !== req.user.email) {
			const existing = await User.findOne({ email });
			if (existing) {
				return res
					.status(409)
					.json({ error: { code: 'EMAIL_IN_USE', message: 'Email already registered' } });
			}
		}

		if (typeof fullName === 'string') req.user.fullName = fullName;
		if (typeof email === 'string') req.user.email = email;

		await req.user.save();
		return res.json({ user: toSafeUser(req.user) });
	} catch (err) {
		return next(err);
	}
});

usersRouter.put('/me/password', requireAuth, validateBody(changePasswordSchema), async (req, res, next) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const ok = await verifyPassword(currentPassword, req.user.passwordHash);
		if (!ok) {
			return res
				.status(400)
				.json({ error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } });
		}

		req.user.passwordHash = await hashPassword(newPassword);
		await req.user.save();
		return res.status(204).send();
	} catch (err) {
		return next(err);
	}
});

module.exports = { usersRouter };
