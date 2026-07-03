import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";

export const obtenerAnunciosAdmin = async (req, res) => {
    try {
        const anuncios = await prisma.anuncio.findMany({
            orderBy: [
                {
                    ubicacion: "asc",
                },
                {
                    orden: "asc",
                },
                {
                    id: "desc",
                },
            ],
        });

        return res.json({
            ok: true,
            anuncios,
        });
    } catch (error) {
        logger.error("Error al obtener anuncios admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener anuncios",
        });
    }
};

export const crearAnuncioAdmin = async (req, res) => {
    try {
        const {
            titulo,
            subtitulo,
            imagenUrl,
            publicId,
            enlace,
            ubicacion,
            activo,
            orden,
        } = req.body;

        if (!imagenUrl || !imagenUrl.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "La imagen del anuncio es obligatoria",
            });
        }

        const anuncioCreado = await prisma.anuncio.create({
            data: {
                titulo: titulo?.trim() || null,
                subtitulo: subtitulo?.trim() || null,
                imagenUrl: imagenUrl.trim(),
                publicId: publicId?.trim() || null,
                enlace: enlace?.trim() || "/",
                ubicacion: ubicacion?.trim() || "promo_horizontal",
                activo: activo === undefined ? true : Boolean(activo),
                orden: orden === undefined || orden === null ? 0 : Number(orden),
            },
        });

        return res.status(201).json({
            ok: true,
            mensaje: "Anuncio creado correctamente",
            anuncio: anuncioCreado,
        });
    } catch (error) {
        logger.error("Error al crear anuncio admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al crear anuncio",
        });
    }
};

export const actualizarAnuncioAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            titulo,
            subtitulo,
            imagenUrl,
            publicId,
            enlace,
            ubicacion,
            activo,
            orden,
        } = req.body;

        const anuncioExiste = await prisma.anuncio.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!anuncioExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Anuncio no encontrado",
            });
        }

        if (!imagenUrl || !imagenUrl.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "La imagen del anuncio es obligatoria",
            });
        }

        const anuncioActualizado = await prisma.anuncio.update({
            where: {
                id: Number(id),
            },
            data: {
                titulo: titulo?.trim() || null,
                subtitulo: subtitulo?.trim() || null,
                imagenUrl: imagenUrl.trim(),
                publicId: publicId?.trim() || null,
                enlace: enlace?.trim() || "/",
                ubicacion: ubicacion?.trim() || "promo_horizontal",
                activo: Boolean(activo),
                orden: orden === undefined || orden === null ? 0 : Number(orden),
            },
        });

        return res.json({
            ok: true,
            mensaje: "Anuncio actualizado correctamente",
            anuncio: anuncioActualizado,
        });
    } catch (error) {
        logger.error("Error al actualizar anuncio admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar anuncio",
        });
    }
};

export const eliminarAnuncioAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const anuncioExiste = await prisma.anuncio.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!anuncioExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Anuncio no encontrado",
            });
        }

        await prisma.anuncio.delete({
            where: {
                id: Number(id),
            },
        });

        if (anuncioExiste.publicId) {
            try {
                await cloudinary.uploader.destroy(anuncioExiste.publicId);
            } catch (errorCloudinary) {
                logger.error(
                    "El anuncio se eliminó de la base, pero no de Cloudinary:",
                    errorCloudinary
                );
            }
        }

        return res.json({
            ok: true,
            mensaje: "Anuncio eliminado correctamente",
            anuncioEliminado: anuncioExiste,
        });
    } catch (error) {
        logger.error("Error al eliminar anuncio admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar anuncio",
        });
    }
};