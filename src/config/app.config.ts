export const EnvConfiguration = ()=>({
    enviroment: process.env.NODE_ENV || 'dev',
    jwtSecret: process.env.JWT_SECRET, 
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbPassword: process.env.DB_PASSWORD,
    dbUsername: process.env.DB_USERNAME,
    seedExecuted: process.env.SEED_EXECUTED || true
});
