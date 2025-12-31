const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { createApp } = require('../src/app');
const { connectToDatabase, disconnectFromDatabase } = require('../src/utils/db');

let mongo;
let app;

jest.setTimeout(30000);

beforeAll(async () => {
	process.env.NODE_ENV = 'test';
	process.env.JWT_SECRET = 'test-secret';
	process.env.JWT_EXPIRES_IN = '1h';
	process.env.CORS_ORIGIN = 'http://localhost:5173';

	mongo = await MongoMemoryServer.create();
	await connectToDatabase(mongo.getUri());
	app = createApp();
});

afterAll(async () => {
	await disconnectFromDatabase();
	if (mongo) await mongo.stop();
});

test('signup returns token and safe user', async () => {
	const res = await request(app)
		.post('/api/auth/signup')
		.send({
			fullName: 'Test User',
			email: 'test@example.com',
			password: 'StrongPass1',
		});

	expect(res.status).toBe(201);
	expect(res.body.token).toBeTruthy();
	expect(res.body.user.email).toBe('test@example.com');
	expect(res.body.user.passwordHash).toBeUndefined();
});

test('login rejects invalid credentials', async () => {
	await request(app).post('/api/auth/signup').send({
		fullName: 'Another User',
		email: 'another@example.com',
		password: 'StrongPass1',
	});

	const res = await request(app)
		.post('/api/auth/login')
		.send({ email: 'another@example.com', password: 'WrongPass1' });

	expect(res.status).toBe(401);
	expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
});

test('me returns current user when authorized', async () => {
	await request(app).post('/api/auth/signup').send({
		fullName: 'Me User',
		email: 'me@example.com',
		password: 'StrongPass1',
	});
	const login = await request(app)
		.post('/api/auth/login')
		.send({ email: 'me@example.com', password: 'StrongPass1' });

	const token = login.body.token;
	const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

	expect(res.status).toBe(200);
	expect(res.body.user.email).toBe('me@example.com');
});
