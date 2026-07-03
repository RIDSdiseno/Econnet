import logger, { serializeError } from "../config/logger.js";
import cloudinary from "../config/cloudinary.js";

const subirBufferACloudinary = (buffer, carpeta) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: carpeta,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(buffer);
  });
};

const responderImagenSubida = (res, resultado, mensaje) => {
  return res.status(201).json({
    ok: true,
    mensaje,
    imagen: {
      url: resultado.secure_url,
      publicId: resultado.public_id,
    },
  });
};

export const subirImagenProducto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se envió ninguna imagen",
      });
    }

    const resultado = await subirBufferACloudinary(
      req.file.buffer,
      "econnet/productos",
    );

    return responderImagenSubida(
      res,
      resultado,
      "Imagen de producto subida correctamente",
    );
  } catch (error) {
    logger.error("Error al subir imagen de producto:", serializeError(error));

    return res.status(500).json({
      ok: false,
      mensaje: "Error al subir imagen de producto",
      error: error.message,
    });
  }
};

export const subirImagenMarca = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se envió ninguna imagen",
      });
    }

    const resultado = await subirBufferACloudinary(
      req.file.buffer,
      "econnet/marcas",
    );

    return responderImagenSubida(
      res,
      resultado,
      "Imagen de marca subida correctamente",
    );
  } catch (error) {
    logger.error("Error al subir imagen de marca:", serializeError(error));

    return res.status(500).json({
      ok: false,
      mensaje: "Error al subir imagen de marca",
      error: error.message,
    });
  }
};

export const subirImagenAnuncio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se envió ninguna imagen",
      });
    }

    const resultado = await subirBufferACloudinary(
      req.file.buffer,
      "econnet/anuncios",
    );

    return responderImagenSubida(
      res,
      resultado,
      "Imagen de anuncio subida correctamente",
    );
  } catch (error) {
    logger.error("Error al subir imagen de anuncio:", serializeError(error));

    return res.status(500).json({
      ok: false,
      mensaje: "Error al subir imagen de anuncio",
      error: error.message,
    });
  }
};

export const subirImagenCategoria = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se envió ninguna imagen",
      });
    }

    const resultado = await subirBufferACloudinary(
      req.file.buffer,
      "econnet/categorias",
    );

    return responderImagenSubida(
      res,
      resultado,
      "Imagen de categoría subida correctamente",
    );
  } catch (error) {
    logger.error("Error al subir imagen de categoría:", serializeError(error));

    return res.status(500).json({
      ok: false,
      mensaje: "Error al subir imagen de categoría",
      error: error.message,
    });
  }
};