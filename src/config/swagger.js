const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// The API's dev origin is dynamic: index.js listens on PORT (default 5000)
// and builds links from LINK (default http://localhost). Mirror that logic
// here so "Try it out" always targets the running server.
const devBase = `${process.env.LINK || "http://localhost"}:${process.env.PORT || 5000}`;
const prodBase = "https://doc-web-rose.vercel.app";

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
                // Most routers are mounted under /api, so annotated paths like
                // /appointments resolve to {server}/appointments.
                url: `${devBase}/api`,
                description: "Development server"
            },
            {
                url: `${prodBase}/api`,
                description: "Production server"
            }
        ],
        components: {
            securitySchemes: {
                // The API authenticates with express-session/passport. The
                // session cookie is named "connect.sid". Once you log in via
                // POST /login (or the Google callback) in the same browser
                // origin, the cookie is sent automatically - Swagger UI only
                // needs to be opened on the API host itself.
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

// The auth router is mounted at the root (not under /api), so its operations
// must point at the origin without the /api suffix.
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
            op.servers = [
                { url: devBase, description: "Development server" },
                { url: prodBase, description: "Production server" }
            ];
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
