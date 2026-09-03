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
                url: "http://localhost:5000/api",
                description: "Development server"
            },
            {
                url: "https://doc-web-rose.vercel.app/api",
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
