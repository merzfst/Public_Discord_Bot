const mysql = require("mysql2/promise");
const config = require("../config.json");

const pool = mysql.createPool({
  host: config.hostMYSQL,
  user: config.userMYSQL,
  password: config.passwordMYSQL,
  database: config.databaseMYSQL,
});

module.exports = pool;
