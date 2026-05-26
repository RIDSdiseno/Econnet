import cloudinary from "../config/cloudinary.js";

const subirBufferACloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "econnet/productos",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
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

    const resultado = await subirBufferACloudinary(req.file.buffer);

    res.status(201).json({
      ok: true,
      mensaje: "Imagen subida correctamente",
      imagen: {
        url: resultado.secure_url,
        publicId: resultado.public_id,
      },
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al subir imagen",
      error: error.message,
    });
  }
};