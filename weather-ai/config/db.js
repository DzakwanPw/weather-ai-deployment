const { sequelize } = require("../models");

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil.");
  } catch (error) {
    console.error("Koneksi database gagal:", error.message);
    throw error;
  }
}

module.exports = connectDatabase;
