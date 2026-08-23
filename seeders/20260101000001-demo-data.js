'use strict';
const bcrypt = require('bcrypt');

const namaUser = ['Dzakwan', 'Rina', 'Fajar', 'Salsa', 'Bima'];

const daftarKota = [
  'Yogyakarta', 'Jakarta', 'Surabaya', 'Bandung', 'Medan',
  'Semarang', 'Malang', 'Denpasar', 'Makassar', 'Palembang',
  'Tokyo', 'Singapore', 'London', 'Paris', 'New York',
  'Sydney', 'Dubai', 'Seoul', 'Bangkok', 'Kuala Lumpur'
];

const kondisiCuaca = [
  { desc: 'cerah', tempMin: 28, tempMax: 34, humidity: [40, 60] },
  { desc: 'berawan', tempMin: 24, tempMax: 30, humidity: [55, 75] },
  { desc: 'hujan ringan', tempMin: 22, tempMax: 27, humidity: [75, 90] },
  { desc: 'mendung', tempMin: 20, tempMax: 26, humidity: [65, 85] }
];

const templateRespon = [
  (kota, c) => `Hari ini cuaca di ${kota} ${c.desc}, suhunya cukup nyaman untuk beraktivitas di luar ruangan.`,
  (kota, c) => `${kota} sedang ${c.desc} dengan kelembapan yang lumayan tinggi, disarankan bawa payung bila keluar.`,
  (kota, c) => `Kondisi langit di ${kota} terlihat ${c.desc}. Cocok untuk jalan-jalan santai sore ini.`,
  (kota, c) => `Suhu di ${kota} terasa cukup ${c.tempMax > 30 ? 'panas' : 'sejuk'}, dengan kondisi ${c.desc} sepanjang hari.`
];

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDateWithinDays(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date;
}

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = namaUser.map((nama, i) => ({
      nama,
      email: `${nama.toLowerCase()}@example.com`,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('users', users);

    const insertedUsers = await queryInterface.sequelize.query(
      `SELECT id FROM users ORDER BY id DESC LIMIT ${users.length};`
    );
    const userIds = insertedUsers[0].map(u => u.id).reverse();

    const queryLogs = [];
    for (let i = 0; i < 55; i++) {
      const kota = daftarKota[i % daftarKota.length];
      const kondisi = kondisiCuaca[Math.floor(Math.random() * kondisiCuaca.length)];
      const suhu = randomBetween(kondisi.tempMin, kondisi.tempMax);
      const humidity = Math.floor(randomBetween(kondisi.humidity[0], kondisi.humidity[1]));
      const respon = templateRespon[Math.floor(Math.random() * templateRespon.length)];
      const tanggal = randomDateWithinDays(30);

      queryLogs.push({
        user_id: userIds[i % userIds.length],
        kota,
        data_cuaca: JSON.stringify({
          temp: suhu,
          feels_like: randomBetween(suhu - 1, suhu + 3),
          humidity,
          pressure: Math.floor(randomBetween(1005, 1018)),
          description: kondisi.desc
        }),
        respon_ai: respon(kota, kondisi),
        created_at: tanggal,
        updated_at: tanggal
      });
    }

    await queryInterface.bulkInsert('query_logs', queryLogs);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('query_logs', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
