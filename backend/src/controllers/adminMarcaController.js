import prisma from "../config/prisma.js";

export const obtenerMarcasAdmin = async (req, res) => {
    try {
        const marcas = await prisma.marca.findMany({
            orderBy: [
                { orden: "asc" },
                { id: "asc" },
            ],
            include: {
                _count: {
                    select: {
                        productos: true,
                    },
                },
            },
        });

        return res.json({
            ok: true,
            marcas,
        });
    } catch (error) {
        console.error("Error al obtener marcas admin:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener marcas",
        });
    }
};

export const crearMarcaAdmin = async (req, res) => {
    try {
        const {
            nombre,
            logoUrl,
            activo,
            mostrarHome,
            grupo,
            orden,
        } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la marca es obligatorio",
            });
        }

        const marcaCreada = await prisma.marca.create({
            data: {
                nombre: nombre.trim(),
                logoUrl: logoUrl?.trim() || null,
                activo: activo === undefined ? true : Boolean(activo),
                mostrarHome: mostrarHome === undefined ? false : Boolean(mostrarHome),
                grupo: grupo?.trim() || null,
                orden: orden === undefined || orden === null ? 0 : Number(orden),
            },
        });

        return res.status(201).json({
            ok: true,
            mensaje: "Marca creada correctamente",
            marca: marcaCreada,
        });
    } catch (error) {
        console.error("Error al crear marca admin:", error);

        if (error.code === "P2002") {
            return res.status(400).json({
                ok: false,
                mensaje: "Ya existe una marca con ese nombre",
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: "Error al crear marca",
        });
    }
};

export const actualizarMarcaAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            logoUrl,
            activo,
            mostrarHome,
            grupo,
            orden,
        } = req.body;

        const marcaExiste = await prisma.marca.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!marcaExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Marca no encontrada",
            });
        }

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la marca es obligatorio",
            });
        }

        const marcaActualizada = await prisma.marca.update({
            where: {
                id: Number(id),
            },
            data: {
                nombre: nombre.trim(),
                logoUrl: logoUrl?.trim() || null,
                activo: Boolean(activo),
                mostrarHome: Boolean(mostrarHome),
                grupo: grupo?.trim() || null,
                orden: orden === undefined || orden === null ? 0 : Number(orden),
            },
        });

        return res.json({
            ok: true,
            mensaje: "Marca actualizada correctamente",
            marca: marcaActualizada,
        });
    } catch (error) {
        console.error("Error al actualizar marca admin:", error);

        if (error.code === "P2002") {
            return res.status(400).json({
                ok: false,
                mensaje: "Ya existe una marca con ese nombre",
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar marca",
        });
    }
};