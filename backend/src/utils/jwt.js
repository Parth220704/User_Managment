const jwt = require('jsonwebtoken');

function signToken(payload) {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is required');
	}
	return jwt.sign(payload, secret, {
		expiresIn: process.env.JWT_EXPIRES_IN || '7d',
	});
}

function verifyToken(token) {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is required');
	}
	return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
