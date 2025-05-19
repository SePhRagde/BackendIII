import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pet Adoption API',
            version: '1.0.0',
            description: 'API for pet adoption system',
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['first_name', 'last_name', 'email', 'password'],
                    properties: {
                        first_name: {
                            type: 'string',
                            description: 'User first name'
                        },
                        last_name: {
                            type: 'string',
                            description: 'User last name'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'User password'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            description: 'User role'
                        },
                        pets: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Array of pet IDs owned by the user'
                        }
                    }
                },
                Pet: {
                    type: 'object',
                    required: ['name', 'species', 'breed', 'age'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Pet name'
                        },
                        species: {
                            type: 'string',
                            enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster'],
                            description: 'Pet species'
                        },
                        breed: {
                            type: 'string',
                            description: 'Pet breed'
                        },
                        age: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 15,
                            description: 'Pet age in years'
                        },
                        description: {
                            type: 'string',
                            description: 'Pet description'
                        },
                        image: {
                            type: 'string',
                            format: 'uri',
                            description: 'URL to pet image'
                        },
                        adopted: {
                            type: 'boolean',
                            description: 'Whether the pet is adopted'
                        },
                        owner: {
                            type: 'string',
                            description: 'ID of the pet owner'
                        }
                    }
                },
                Adoption: {
                    type: 'object',
                    required: ['pet', 'user'],
                    properties: {
                        pet: {
                            type: 'string',
                            description: 'ID of the pet being adopted'
                        },
                        user: {
                            type: 'string',
                            description: 'ID of the user adopting the pet'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'approved', 'rejected'],
                            description: 'Adoption request status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Adoption request creation date'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['error'],
                            description: 'Error status'
                        },
                        code: {
                            type: 'string',
                            description: 'Error code'
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.js'], // Path to the API routes
};

export const specs = swaggerJsdoc(options); 