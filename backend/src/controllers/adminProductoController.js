import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";



const convertirBooleano = (valor) => {
    return valor === true || valor === "true";
};

const convertirNumeroNullable = (valor) => {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    return Number(valor);
};

const convertirNumero = (valor, defecto = 0) => {
    if (valor === undefined || valor === null || valor === "") {
        return defecto;
    }

    return Number(valor);
};

const convertirTextoNullable = (valor) => {
    if (valor === undefined || valor === null || valor.trim?.() === "") {
        return null;
    }

    return valor.trim();
};

const calcularPrecioProducto = ({ precio, precioActual = 0 }) => {
    const precioManual = convertirNumero(precio, precioActual);

    return Math.max(precioManual, 0);
};

const generarSlug = (texto) => {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
};

export const obtenerProductosAdmin = async (req, res) => {
    try {
        const productos = await prisma.producto.findMany({
            orderBy: {
                id: "desc",
            },
            include: {
                categoria: true,
                marca: true,
                imagenes: {
                    orderBy: [
                        { esPrincipal: "desc" },
                        { orden: "asc" },
                    ],
                },
                especificaciones: {
                    orderBy: {
                        orden: "asc",
                    },
                },
            },
        });

        return res.json({
            ok: true,
            productos,
        });
    } catch (error) {
        logger.error("Error al obtener productos admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener productos",
        });
    }
};

export const crearProductoAdmin = async (req, res) => {
    try {
        const {
            nombre,
            slug,
            descripcion,
            precio,
            stock,
            sku,
            modelo,
            garantia,
            categoriaId,
            marcaId,
            activo,
            destacado,

            enOferta,
            precioNormal,
            descuento,
            etiquetaOferta,
            etiquetaEnvio,
            etiquetaDisponibilidad,
            mostrarEnOfertas,
            formatoOferta,
            ordenOferta,
        } = req.body;
        const enOfertaConvertido = convertirBooleano(enOferta);
        const precioNormalConvertido = convertirNumeroNullable(precioNormal);
        const descuentoConvertido = convertirNumero(descuento, 0);

        const precioCalculado = calcularPrecioProducto({
            precio,
        });
        if (!nombre || !slug || !categoriaId || precioCalculado <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "Nombre, slug, precio y categoría son obligatorios",
            });
        }

        const producto = await prisma.producto.create({
            data: {
                nombre: nombre.trim(),
                slug: slug.trim(),
                descripcion: descripcion?.trim() || null,
                precio: precioCalculado,
                stock: convertirNumero(stock, 0),
                sku: sku?.trim() || null,
                modelo: modelo?.trim() || null,
                garantia: garantia?.trim() || null,

                activo: activo === undefined ? true : convertirBooleano(activo),
                destacado: destacado === undefined ? false : convertirBooleano(destacado),

                categoriaId: Number(categoriaId),
                marcaId: marcaId ? Number(marcaId) : null,

                enOferta: enOfertaConvertido,
                precioNormal: precioNormalConvertido,
                descuento: descuentoConvertido,
                etiquetaOferta: convertirTextoNullable(etiquetaOferta),
                etiquetaEnvio: convertirTextoNullable(etiquetaEnvio),
                etiquetaDisponibilidad: convertirTextoNullable(etiquetaDisponibilidad),

                mostrarEnOfertas: convertirBooleano(mostrarEnOfertas),
                formatoOferta: formatoOferta || "small",
                ordenOferta: convertirNumero(ordenOferta, 0),
            },
            include: {
                categoria: true,
                marca: true,
                imagenes: {
                    orderBy: [
                        { esPrincipal: "desc" },
                        { orden: "asc" },
                    ],
                },
                especificaciones: {
                    orderBy: {
                        orden: "asc",
                    },
                },
            },
        });

        return res.status(201).json({
            ok: true,
            mensaje: "Producto creado correctamente",
            producto,
        });
    } catch (error) {
        logger.error("Error al crear producto admin:", serializeError(error));

        if (error.code === "P2002") {
            return res.status(400).json({
                ok: false,
                mensaje: "Ya existe un producto con ese slug o SKU",
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: "Error al crear producto",
        });
    }
};

