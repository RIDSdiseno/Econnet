import express from "express";
import upload from "../middlewares/upload.js";
import { subirImagenProducto } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/producto", upload.single("imagen"), subirImagenProducto);

export default router;