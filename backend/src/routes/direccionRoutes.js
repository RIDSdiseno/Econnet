import express from "express";
import {
  obtenerDirecciones,
  crearDireccion,
  marcarDireccionPrincipal,
  eliminarDireccion,
} from "../controllers/direccionController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protegerRuta, obtenerDirecciones);
router.post("/", protegerRuta, crearDireccion);
router.put("/:id/principal", protegerRuta, marcarDireccionPrincipal);
router.delete("/:id", protegerRuta, eliminarDireccion);

export default router;