export const actualizarProductoAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            slug,
            descripcion,
            precio,
            stock,
            sku,
            modelo,
            garantia,
            categoriaId,
            marcaId,
            activo,
            destacado,

            enOferta,
            precioNormal,
            descuento,
            etiquetaOferta,
            etiquetaEnvio,
            etiquetaDisponibilidad,
            mostrarEnOfertas,
            formatoOferta,
            ordenOferta,
        } = req.body;

        const productoExiste = await prisma.producto.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!productoExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Producto no encontrado",
            });
        }


        const enOfertaFinal =
            enOferta !== undefined
                ? convertirBooleano(enOferta)
                : productoExiste.enOferta;

        const precioNormalFinal =
            precioNormal !== undefined
                ? convertirNumeroNullable(precioNormal)
                : productoExiste.precioNormal;

        const descuentoFinal =
            descuento !== undefined
                ? convertirNumero(descuento, 0)
                : productoExiste.descuento;

        const precioFinal = calcularPrecioProducto({
            precio: precio !== undefined ? precio : productoExiste.precio,
            precioActual: productoExiste.precio,
        });

        const producto = await prisma.producto.update({
            where: {
                id: Number(id),
            },
            data: {
                nombre: nombre !== undefined ? nombre.trim() : undefined,
                slug: slug !== undefined ? slug.trim() : undefined,
                descripcion:
                    descripcion !== undefined
                        ? descripcion?.trim() || null
                        : undefined,
                precio: precioFinal,
                stock: stock !== undefined ? convertirNumero(stock, 0) : undefined,
                sku: sku !== undefined ? sku?.trim() || null : undefined,
                modelo: modelo !== undefined ? modelo?.trim() || null : undefined,
                garantia: garantia !== undefined ? garantia?.trim() || null : undefined,

                activo:
                    activo !== undefined
                        ? convertirBooleano(activo)
                        : undefined,
                destacado:
                    destacado !== undefined
                        ? convertirBooleano(destacado)
                        : undefined,

                categoriaId:
                    categoriaId !== undefined
                        ? Number(categoriaId)
                        : undefined,
                marcaId:
                    marcaId !== undefined
                        ? marcaId
                            ? Number(marcaId)
                            : null
                        : undefined,

                enOferta: enOfertaFinal,
                precioNormal: precioNormalFinal,
                descuento: descuentoFinal,
                etiquetaOferta:
                    etiquetaOferta !== undefined
                        ? convertirTextoNullable(etiquetaOferta)
                        : undefined,
                etiquetaEnvio:
                    etiquetaEnvio !== undefined
                        ? convertirTextoNullable(etiquetaEnvio)
                        : undefined,
                etiquetaDisponibilidad:
                    etiquetaDisponibilidad !== undefined
                        ? convertirTextoNullable(etiquetaDisponibilidad)
                        : undefined,

                mostrarEnOfertas:
                    mostrarEnOfertas !== undefined
                        ? convertirBooleano(mostrarEnOfertas)
                        : undefined,
                formatoOferta:
                    formatoOferta !== undefined
                        ? formatoOferta || "small"
                        : undefined,
                ordenOferta:
                    ordenOferta !== undefined
                        ? convertirNumero(ordenOferta, 0)
                        : undefined,
            },
            include: {
                categoria: true,
                marca: true,
                imagenes: {
                    orderBy: [
                        { esPrincipal: "desc" },
                        { orden: "asc" },
                    ],
                },
                especificaciones: {
                    orderBy: {
                        orden: "asc",
                    },
                },
            },
        });

        return res.json({
            ok: true,
            mensaje: "Producto actualizado correctamente",
            producto,
        });
    } catch (error) {
        logger.error("Error al actualizar producto admin:", serializeError(error));

        if (error.code === "P2002") {
            return res.status(400).json({
                ok: false,
                mensaje: "Ya existe un producto con ese slug o SKU",
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar producto",
        });
    }
};


