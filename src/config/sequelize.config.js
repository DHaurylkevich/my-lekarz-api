require("dotenv").config();

const commonDialectOptions = {
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
};

module.exports = {
    development: {
        use_env_variable: "POSTGRES_PRISMA_URL",
        dialect: "postgres",
        dialectOptions: commonDialectOptions
    },
    test: {
        use_env_variable: "POSTGRES_URL_TEST",
        dialect: "postgres",
        dialectOptions: commonDialectOptions
    },
    production: {
        use_env_variable: "POSTGRES_PRISMA_URL",
        dialect: "postgres",
        dialectOptions: commonDialectOptions
    }
};