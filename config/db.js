const harperive = require('harperive');

const DB_CONFIG = {
  harperHost: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
};

const Client = harperive.Client;
const db = new Client(DB_CONFIG);

module.exports = db;