export const agregarImagenProductoAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { url, publicId, esPrincipal, tipo } = req.body;

        if (!url || !url.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "La URL de la imagen es obligatoria",
            });
        }

        const productoExiste = await prisma.producto.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                imagenes: true,
            },
        });

        if (!productoExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Producto no encontrado",
            });
        }

        const debeSerPrincipal =
            esPrincipal === true || productoExiste.imagenes.length === 0;

        const nuevaImagen = await prisma.$transaction(async (tx) => {
            if (debeSerPrincipal) {
                await tx.productoImagen.updateMany({
                    where: {
                        productoId: Number(id),
                    },
                    data: {
                        esPrincipal: false,
                    },
                });
            }

            const imagen = await tx.productoImagen.create({
                data: {
                    productoId: Number(id),
                    url: url.trim(),
                    publicId: publicId?.trim() || null,
                    esPrincipal: debeSerPrincipal,
                    tipo: tipo?.trim() || "principal",
                    orden: productoExiste.imagenes.length + 1,
                },
            });

            return imagen;
        });

        return res.status(201).json({
            ok: true,
            mensaje: "Imagen agregada correctamente",
            imagen: nuevaImagen,
        });
    } catch (error) {
        logger.error("Error al agregar imagen producto admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al agregar imagen al producto",
        });
    }
};

export const marcarImagenPrincipalProductoAdmin = async (req, res) => {
    try {
        const { imagenId } = req.params;

        const imagenExiste = await prisma.productoImagen.findUnique({
            where: {
                id: Number(imagenId),
            },
        });

        if (!imagenExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Imagen no encontrada",
            });
        }

        const imagenActualizada = await prisma.$transaction(async (tx) => {
            await tx.productoImagen.updateMany({
                where: {
                    productoId: imagenExiste.productoId,
                },
                data: {
                    esPrincipal: false,
                },
            });

            const imagen = await tx.productoImagen.update({
                where: {
                    id: Number(imagenId),
                },
                data: {
                    esPrincipal: true,
                    tipo: "principal",
                },
            });

            return imagen;
        });

        return res.json({
            ok: true,
            mensaje: "Imagen marcada como principal correctamente",
            imagen: imagenActualizada,
        });
    } catch (error) {
        logger.error("Error al marcar imagen principal admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al marcar imagen como principal",
        });
    }
};

export const eliminarImagenProductoAdmin = async (req, res) => {
    try {
        const { imagenId } = req.params;

        const imagenExiste = await prisma.productoImagen.findUnique({
            where: {
                id: Number(imagenId),
            },
        });

        if (!imagenExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Imagen no encontrada",
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.productoImagen.delete({
                where: {
                    id: Number(imagenId),
                },
            });

            if (imagenExiste.esPrincipal) {
                const siguienteImagen = await tx.productoImagen.findFirst({
                    where: {
                        productoId: imagenExiste.productoId,
                    },
                    orderBy: [
                        {
                            orden: "asc",
                        },
                        {
                            id: "asc",
                        },
                    ],
                });

                if (siguienteImagen) {
                    await tx.productoImagen.update({
                        where: {
                            id: siguienteImagen.id,
                        },
                        data: {
                            esPrincipal: true,
                            tipo: "principal",
                        },
                    });
                }
            }
        });

        if (imagenExiste.publicId) {
            try {
                await cloudinary.uploader.destroy(imagenExiste.publicId);
            } catch (errorCloudinary) {
                logger.error(
                    "La imagen se eliminó de la base, pero no de Cloudinary:",
                    errorCloudinary
                );
            }
        }

        return res.json({
            ok: true,
            mensaje: "Imagen eliminada correctamente",
            imagenEliminada: imagenExiste,
        });
    } catch (error) {
        logger.error("Error al eliminar imagen producto admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar imagen del producto",
        });
    }
};


export const agregarEspecificacionProductoAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, valor, orden } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la especificación es obligatorio",
            });
        }

        if (!valor || !valor.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "El valor de la especificación es obligatorio",
            });
        }

        const productoExiste = await prisma.producto.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                especificaciones: true,
            },
        });

        if (!productoExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Producto no encontrado",
            });
        }

        const especificacionCreada = await prisma.especificacionProducto.create({
            data: {
                productoId: Number(id),
                nombre: nombre.trim(),
                valor: valor.trim(),
                orden:
                    orden !== undefined && orden !== null
                        ? Number(orden)
                        : productoExiste.especificaciones.length + 1,
            },
        });

        return res.status(201).json({
            ok: true,
            mensaje: "Especificación agregada correctamente",
            especificacion: especificacionCreada,
        });
    } catch (error) {
        logger.error("Error al agregar especificación admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al agregar especificación",
        });
    }
};

export const actualizarEspecificacionProductoAdmin = async (req, res) => {
    try {
        const { especificacionId } = req.params;
        const { nombre, valor, orden } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la especificación es obligatorio",
            });
        }

        if (!valor || !valor.trim()) {
            return res.status(400).json({
                ok: false,
                mensaje: "El valor de la especificación es obligatorio",
            });
        }

        const especificacionExiste =
            await prisma.especificacionProducto.findUnique({
                where: {
                    id: Number(especificacionId),
                },
            });

        if (!especificacionExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Especificación no encontrada",
            });
        }

        const especificacionActualizada =
            await prisma.especificacionProducto.update({
                where: {
                    id: Number(especificacionId),
                },
                data: {
                    nombre: nombre.trim(),
                    valor: valor.trim(),
                    orden:
                        orden !== undefined && orden !== null
                            ? Number(orden)
                            : especificacionExiste.orden,
                },
            });

        return res.json({
            ok: true,
            mensaje: "Especificación actualizada correctamente",
            especificacion: especificacionActualizada,
        });
    } catch (error) {
        logger.error("Error al actualizar especificación admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar especificación",
        });
    }
};

export const eliminarEspecificacionProductoAdmin = async (req, res) => {
    try {
        const { especificacionId } = req.params;

        const especificacionExiste =
            await prisma.especificacionProducto.findUnique({
                where: {
                    id: Number(especificacionId),
                },
            });

        if (!especificacionExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Especificación no encontrada",
            });
        }

        await prisma.especificacionProducto.delete({
            where: {
                id: Number(especificacionId),
            },
        });

        return res.json({
            ok: true,
            mensaje: "Especificación eliminada correctamente",
            especificacionEliminada: especificacionExiste,
        });
    } catch (error) {
        logger.error("Error al eliminar especificación admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar especificación",
        });
    }
};


export const reemplazarEspecificacionesProductoAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { especificaciones } = req.body;

        if (!Array.isArray(especificaciones)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Las especificaciones deben enviarse como lista",
            });
        }

        const productoExiste = await prisma.producto.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!productoExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Producto no encontrado",
            });
        }

        const especificacionesLimpias = especificaciones
            .filter((esp) => esp.nombre?.trim() && esp.valor?.trim())
            .map((esp, index) => ({
                productoId: Number(id),
                nombre: esp.nombre.trim(),
                valor: esp.valor.trim(),
                orden: index + 1,
            }));

        await prisma.$transaction(async (tx) => {
            await tx.especificacionProducto.deleteMany({
                where: {
                    productoId: Number(id),
                },
            });

            if (especificacionesLimpias.length > 0) {
                await tx.especificacionProducto.createMany({
                    data: especificacionesLimpias,
                });
            }
        });

        const productoActualizado = await prisma.producto.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                categoria: true,
                marca: true,
                imagenes: {
                    orderBy: [
                        { esPrincipal: "desc" },
                        { orden: "asc" },
                    ],
                },
                especificaciones: {
                    orderBy: {
                        orden: "asc",
                    },
                },
            },
        });

        return res.json({
            ok: true,
            mensaje: "Especificaciones guardadas correctamente",
            producto: productoActualizado,
        });
    } catch (error) {
        logger.error("Error al reemplazar especificaciones admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al guardar especificaciones",
        });
    }
};