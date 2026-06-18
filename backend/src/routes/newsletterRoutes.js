import express from "express";
import { suscribirseNewsletter } from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/suscribirse", suscribirseNewsletter);

export default router;