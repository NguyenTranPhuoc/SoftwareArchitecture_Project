// NEW FILE: Replaces common/src/db/mongoose.js
const { Sequelize } = require("sequelize");
const config = require("../config");

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.pass,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: false, // Disable SQL logging
  }
);

async function connect() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully.");
    return sequelize;
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:", error);
    process.exit(1);
  }
}

module.exports = { connect, sequelize, Sequelize };
