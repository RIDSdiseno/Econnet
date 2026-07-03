import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";

const generarSlug = (texto) => {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
};

const convertirBooleano = (valor, defecto = false) => {
    if (valor === undefined || valor === null || valor === "") {
        return defecto;
    }

    return valor === true || valor === "true";
};

const convertirNumero = (valor, defecto = 0) => {
    if (valor === undefined || valor === null || valor === "") {
        return defecto;
    }

    return Number(valor);
};

const convertirTextoNullable = (valor) => {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    return String(valor).trim() || null;
};

export const obtenerCategoriasAdmin = async (req, res) => {
    try {
        const categorias = await prisma.categoria.findMany({
            orderBy: [
                {
                    ordenHome: "asc",
                },
                {
                    id: "asc",
                },
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
            categorias,
        });
    } catch (error) {
        logger.error("Error al obtener categorías admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener categorías",
        });
    }
};

export const crearCategoriaAdmin = async (req, res) => {
    try {
        const {
            nombre,
            slug,
            descripcion,
            imagenUrl,
            publicId,
            activo,
            mostrarHome,
            ordenHome,
        } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la categoría es obligatorio",
            });
        }

        const slugFinal = slug?.trim() || generarSlug(nombre);

        const categoriaCreada = await prisma.categoria.create({
            data: {
                nombre: nombre.trim(),
                slug: slugFinal,
                descripcion: convertirTextoNullable(descripcion),
                imagenUrl: convertirTextoNullable(imagenUrl),
                publicId: convertirTextoNullable(publicId),
                activo: convertirBooleano(activo, true),
                mostrarHome: convertirBooleano(mostrarHome, true),
                ordenHome: convertirNumero(ordenHome, 0),
            },
            include: {
                _count: {
                    select: {
                        productos: true,
                    },
                },
            },
        });

        return res.status(201).json({
            ok: true,
            mensaje: "Categoría creada correctamente",
            categoria: categoriaCreada,
        });
    } catch (error) {
        logger.error("Error al crear categoría admin:", serializeError(error));

        if (error.code === "P2002") {
            return res.status(400).json({
                ok: false,
                mensaje: "Ya existe una categoría con ese slug",
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: "Error al crear categoría",
        });
    }
};

export const actualizarCategoriaAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            slug,
            descripcion,
            imagenUrl,
            publicId,
            activo,
            mostrarHome,
            ordenHome,
        } = req.body;

        const categoriaExiste = await prisma.categoria.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!categoriaExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Categoría no encontrada",
            });
        }

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la categoría es obligatorio",
            });
        }

        const slugFinal = slug?.trim() || generarSlug(nombre);

        const categoriaActualizada = await prisma.categoria.update({
            where: {
                id: Number(id),
            },
            data: {
                nombre: nombre.trim(),
                slug: slugFinal,
                descripcion: convertirTextoNullable(descripcion),
                imagenUrl: convertirTextoNullable(imagenUrl),
                publicId: convertirTextoNullable(publicId),
                activo: convertirBooleano(activo, categoriaExiste.activo),
                mostrarHome: convertirBooleano(
                    mostrarHome,
                    categoriaExiste.mostrarHome,
                ),
                ordenHome: convertirNumero(ordenHome, categoriaExiste.ordenHome),
            },
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
            mensaje: "Categoría actualizada correctamente",
            categoria: categoriaActualizada,
        });
    } catch (error) {
        logger.error("Error al actualizar categoría admin:", serializeError(error));

        if (error.code === "P2002") {
            return res.status(400).json({
                ok: false,
                mensaje: "Ya existe una categoría con ese slug",
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar categoría",
        });
    }
};