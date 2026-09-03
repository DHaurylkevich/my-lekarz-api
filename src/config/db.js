const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");
const NODE_ENV = process.env.NODE_ENV || "development";
logger.info(NODE_ENV);

const config = {
    url: NODE_ENV === "test" ? process.env.POSTGRES_URL_TEST : process.env.POSTGRES_PRISMA_URL || null,
    username: process.env.POSTGRES_USER || "root",
    password: process.env.POSTGRES_PASSWORD || null,
    database: process.env.POSTGRES_DATABASE || "mylekarz",
    host: process.env.POSTGRES_HOST || "localhost",
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: (msg) => {
        if (msg.includes('ERROR')) {
            logger.error(msg);
        }
    }
};

let sequelize
if (config.url) {
    sequelize = new Sequelize(config.url, config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, {
        ...config,
        logging: (msg) => {
            if (msg.includes('ERROR')) {
                logger.error(msg);
            }
        },
    });
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