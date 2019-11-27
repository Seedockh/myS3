require('dotenv').config(
  { path: process.env.NODE_ENV==='test' ? `${__dirname}/.env.testing` : `${__dirname}/.env.dev` }
)

module.exports = {
   "type": "postgres",
   "host": process.env.DB_HOST,
   "port": process.env.DB_PORT,
   "username": process.env.DB_USER,
   "password": process.env.DB_PASSWORD,
   "database": process.env.DB_DATABASE,
   "synchronize": process.env.NODE_ENV==='test',
   //"dropSchema": process.env.NODE_ENV==='test',
   "logging": false,
   "entities": [
      "src/entity/**/*.ts"
   ],
   "migrations": [
      "src/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
};
