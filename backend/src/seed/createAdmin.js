const { User } = require('../models/User');
const { hashPassword } = require('../utils/password');

async function ensureAdmin({ email, fullName, password }) {
	const existing = await User.findOne({ email });
	if (existing) {
		if (existing.role !== 'admin') {
			existing.role = 'admin';
			await existing.save();
		}
		return existing;
	}

	const passwordHash = await hashPassword(password);
	return User.create({ fullName, email, passwordHash, role: 'admin', status: 'active' });
}

module.exports = { ensureAdmin };
