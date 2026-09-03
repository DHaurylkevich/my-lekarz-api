const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MyLekarz API',
            version: '1.0.0',
            description: 'API Documentation for MyLekarz',
        },
        servers: [
            {
                url: '/api',
                description: 'API server (same origin)'
            }
        ],
        components: {
            securitySchemes: {
                CookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "connect.sid"
                }
            }
        },
    },
    apis: [
        path.resolve(__dirname, '../routes/*.js'),
    ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const AUTH_ROOT_PATHS = [
    '/login',
    '/register',
    '/logout',
    '/auth/google',
    '/auth/google/callback',
    '/forgot-password',
    '/set-password',
];

for (const p of AUTH_ROOT_PATHS) {
    const pathItem = swaggerDocs.paths && swaggerDocs.paths[p];
    if (!pathItem) continue;

    for (const op of Object.values(pathItem)) {
        if (op && typeof op === 'object') {
            op.servers = [{ url: '/', description: 'Auth endpoints (root, same origin)' }];
        }
    }
}

const swaggerSetupOptions = {
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
    swaggerOptions: {
        persistAuthorization: true,
    },
};

module.exports = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerSetupOptions));

    app.get('/swagger-ui-bundle.js', (req, res) => {
        res.sendFile(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'));
    });

    app.get('/swagger-ui-standalone-preset.js', (req, res) => {
        res.sendFile(require.resolve('swagger-ui-dist/swagger-ui-standalone-preset.js'));
    });

    app.get('/swagger-ui.css', (req, res) => {
        res.sendFile(require.resolve('swagger-ui-dist/swagger-ui.css'));
    });
};
