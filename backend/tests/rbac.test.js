const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { createApp } = require('../src/app');
const { connectToDatabase, disconnectFromDatabase } = require('../src/utils/db');
const { User } = require('../src/models/User');
const { hashPassword } = require('../src/utils/password');
const { signToken } = require('../src/utils/jwt');

let mongo;
let app;
let userToken;
let adminToken;

jest.setTimeout(30000);

beforeAll(async () => {
	process.env.NODE_ENV = 'test';
	process.env.JWT_SECRET = 'test-secret';
	process.env.JWT_EXPIRES_IN = '1h';

	mongo = await MongoMemoryServer.create();
	await connectToDatabase(mongo.getUri());
	app = createApp();

	const user = await User.create({
		fullName: 'User',
		email: 'user@example.com',
		passwordHash: await hashPassword('StrongPass1'),
		role: 'user',
		status: 'active',
	});
	const admin = await User.create({
		fullName: 'Admin',
		email: 'admin@example.com',
		passwordHash: await hashPassword('StrongPass1'),
		role: 'admin',
		status: 'active',
	});

	userToken = signToken({ sub: user._id.toString(), role: user.role });
	adminToken = signToken({ sub: admin._id.toString(), role: admin.role });
});

afterAll(async () => {
	await disconnectFromDatabase();
	if (mongo) await mongo.stop();
});

test('non-admin cannot list all users', async () => {
	const res = await request(app)
		.get('/api/admin/users?page=1&limit=10')
		.set('Authorization', `Bearer ${userToken}`);

	expect(res.status).toBe(403);
	expect(res.body.error.code).toBe('FORBIDDEN');
});

test('admin can list all users', async () => {
	const res = await request(app)
		.get('/api/admin/users?page=1&limit=10')
		.set('Authorization', `Bearer ${adminToken}`);

	expect(res.status).toBe(200);
	expect(Array.isArray(res.body.users)).toBe(true);
});

test('admin list can exclude self with consistent totals', async () => {
	const res = await request(app)
		.get('/api/admin/users?page=1&limit=10&excludeSelf=true')
		.set('Authorization', `Bearer ${adminToken}`);

	expect(res.status).toBe(200);
	const emails = res.body.users.map((u) => u.email);
	expect(emails).not.toContain('admin@example.com');
	expect(res.body.total).toBeGreaterThanOrEqual(res.body.users.length);
});

test('admin list can exclude all admins', async () => {
	const res = await request(app)
		.get('/api/admin/users?page=1&limit=10&excludeRole=admin')
		.set('Authorization', `Bearer ${adminToken}`);

	expect(res.status).toBe(200);
	expect(res.body.users.every((u) => u.role !== 'admin')).toBe(true);
});

test('inactive user cannot access protected route', async () => {
	const inactive = await User.create({
		fullName: 'Inactive',
		email: 'inactive@example.com',
		passwordHash: await hashPassword('StrongPass1'),
		role: 'user',
		status: 'inactive',
	});
	const inactiveToken = signToken({ sub: inactive._id.toString(), role: inactive.role });

	const res = await request(app)
		.get('/api/auth/me')
		.set('Authorization', `Bearer ${inactiveToken}`);

	expect(res.status).toBe(403);
	expect(res.body.error.code).toBe('INACTIVE_ACCOUNT');
});
