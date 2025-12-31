require('dotenv').config();

const { connectToDatabase } = require('./utils/db');
const { ensureAdmin } = require('./seed/createAdmin');

async function run() {
	await connectToDatabase();
	const email = process.env.SEED_ADMIN_EMAIL;
	const fullName = process.env.SEED_ADMIN_FULLNAME;
	const password = process.env.SEED_ADMIN_PASSWORD;

	if (email && fullName && password) {
		await ensureAdmin({ email, fullName, password });
		// eslint-disable-next-line no-console
		console.log('Seeded admin user (if needed).');
	}
}

run().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exit(1);
});
