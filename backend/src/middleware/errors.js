function notFoundHandler(req, res) {
	return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
	const status = err.statusCode || err.status || 500;
	const code = err.code || 'INTERNAL_ERROR';
	const message = err.message || 'Something went wrong';

	if (process.env.NODE_ENV !== 'test') {
		// eslint-disable-next-line no-console
		console.error(err);
	}

	return res.status(status).json({ error: { code, message, details: err.details } });
}

module.exports = { notFoundHandler, errorHandler };
