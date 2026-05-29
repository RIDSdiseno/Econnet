import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await prisma.usuario.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                telefono: true,
                rut: true,
                aceptaTerminos: true,
                aceptaPromociones: true,
                aceptaPublicidad: true,
                rol: true,
                activo: true,
                createdAt: true,
                updatedAt: true,
            },
        });

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