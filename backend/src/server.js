require('dotenv').config();

const http = require('node:http');

const { createApp } = require('./app');
const { connectToDatabase } = require('./utils/db');

const PORT = process.env.PORT || 5000;

async function start() {
	await connectToDatabase();
	const app = createApp();
	const server = http.createServer(app);

	server.listen(PORT, () => {
		// eslint-disable-next-line no-console
		console.log(`API listening on port ${PORT}`);
	});
}

start().catch((err) => {
	// eslint-disable-next-line no-console
	console.error('Failed to start server:', err);
	process.exit(1);
});
