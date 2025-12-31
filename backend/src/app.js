const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler, notFoundHandler } = require('./middleware/errors');
const { authRouter } = require('./routes/auth');
const { usersRouter } = require('./routes/users');
const { adminUsersRouter } = require('./routes/adminUsers');
const { swaggerRouter } = require('./routes/swagger');

function createApp() {
	const app = express();

	app.use(helmet());
	if (process.env.NODE_ENV !== 'test') {
		app.use(morgan('dev'));
	}

	app.use(
		cors({
			origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || true,
			credentials: true,
		}),
	);
	app.use(express.json());
	app.use(cookieParser());

	app.get('/health', (req, res) => res.json({ ok: true }));

	app.use('/api/docs', swaggerRouter);
	app.use('/api/auth', authRouter);
	app.use('/api/users', usersRouter);
	app.use('/api/admin/users', adminUsersRouter);

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}

module.exports = { createApp };
