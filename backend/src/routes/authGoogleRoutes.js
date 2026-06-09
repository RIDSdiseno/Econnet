import express from "express";
import {
  iniciarGoogle,
  callbackGoogle,
} from "../controllers/authGoogleController.js";

const router = express.Router();

router.get("/google", iniciarGoogle);
router.get("/google/callback", callbackGoogle);

export default router;