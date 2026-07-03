import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { JWT_SECRET } from "../config/jwt.js";

const CAMPOS_USUARIO = {
    id: true,
    nombre: true,
    email: true,
    telefono: true,
    rut: true,
    aceptaTerminos: true,
    aceptaPromociones: true,
    aceptaPublicidad: true,
    descuentoBienvenidaDisponible: true,
    descuentoBienvenidaUsado: true,
    rol: true,
    activo: true,
    createdAt: true,
    updatedAt: true,
};

async function obtenerUsuarioDesdeToken(token) {
    const decoded = jwt.verify(token, JWT_SECRET);

    const usuario = await prisma.usuario.findUnique({
        where: {
            id: decoded.id,
        },
        select: CAMPOS_USUARIO,
    });

    return usuario;
}

export const protegerRuta = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                ok: false,
                mensaje: "No autorizado, token no proporcionado",
            });
        }

        const token = authHeader.split(" ")[1];

        const usuario = await obtenerUsuarioDesdeToken(token);

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                ok: false,
                mensaje: "Usuario no autorizado",
            });
        }

        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            mensaje: "Token inválido o expirado",
        });
    }
};

export const autenticacionOpcional = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Si no hay token, continúa como visitante.
        if (!authHeader) {
            req.usuario = null;
            return next();
        }

        // Si se envió Authorization, debe tener un formato correcto.
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                ok: false,
                mensaje: "Formato de token no válido",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token no proporcionado",
            });
        }

        const usuario = await obtenerUsuarioDesdeToken(token);

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                ok: false,
                mensaje: "Usuario no autorizado",
            });
        }

        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            mensaje: "Token inválido o expirado",
        });
    }
};
