const { User } = require('../models/User');
const { verifyToken } = require('../utils/jwt');

function getTokenFromRequest(req) {
	const header = req.headers.authorization;
	if (header && header.toLowerCase().startsWith('bearer ')) {
		return header.slice(7).trim();
	}
	if (req.cookies && req.cookies.token) {
		return req.cookies.token;
	}
	return null;
}

async function requireAuth(req, res, next) {
	try {
		const token = getTokenFromRequest(req);
		if (!token) {
			return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing token' } });
		}

		const decoded = verifyToken(token);
		const user = await User.findById(decoded.sub);
		if (!user) {
			return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid token' } });
		}
		if (user.status !== 'active') {
			return res.status(403).json({ error: { code: 'INACTIVE_ACCOUNT', message: 'Account inactive' } });
		}

		req.user = user;
		return next();
	} catch (err) {
		return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid token' } });
	}
}

function requireRole(role) {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing user' } });
		}
		if (req.user.role !== role) {
			return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient role' } });
		}
		return next();
	};
}

module.exports = { requireAuth, requireRole, getTokenFromRequest };
