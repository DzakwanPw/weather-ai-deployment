const express = require("express");
const router = express.Router();

const authController = require("../controller/authController");
const weatherController = require("../controller/weatherController");
const authMiddleware = require("../middleware/authMiddleware");

// Auth (publik)
router.post("/register", authController.register);
router.post("/login", authController.login);

// Cuaca + AI (perlu token)
router.post("/cuaca", authMiddleware, weatherController.cariCuaca);
router.get("/cuaca", authMiddleware, weatherController.getRiwayat);
router.get("/cuaca/:id", authMiddleware, weatherController.getRiwayatById);

module.exports = router;
