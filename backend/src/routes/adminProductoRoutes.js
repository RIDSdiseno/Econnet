import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    actualizarProductoSchema,
    crearProductoSchema,
} from "../validations/productoSchemas.js";

import {
    obtenerProductosAdmin,
    crearProductoAdmin,
    actualizarProductoAdmin,
    agregarImagenProductoAdmin,
    marcarImagenPrincipalProductoAdmin,
    eliminarImagenProductoAdmin,
    agregarEspecificacionProductoAdmin,
    actualizarEspecificacionProductoAdmin,
    eliminarEspecificacionProductoAdmin,
    reemplazarEspecificacionesProductoAdmin,
} from "../controllers/adminProductoController.js";

const router = express.Router();

router.get("/", protegerRuta, soloAdmin, obtenerProductosAdmin);
router.post(
    "/",
    protegerRuta,
    soloAdmin,
    validateRequest({ body: crearProductoSchema }),
    crearProductoAdmin
);
router.put(
    "/:id",
    protegerRuta,
    soloAdmin,
    validateRequest({ body: actualizarProductoSchema }),
    actualizarProductoAdmin
);

router.post(
    "/:id/imagenes",
    protegerRuta,
    soloAdmin,
    agregarImagenProductoAdmin
);

router.put(
    "/imagenes/:imagenId/principal",
    protegerRuta,
    soloAdmin,
    marcarImagenPrincipalProductoAdmin
);

router.delete(
    "/imagenes/:imagenId",
    protegerRuta,
    soloAdmin,
    eliminarImagenProductoAdmin
);


router.post(
    "/:id/especificaciones",
    protegerRuta,
    soloAdmin,
    agregarEspecificacionProductoAdmin
);

router.put(
    "/especificaciones/:especificacionId",
    protegerRuta,
    soloAdmin,
    actualizarEspecificacionProductoAdmin
);

router.delete(
    "/especificaciones/:especificacionId",
    protegerRuta,
    soloAdmin,
    eliminarEspecificacionProductoAdmin
);


router.put(
    "/:id/especificaciones",
    protegerRuta,
    soloAdmin,
    reemplazarEspecificacionesProductoAdmin
);

export default router;

