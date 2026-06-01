import prisma from "../config/prisma.js";

export const obtenerDirecciones = async (req, res) => {
    try {
        const direcciones = await prisma.direccion.findMany({
            where: {
                usuarioId: req.usuario.id,
            },
            orderBy: [
                {
                    principal: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });

        res.json({
            ok: true,
            direcciones,
        });
    } catch (error) {
        console.error("Error al obtener direcciones:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener direcciones",
            error: error.message,
        });
    }
};

export const crearDireccion = async (req, res) => {
    try {
        const {
            nombre,
            region,
            comuna,
            calle,
            numero,
            departamento,
            telefono,
            principal = false,
        } = req.body;

        if (!region || !comuna || !calle || !numero) {
            return res.status(400).json({
                ok: false,
                mensaje: "Región, comuna, calle y número son obligatorios",
            });
        }

        if (principal) {
            await prisma.direccion.updateMany({
                where: {
                    usuarioId: req.usuario.id,
                },
                data: {
                    principal: false,
                },
            });
        }

        const cantidadDirecciones = await prisma.direccion.count({
            where: {
                usuarioId: req.usuario.id,
            },
        });
        const direccionCompleta = `${calle} ${numero}${departamento ? `, ${departamento}` : ""
            }`;
        const nuevaDireccion = await prisma.direccion.create({
            data: {
                usuarioId: req.usuario.id,
                nombre: nombre || null,
                direccion: direccionCompleta,
                region,
                comuna,
                calle,
                numero,
                departamento: departamento || null,
                telefono: telefono || null,
                principal: principal || cantidadDirecciones === 0,
            },
        });

        res.status(201).json({
            ok: true,
            mensaje: "Dirección agregada correctamente",
            direccion: nuevaDireccion,
        });
    } catch (error) {
        console.error("Error al crear dirección:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al crear dirección",
            error: error.message,
        });
    }
};

export const marcarDireccionPrincipal = async (req, res) => {
    try {
        const { id } = req.params;
        const direccionId = Number(id);

        if (!direccionId) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID de dirección inválido",
            });
        }

        const direccionExiste = await prisma.direccion.findFirst({
            where: {
                id: direccionId,
                usuarioId: req.usuario.id,
            },
        });

        if (!direccionExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Dirección no encontrada",
            });
        }

        await prisma.direccion.updateMany({
            where: {
                usuarioId: req.usuario.id,
            },
            data: {
                principal: false,
            },
        });

        const direccionActualizada = await prisma.direccion.update({
            where: {
                id: direccionId,
            },
            data: {
                principal: true,
            },
        });

        res.json({
            ok: true,
            mensaje: "Dirección principal actualizada",
            direccion: direccionActualizada,
        });
    } catch (error) {
        console.error("Error al marcar dirección principal:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al marcar dirección principal",
            error: error.message,
        });
    }
};

export const eliminarDireccion = async (req, res) => {
    try {
        const { id } = req.params;
        const direccionId = Number(id);

        if (!direccionId) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID de dirección inválido",
            });
        }

        const direccionExiste = await prisma.direccion.findFirst({
            where: {
                id: direccionId,
                usuarioId: req.usuario.id,
            },
        });

        if (!direccionExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Dirección no encontrada",
            });
        }

        await prisma.direccion.delete({
            where: {
                id: direccionId,
            },
        });

        res.json({
            ok: true,
            mensaje: "Dirección eliminada correctamente",
        });
    } catch (error) {
        console.error("Error al eliminar dirección:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar dirección",
            error: error.message,
        });
    }
};