import prisma from "../config/prisma.js";

export const obtenerAnuncios = async (req, res) => {
  try {
    const { ubicacion } = req.query;

    const anuncios = await prisma.anuncio.findMany({
      where: {
        activo: true,
        ubicacion: ubicacion || undefined,
      },
      orderBy: {
        orden: "asc",
      },
    });

    res.json({
      ok: true,
      anuncios,
    });
  } catch (error) {
    console.error("Error al obtener anuncios:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener anuncios",
      error: error.message,
    });
  }
};

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
      ],
    });

    res.json({
      ok: true,
      anuncios,
    });
  } catch (error) {
    console.error("Error al obtener anuncios admin:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener anuncios para admin",
      error: error.message,
    });
  }
};

export const crearAnuncio = async (req, res) => {
  try {
    const {
      titulo,
      subtitulo,
      imagenUrl,
      publicId,
      enlace,
      ubicacion,
      activo = true,
      orden = 0,
    } = req.body;

    if (!imagenUrl || !enlace || !ubicacion) {
      return res.status(400).json({
        ok: false,
        mensaje: "Imagen, enlace y ubicación son obligatorios",
      });
    }

    const nuevoAnuncio = await prisma.anuncio.create({
      data: {
        titulo: titulo || null,
        subtitulo: subtitulo || null,
        imagenUrl,
        publicId: publicId || null,
        enlace,
        ubicacion,
        activo,
        orden: Number(orden),
      },
    });

    res.status(201).json({
      ok: true,
      mensaje: "Anuncio creado correctamente",
      anuncio: nuevoAnuncio,
    });
  } catch (error) {
    console.error("Error al crear anuncio:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al crear anuncio",
      error: error.message,
    });
  }
};

export const editarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const anuncioId = Number(id);

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

    if (!anuncioId) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de anuncio inválido",
      });
    }

    const anuncioExiste = await prisma.anuncio.findUnique({
      where: {
        id: anuncioId,
      },
    });

    if (!anuncioExiste) {
      return res.status(404).json({
        ok: false,
        mensaje: "Anuncio no encontrado",
      });
    }

    const anuncioActualizado = await prisma.anuncio.update({
      where: {
        id: anuncioId,
      },
      data: {
        titulo: titulo !== undefined ? titulo : undefined,
        subtitulo: subtitulo !== undefined ? subtitulo : undefined,
        imagenUrl: imagenUrl !== undefined ? imagenUrl : undefined,
        publicId: publicId !== undefined ? publicId : undefined,
        enlace: enlace !== undefined ? enlace : undefined,
        ubicacion: ubicacion !== undefined ? ubicacion : undefined,
        activo: activo !== undefined ? activo : undefined,
        orden: orden !== undefined ? Number(orden) : undefined,
      },
    });

    res.json({
      ok: true,
      mensaje: "Anuncio actualizado correctamente",
      anuncio: anuncioActualizado,
    });
  } catch (error) {
    console.error("Error al editar anuncio:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al editar anuncio",
      error: error.message,
    });
  }
};

export const desactivarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const anuncioId = Number(id);

    if (!anuncioId) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de anuncio inválido",
      });
    }

    const anuncio = await prisma.anuncio.update({
      where: {
        id: anuncioId,
      },
      data: {
        activo: false,
      },
    });

    res.json({
      ok: true,
      mensaje: "Anuncio desactivado correctamente",
      anuncio,
    });
  } catch (error) {
    console.error("Error al desactivar anuncio:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al desactivar anuncio",
      error: error.message,
    });
  }
};

export const reactivarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const anuncioId = Number(id);

    if (!anuncioId) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de anuncio inválido",
      });
    }

    const anuncio = await prisma.anuncio.update({
      where: {
        id: anuncioId,
      },
      data: {
        activo: true,
      },
    });

    res.json({
      ok: true,
      mensaje: "Anuncio reactivado correctamente",
      anuncio,
    });
  } catch (error) {
    console.error("Error al reactivar anuncio:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al reactivar anuncio",
      error: error.message,
    });
  }
};