const { QueryLog } = require("../models");

// Beberapa model gratis OpenRouter, dicoba berurutan.
// Kalau model pertama gagal/tidak stabil, otomatis coba model berikutnya
// tanpa perlu user klik ulang manual.
const AI_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "google/gemma-4-26b-a4b-it:free",
  "openai/gpt-oss-20b:free"
];

function windDirectionLabel(deg) {
  const arah = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
  const index = Math.round(deg / 45) % 8;
  return arah[index];
}

async function callOpenRouterWithFallback(messages) {
  for (const model of AI_MODELS) {
    try {
      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model, messages })
      });
      const aiData = await aiRes.json();
      const content = aiData?.choices?.[0]?.message?.content;
      if (content) return content;
      console.warn(`Model ${model} gagal:`, aiData?.error?.message || "respons kosong");
    } catch (err) {
      console.warn(`Model ${model} error:`, err.message);
    }
  }
  return "AI sedang sibuk, coba lagi dalam beberapa saat.";
}

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

    // 2. Kirim data cuaca ke OpenRouter supaya dijelaskan natural (dengan fallback model)
    const arahAngin = windDirectionLabel(weatherData.wind.deg);
    const responAI = await callOpenRouterWithFallback([
      { role: "system", content: "Kamu asisten cuaca yang ramah, jawab singkat dalam Bahasa Indonesia. Jangan mengarang informasi lokasi spesifik yang tidak ada di data (misal nama wilayah/kecamatan tertentu yang lebih panas), cukup jelaskan kondisi umum kota secara keseluruhan." },
      { role: "user", content: `Jelaskan cuaca berikut dengan santai: suhu ${weatherData.main.temp}°C, terasa seperti ${weatherData.main.feels_like}°C, kondisi ${weatherData.weather[0].description}, kelembapan ${weatherData.main.humidity}%, kecepatan angin ${weatherData.wind.speed} m/s dari arah ${arahAngin}` }
    ]);

    // 3. Simpan ke database
    const log = await QueryLog.create({
      user_id: userId,
      kota,
      data_cuaca: JSON.stringify({ ...weatherData.main, wind_speed: weatherData.wind.speed, wind_deg: weatherData.wind.deg, wind_direction: arahAngin, description: weatherData.weather[0].description }),
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

async function previewCuaca(req, res) {
  try {
    const { kota } = req.query;
    if (!kota) {
      return res.status(400).json({ message: "kota wajib diisi." });
    }

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(kota)}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=id`
    );
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) {
      return res.status(400).json({ message: "Kota tidak ditemukan." });
    }

    return res.status(200).json({
      data: {
        kota: weatherData.name,
        temp: weatherData.main.temp,
        description: weatherData.weather[0].description
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil preview cuaca." });
  }
}

module.exports = { cariCuaca, getRiwayat, getRiwayatById, previewCuaca };
