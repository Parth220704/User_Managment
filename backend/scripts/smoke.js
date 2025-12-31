/* eslint-disable no-console */

const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const { createApp } = require('../src/app');
const { connectToDatabase, disconnectFromDatabase } = require('../src/utils/db');
const { User } = require('../src/models/User');
const { hashPassword } = require('../src/utils/password');
const { signToken } = require('../src/utils/jwt');

async function run() {
	process.env.NODE_ENV = 'test';
	process.env.JWT_SECRET = 'smoke-secret';
	process.env.JWT_EXPIRES_IN = '1h';

	const mongo = await MongoMemoryServer.create();
	await connectToDatabase(mongo.getUri());
	const app = createApp();

	const admin = await User.create({
		fullName: 'Admin',
		email: 'admin@example.com',
		passwordHash: await hashPassword('StrongPass1'),
		role: 'admin',
		status: 'active',
	});
	const adminToken = signToken({ sub: admin._id.toString(), role: 'admin' });

	// Signup
	const signup = await request(app).post('/api/auth/signup').send({
		fullName: 'User One',
		email: 'user1@example.com',
		password: 'StrongPass1',
	});
	if (signup.status !== 201) throw new Error(`signup failed: ${signup.status}`);
	if (!signup.body.token || !signup.body.user?.id) throw new Error('signup response shape invalid');

	// Login
	const login = await request(app).post('/api/auth/login').send({
		email: 'user1@example.com',
		password: 'StrongPass1',
	});
	if (login.status !== 200) throw new Error(`login failed: ${login.status}`);

	// Profile update
	const token = login.body.token;
	const update = await request(app)
		.put('/api/users/me')
		.set('Authorization', `Bearer ${token}`)
		.send({ fullName: 'User One Updated' });
	if (update.status !== 200) throw new Error(`profile update failed: ${update.status}`);

	// Admin list
	const list = await request(app)
		.get('/api/admin/users?page=1&limit=10')
		.set('Authorization', `Bearer ${adminToken}`);
	if (list.status !== 200) throw new Error(`admin list failed: ${list.status}`);
	if (!Array.isArray(list.body.users)) throw new Error('admin list response shape invalid');

	// Admin deactivate user
	const targetId = signup.body.user.id;
	const deact = await request(app)
		.patch(`/api/admin/users/${targetId}/deactivate`)
		.set('Authorization', `Bearer ${adminToken}`);
	if (deact.status !== 200) throw new Error(`deactivate failed: ${deact.status}`);

	// Deactivated user should be blocked
	const meBlocked = await request(app)
		.get('/api/auth/me')
		.set('Authorization', `Bearer ${token}`);
	if (meBlocked.status !== 403) throw new Error(`inactive user should be blocked; got ${meBlocked.status}`);

	console.log('SMOKE OK');
	await disconnectFromDatabase();
	await mongo.stop();
}

run().catch((err) => {
	console.error('SMOKE FAILED:', err);
	process.exit(1);
});
