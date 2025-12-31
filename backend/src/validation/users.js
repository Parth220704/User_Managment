const { z } = require('zod');

const { emailSchema, passwordSchema } = require('./auth');

const updateMeSchema = z
	.object({
		fullName: z.string().min(1).max(100).optional(),
		email: emailSchema.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: passwordSchema,
});

module.exports = { updateMeSchema, changePasswordSchema };
