import express from "express";
import {
  iniciarMicrosoft,
  callbackMicrosoft,
} from "../controllers/authMicrosoftController.js";

const router = express.Router();

router.get("/microsoft", iniciarMicrosoft);
router.get("/microsoft/callback", callbackMicrosoft);

export default router;