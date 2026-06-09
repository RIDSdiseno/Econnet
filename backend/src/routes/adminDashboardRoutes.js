import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";
import { obtenerDashboardAdmin } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/", protegerRuta, soloAdmin, obtenerDashboardAdmin);

export default router;