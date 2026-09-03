require('dotenv').config();
const express = require("express");
const app = express();
const passport = require('passport');
const sessionConfig = require('./src/config/session');
const { errorHandler } = require("./src/middleware/errorHandler");
const AppError = require("./src/utils/appError");
const logger = require("./src/utils/logger");
const { startCron, stopCron } = require("./src/utils/cron");
const swaggerDocs = require("./src/config/swagger");
const morgan = require("morgan");
const cors = require("cors");

require("./src/config/db");
startCron();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:5173',
    "https://doc-web-rose.vercel.app",
    "https://mojlekarz.netlify.app",
    "https://stellar-proximal-handspring.glitch.me",
    "https://nimble-manatee-0b5260.netlify.app",
    "https://accounts.google.com/o/oauth2/v2/auth"
  ],
  credentials: true,
  methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', 1);

app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());
require('./src/config/passport');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (req, res) => { res.send("Hello"); })
app.use("/", require("./src/routes"));

swaggerDocs(app);

app.use((req, res, next) => { next(new AppError("Not Found", 404)); });
app.use(errorHandler);

if (process.env.NODE_ENV === 'test') {
  module.exports = app;
}
const port = process.env.PORT || 5000;
const link = process.env.LINK || "http://localhost";

const server = app.listen(port, () => {
  logger.info(`The server start at: ${link}:${port}`)
  logger.info(`The documentation is available at: ${link}:${port}/api-docs`);
});

process.on('SIGINT', () => {
  stopCron();
  server.close(() => process.exit(0));
  process.exit();
});

process.on('SIGTERM', () => {
  stopCron();
  server.close(() => process.exit(0));
  process.exit();
});