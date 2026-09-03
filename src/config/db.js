const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");
const NODE_ENV = process.env.NODE_ENV || "development";
logger.info(NODE_ENV);

const url = NODE_ENV === "test" ? process.env.POSTGRES_URL_TEST : process.env.POSTGRES_PRISMA_URL || null;

const config = {
    url,
    username: process.env.POSTGRES_USER || "root",
    password: process.env.POSTGRES_PASSWORD || null,
    database: process.env.POSTGRES_DATABASE || "mylekarz",
    host: process.env.POSTGRES_HOST || "localhost",
    dialect: "postgres",
    logging: (msg) => {
        if (msg.includes('ERROR')) {
            logger.error(msg);
        }
    }
};

const isRemoteUrl = url && !/localhost|127\.0\.0\.1/.test(url);
const useSSL = Boolean(isRemoteUrl) || process.env.DB_SSL === "true";

const connectionOptions = {
    ...config,
    dialectOptions: useSSL
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
        : undefined,
};

let sequelize;
if (url) {
    sequelize = new Sequelize(url, connectionOptions);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, connectionOptions);
}

(async () => {
    try {
        await sequelize.authenticate()
        logger.info("Database connected");
        if (process.env.DB_SYNC === "true") {
            logger.info("Добавление/Обноаление данных...");
            await sequelize.sync({ alter: true });

            logger.info("Начальные данные добавлены/обновлены");
        }
    } catch (err) {
        logger.error("Error database connect:", err);
    }
})();

module.exports = sequelize;
