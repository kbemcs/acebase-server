import { Express } from 'express';
import path = require('path');
import * as swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
// import config from '../config';

const yamlPath = path.resolve(__dirname, '../../src/routes/*.yaml'); // (coming from dist/routes/docs.js)
// console.log(`Using path ${yamlPath} for Swagger documentation`);

export const addRoute = (app: Express) => {
    // Generate docs from all yaml files
    const options:swaggerJsdoc.Options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'AceBase Server API',
                description: 'AceBase Server API',
                version: '1.0.0',
                contact: {
                    name: 'Ewout Stortenbeker',
                    email: 'me@appy.one'
                },
                // servers: [`http://${config.server.host}:${config.server.port}`]
            },
            tags: [{
                name: 'auth',
                description: 'User authentication endpoints'
            }, {
                name: 'oauth2',
                description: 'User authentication using 3rd party OAuth2 providers'
            }, {
                name: 'data',
                description: 'Data manipulation and query endpoints'
            }],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'token' // switch to JWT in the future?
                    }
                },
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            uid: { type: 'string', example: 'jpx0k53u0002ecr7s354c51l' },
                            username: { type: 'string', example: 'someuser' },
                            email: { type: 'string', example: 'email@domain.com' },
                            displayName: { type: 'string', example: 'Some User' },
                            picture: { 
                                type: 'object', 
                                properties: {
                                    width: { type: 'number', example: 500 },
                                    height: { type: 'number', example: 500 },
                                    url: { type: 'string', example: 'https://profile.pic/user.jpg' }
                                }
                            },
                            emailVerified: { type: 'boolean', example: true },
                            created: { type: 'string', example: '2022-03-09T15:38:57.361Z' },
                            prevSignin: { type: 'string', example: '2022-03-09T15:38:57.361Z' },
                            prevSigninIp: { type: 'string', example: '127.0.0.1' },
                            lastSignin: { type: 'string', example: '2022-03-09T15:38:57.361Z' },
                            lastSigninIp: { type: 'string', example: '127.0.0.1' },
                            changePassword: { type: 'boolean', example: false },
                            changePasswordRequested: { type: 'boolean', example: false },
                            changePasswordBefore: { type: 'string', example: '2022-03-09T15:38:57.361Z' },
                            settings: { type: 'object' }
                        }
                    },
                    Error: {
                        type: 'object',
                        properties: {
                            code: { type: 'string', description: 'error code', example: 'invalid_request' },
                            message: { type: 'string', description: 'The error message', example: 'Invalid request for this endpoint' }
                        }
                    },
                    UnexpectedError: {
                        type: 'object',
                        properties: {
                            code: { type: 'string', value: 'unexpected', description: 'The string `"unexpected"`' },
                            message: { type: 'string', description: 'The server error message' }
                        }
                    },
                    UnknownError: {
                        type: 'object',
                        properties: {
                            code: { type: 'string', value: 'unknown', description: 'The string `"unknown"`' },
                            message: { type: 'string', description: 'The server error message' }
                        }
                    },
                    SchemaValidationError: {
                        type: 'object',
                        properties: {
                            code: { type: 'string', value: 'schema_validation_failed', description: 'The string `"schema_validation_failed"`' },
                            message: { type: 'string', description: 'The server error message', example: 'Property at path "path/property" is of the wrong type' }
                        }
                    },
                    SerializedValue: {
                        type: 'object',
                        properties: {
                            val: {
                                description: 'Any value (serialized for transport)',
                                oneOf: [
                                    { type: 'string' },
                                    { type: 'number' },
                                    { type: 'integer' },
                                    { type: 'boolean' },
                                    { type: 'object' },
                                    { type: 'array' }
                                ],
                                example: '2022-04-07T16:36:21Z',
                                required: true
                            },
                            map: {
                                description: 'If the value has been serialized for transport, contains a string defining `val`s data type (eg `"date"` or `"binary"`), or an object with deep property mappings for an object value in `val`',
                                oneOf: [
                                    { type: 'string', example: 'date' },
                                    { type: 'object', example: { 'stats/created': 'date' } }
                                ],
                                example: 'date',
                                required: false
                            }
                        },
                        required: ['val'],
                        example: {
                            val: { name: 'My todo list', stats: { size: 216, created: '2022-04-07T15:11:42Z', modified: '2022-03-08T12:24:05Z' } },
                            map: { 'stats/created': 'date', 'stats/modified': 'date' } 
                        }
                    }
                }
            },
            security: [ 
                // Enable bearer auth globally
                { bearerAuth: [] } 
            ],
        },
        apis: [yamlPath]
    };

    const swaggerDocs = swaggerJsdoc(options);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

export default addRoute;