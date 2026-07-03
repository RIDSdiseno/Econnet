import express from "express";
import {
  desuscribirNewsletter,
  suscribirseNewsletter,
} from "../controllers/newsletterController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { unsubscribeNewsletterSchema } from "../validations/newsletterSchemas.js";

const router = express.Router();

router.post("/suscribirse", suscribirseNewsletter);
router.get(
  "/unsubscribe",
  validateRequest({ query: unsubscribeNewsletterSchema }),
  desuscribirNewsletter,
);

export default router;
