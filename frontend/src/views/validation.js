export function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function passwordStrengthError(password) {
	if (!password || password.length < 8) return 'Password must be at least 8 characters'
	if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter'
	if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter'
	if (!/[0-9]/.test(password)) return 'Password must include a number'
	return ''
}
