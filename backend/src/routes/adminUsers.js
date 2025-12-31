const express = require('express');
const mongoose = require('mongoose');

const { User, toSafeUser } = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');

const adminUsersRouter = express.Router();

adminUsersRouter.use(requireAuth);
adminUsersRouter.use(requireRole('admin'));

adminUsersRouter.get('/', async (req, res, next) => {
	try {
		const pageRaw = req.query.page ?? '1';
		const limitRaw = req.query.limit ?? '10';
		const excludeSelfRaw = req.query.excludeSelf ?? 'false';
		const excludeRoleRaw = req.query.excludeRole ?? '';
		const pageParsed = Number.parseInt(String(pageRaw), 10);
		const limitParsed = Number.parseInt(String(limitRaw), 10);
		const excludeSelf = String(excludeSelfRaw).toLowerCase() === 'true';
		const excludeRole = String(excludeRoleRaw).trim().toLowerCase();

		if (!Number.isFinite(pageParsed) || pageParsed < 1) {
			return res
				.status(400)
				.json({ error: { code: 'VALIDATION_ERROR', message: 'page must be a positive integer' } });
		}
		if (!Number.isFinite(limitParsed) || limitParsed < 1 || limitParsed > 100) {
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'limit must be an integer between 1 and 100',
				},
			});
		}

		const page = pageParsed;
		const limit = limitParsed;
		const skip = (page - 1) * limit;

		const filter = {};
		if (excludeSelf && req.user?._id) {
			filter._id = { $ne: req.user._id };
		}
		if (excludeRole) {
			filter.role = { $ne: excludeRole };
		}
		const [total, users] = await Promise.all([
			User.countDocuments(filter),
			User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
		]);

		return res.json({
			page,
			limit,
			total,
			users: users.map(toSafeUser),
		});
	} catch (err) {
		return next(err);
	}
});

adminUsersRouter.patch('/:id/activate', async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Invalid user id' } });
		}
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
		}
		user.status = 'active';
		await user.save();
		return res.json({ user: toSafeUser(user) });
	} catch (err) {
		return next(err);
	}
});

adminUsersRouter.patch('/:id/deactivate', async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Invalid user id' } });
		}
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
		}
		user.status = 'inactive';
		await user.save();
		return res.json({ user: toSafeUser(user) });
	} catch (err) {
		return next(err);
	}
});

module.exports = { adminUsersRouter };
