const mongoose = require('mongoose');

const USER_ROLES = ['admin', 'user'];
const USER_STATUSES = ['active', 'inactive'];

const userSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: USER_ROLES, default: 'user', required: true },
		status: { type: String, enum: USER_STATUSES, default: 'active', required: true },
		lastLoginAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

function toSafeUser(userDoc) {
	return {
		id: userDoc._id.toString(),
		fullName: userDoc.fullName,
		email: userDoc.email,
		role: userDoc.role,
		status: userDoc.status,
		createdAt: userDoc.createdAt,
		updatedAt: userDoc.updatedAt,
		lastLoginAt: userDoc.lastLoginAt,
	};
}

const User = mongoose.model('User', userSchema);

module.exports = { User, USER_ROLES, USER_STATUSES, toSafeUser };
