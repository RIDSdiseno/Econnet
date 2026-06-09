import prisma from "../config/prisma.js";

export const obtenerTarifasAdmin = async (req, res) => {
    try {
        const tarifas = await prisma.tarifaDespacho.findMany({
            orderBy: {
                id: "asc",
            },
        });

        return res.json({
            ok: true,
            tarifas,
        });
    } catch (error) {
        console.error("Error al obtener tarifas admin:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener tarifas de despacho",
        });
    }
};

export const actualizarTarifaAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, activo } = req.body;

        const tarifaExiste = await prisma.tarifaDespacho.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!tarifaExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Tarifa no encontrada",
            });
        }

        if (precio === undefined || precio === null || Number(precio) < 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El precio debe ser válido",
            });
        }

        const tarifaActualizada = await prisma.tarifaDespacho.update({
            where: {
                id: Number(id),
            },
            data: {
                nombre,
                precio: Number(precio),
                activo: Boolean(activo),
            },
        });

        return res.json({
            ok: true,
            mensaje: "Tarifa actualizada correctamente",
            tarifa: tarifaActualizada,
        });
    } catch (error) {
        console.error("Error al actualizar tarifa admin:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar tarifa de despacho",
        });
    }
};