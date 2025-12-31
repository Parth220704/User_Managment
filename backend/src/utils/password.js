const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

async function hashPassword(plainTextPassword) {
	return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

async function verifyPassword(plainTextPassword, passwordHash) {
	return bcrypt.compare(plainTextPassword, passwordHash);
}

module.exports = { hashPassword, verifyPassword };
