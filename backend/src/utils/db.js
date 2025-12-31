const mongoose = require('mongoose');

async function connectToDatabase(uri = process.env.MONGODB_URI) {
	if (!uri) {
		throw new Error('MONGODB_URI is required');
	}
	mongoose.set('strictQuery', true);
	await mongoose.connect(uri);
	return mongoose.connection;
}

async function disconnectFromDatabase() {
	await mongoose.disconnect();
}

module.exports = { connectToDatabase, disconnectFromDatabase };
