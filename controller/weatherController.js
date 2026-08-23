const { QueryLog } = require("../models");

async function cariCuaca(req, res) {
  try {
    const { kota } = req.body;
    const userId = req.user.id; // diisi oleh authMiddleware

    if (!kota) {
      return res.status(400).json({ message: "kota wajib diisi." });
    }

    // 1. Ambil data cuaca dari OpenWeatherMap
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(kota)}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=id`
    );
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) {
      return res.status(400).json({ message: "Kota tidak ditemukan.", detail: weatherData.message });
    }

    // 2. Kirim data cuaca ke OpenRouter supaya dijelaskan natural
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: "Kamu asisten cuaca yang ramah, jawab singkat dalam Bahasa Indonesia." },
          { role: "user", content: `Jelaskan cuaca berikut dengan santai: suhu ${weatherData.main.temp}°C, terasa seperti ${weatherData.main.feels_like}°C, kondisi ${weatherData.weather[0].description}, kelembapan ${weatherData.main.humidity}%, kecepatan angin ${weatherData.wind.speed} m/s` }
        ]
      })
    });
    const aiData = await aiRes.json();
    const responAI = aiData?.choices?.[0]?.message?.content || "AI tidak memberikan respon.";

    // 3. Simpan ke database
    const log = await QueryLog.create({
      user_id: userId,
      kota,
      data_cuaca: JSON.stringify(weatherData.main),
      respon_ai: responAI
    });

    return res.status(201).json({
      message: "Berhasil mengambil data cuaca.",
      data: log
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
}

async function getRiwayat(req, res) {
  try {
    const userId = req.user.id;

    const logs = await QueryLog.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({ data: logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
}

async function getRiwayatById(req, res) {
  try {
    const { id } = req.params;
    const log = await QueryLog.findByPk(id);

    if (!log) {
      return res.status(404).json({ message: "Data tidak ditemukan." });
    }

    return res.status(200).json({ data: log });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
}

module.exports = { cariCuaca, getRiwayat, getRiwayatById };