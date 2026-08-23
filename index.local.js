// File ini KHUSUS untuk testing lokal pakai Postman.
// Tidak dipakai saat deploy ke Vercel (Vercel tetap pakai index.js).

const app = require("./index");

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server lokal jalan di http://localhost:${PORT}`);
});