const { z } = require('zod');

const emailSchema = z.string().email();

const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(/[A-Z]/, 'Password must include an uppercase letter')
	.regex(/[a-z]/, 'Password must include a lowercase letter')
	.regex(/[0-9]/, 'Password must include a number');

const signupSchema = z.object({
	fullName: z.string().min(1).max(100),
	email: emailSchema,
	password: passwordSchema,
});

const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1),
});

module.exports = { signupSchema, loginSchema, passwordSchema, emailSchema };
