const harperive = require('harperive');
// interesting choice, why did you decide to go with harperive for a local db?

const DB_CONFIG = {
  harperHost: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
};

const Client = harperive.Client;
const db = new Client(DB_CONFIG);

module.exports = db;