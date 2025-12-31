const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerRouter = express.Router();

const spec = swaggerJSDoc({
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Mini User Management System API',
			version: '1.0.0',
		},
		servers: [{ url: '/'}],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
	},
	apis: [],
});

swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(spec));

module.exports = { swaggerRouter };
