import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";

const PAGINA_DEFAULT = 1;
const LIMITE_DEFAULT = 20;
const LIMITE_MAXIMO = 100;

function normalizarEnteroPositivo(valor, defecto, maximo = null) {
    const numero = Number.parseInt(valor, 10);

    if (!Number.isFinite(numero) || numero < 1) {
        return defecto;
    }

    return maximo ? Math.min(numero, maximo) : numero;
}

function normalizarTextoFiltro(valor) {
    if (valor === undefined || valor === null) {
        return null;
    }

    const texto = String(valor).trim();

    return texto.length > 0 ? texto : null;
}

function construirFiltroRelacion(valor, campoSlug = null) {
    const texto = normalizarTextoFiltro(valor);

    if (!texto) {
        return null;
    }

    const filtros = [
        {
            nombre: {
                contains: texto,
                mode: "insensitive",
            },
        },
    ];

    const id = Number(texto);

    if (Number.isInteger(id) && id > 0) {
        filtros.push({ id });
    }

    if (campoSlug) {
        filtros.push({
            [campoSlug]: {
                equals: texto,
                mode: "insensitive",
            },
        });
    }

    return {
        OR: filtros,
    };
}

function construirOrderBy(orden) {
    const ordenesPermitidos = {
        precio_asc: { precio: "asc" },
        precio_desc: { precio: "desc" },
        recientes: { createdAt: "desc" },
        nombre_asc: { nombre: "asc" },
    };

    return ordenesPermitidos[orden] || { createdAt: "desc" };
}

export const obtenerProductos = async (req, res) => {
    try {
        const pagina = normalizarEnteroPositivo(
            req.query.page,
            PAGINA_DEFAULT,
        );
        const limite = normalizarEnteroPositivo(
            req.query.limit,
            LIMITE_DEFAULT,
            LIMITE_MAXIMO,
        );
        const skip = (pagina - 1) * limite;

        const categoria = construirFiltroRelacion(req.query.categoria, "slug");
        const marca = construirFiltroRelacion(req.query.marca);
        const buscar = normalizarTextoFiltro(req.query.buscar);
        const orderBy = construirOrderBy(req.query.orden);

        const where = {
            activo: true,
            ...(categoria ? { categoria } : {}),
            ...(marca ? { marca } : {}),
            ...(buscar
                ? {
                    OR: [
                        {
                            nombre: {
                                contains: buscar,
                                mode: "insensitive",
                            },
                        },
                        {
                            descripcion: {
                                contains: buscar,
                                mode: "insensitive",
                            },
                        },
                        {
                            sku: {
                                contains: buscar,
                                mode: "insensitive",
                            },
                        },
                        {
                            marca: {
                                nombre: {
                                    contains: buscar,
                                    mode: "insensitive",
                                },
                            },
                        },
                        {
                            categoria: {
                                nombre: {
                                    contains: buscar,
                                    mode: "insensitive",
                                },
                            },
                        },
                    ],
                }
                : {}),
        };

        const include = {
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
        };

        const [total, productos] = await prisma.$transaction([
            prisma.producto.count({ where }),
            prisma.producto.findMany({
                where,
                include,
                orderBy,
                skip,
                take: limite,
            }),
        ]);

        res.json({
            ok: true,
            productos,
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite),
        });
    } catch (error) {
        logger.error("Error al obtener productos:", serializeError(error));

        res.status(500).json({
            ok: false,
            mensaje: "No fue posible obtener los productos",
        });
    }
};

export const obtenerProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await prisma.producto.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                categoria: true,
                marca: true,
                imagenes: {
                    orderBy: {
                        orden: "asc",
                    },
                },
                especificaciones: {
                    orderBy: {
                        orden: "asc",
                    },
                },
            },
        });

        if (!producto) {
            return res.status(404).json({
                ok: false,
                mensaje: "Producto no encontrado",
            });
        }

        res.json({
            ok: true,
            producto,
        });
    } catch (error) {
        logger.error("Error al obtener producto:", serializeError(error));

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener el producto",
        });
    }
};

const generarSlug = (texto) => {
    return texto
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

export const crearProducto = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            precio,
            stock,
            sku,
            modelo,
            garantia,
            categoriaId,
            marcaId,
            imagenes = [],
            especificaciones = [],
        } = req.body;

        if (!nombre || !precio || !categoriaId) {
            return res.status(400).json({
                ok: false,
                mensaje: "Nombre, precio y categoría son obligatorios",
            });
        }

        const slugBase = generarSlug(nombre);

        const productoExiste = await prisma.producto.findUnique({
            where: {
                slug: slugBase,
            },
        });

        const slugFinal = productoExiste
            ? `${slugBase}-${Date.now()}`
            : slugBase;

        const nuevoProducto = await prisma.producto.create({
            data: {
                nombre,
                slug: slugFinal,
                descripcion,
                precio: Number(precio),
                stock: Number(stock) || 0,
                sku,
                modelo,
                garantia,
                categoriaId: Number(categoriaId),
                marcaId: marcaId ? Number(marcaId) : null,

                imagenes: {
                    create: imagenes.map((img, index) => ({
                        url: img.url,
                        publicId: img.publicId || null,
                        esPrincipal: img.esPrincipal || index === 0,
                        orden: img.orden || index + 1,
                        tipo: img.tipo || (img.esPrincipal ? "principal" : "galeria"),
                    })),
                },

                especificaciones: {
                    create: especificaciones.map((esp, index) => ({
                        nombre: esp.nombre,
                        valor: esp.valor,
                        orden: esp.orden || index + 1,
                    })),
                },
            },
            include: {
                categoria: true,
                marca: true,
                imagenes: {
                    orderBy: {
                        orden: "asc",
                    },
                },
                especificaciones: {
                    orderBy: {
                        orden: "asc",
                    },
                },
            },
        });

        res.status(201).json({
            ok: true,
            mensaje: "Producto creado correctamente",
            producto: nuevoProducto,
        });
    } catch (error) {
        logger.error("Error al crear producto:", serializeError(error));

        if (error.code === "P2002" && error.meta?.target?.includes("sku")) {
            return res.status(400).json({
                ok: false,
                mensaje: "Ya existe un producto con ese SKU",
            });
        }

        res.status(500).json({
            ok: false,
            mensaje: "Error al crear producto",
            error: error.message,
        });
    }
};

export const editarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const productoId = Number(id);

        if (!productoId) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID de producto inválido",
            });
        }

        const productoActual = await prisma.producto.findUnique({
            where: {
                id: productoId,
            },
        });

        if (!productoActual) {
            return res.status(404).json({
                ok: false,
                mensaje: "Producto no encontrado",
            });
        }

        const {
            nombre,
            descripcion,
            precio,
            stock,
            sku,
            modelo,
            garantia,
            categoriaId,
            marcaId,
            imagenes,
            especificaciones,
        } = req.body;

        let slugFinal = productoActual.slug;

        if (nombre && nombre !== productoActual.nombre) {
            const slugBase = generarSlug(nombre);

            const productoConMismoSlug = await prisma.producto.findFirst({
                where: {
                    slug: slugBase,
                    NOT: {
                        id: productoId,
                    },
                },
            });

            slugFinal = productoConMismoSlug
                ? `${slugBase}-${Date.now()}`
                : slugBase;
        }

        const productoEditado = await prisma.$transaction(async (tx) => {
            if (Array.isArray(imagenes)) {
                await tx.productoImagen.deleteMany({
                    where: {
                        productoId,
                    },
                });
            }

            if (Array.isArray(especificaciones)) {
                await tx.especificacionProducto.deleteMany({
                    where: {
                        productoId,
                    },
                });
            }

            return tx.producto.update({
                where: {
                    id: productoId,
                },
                data: {
                    nombre: nombre ?? undefined,
                    slug: slugFinal,
                    descripcion: descripcion ?? undefined,
                    precio: precio !== undefined ? Number(precio) : undefined,
                    stock: stock !== undefined ? Number(stock) : undefined,
                    sku: sku ?? undefined,
                    modelo: modelo ?? undefined,
                    garantia: garantia ?? undefined,
                    categoriaId: categoriaId !== undefined ? Number(categoriaId) : undefined,
                    marcaId: marcaId !== undefined ? Number(marcaId) : undefined,

                    imagenes: Array.isArray(imagenes)
                        ? {
                            create: imagenes.map((img, index) => ({
                                url: img.url,
                                publicId: img.publicId || null,
                                esPrincipal: img.esPrincipal || index === 0,
                                orden: img.orden || index + 1,
                                tipo: img.tipo || (img.esPrincipal ? "principal" : "galeria"),
                            })),
                        }
                        : undefined,

                    especificaciones: Array.isArray(especificaciones)
                        ? {
                            create: especificaciones.map((esp, index) => ({
                                nombre: esp.nombre,
                                valor: esp.valor,
                                orden: esp.orden || index + 1,
                            })),
                        }
                        : undefined,
                },
                include: {
                    categoria: true,
                    marca: true,
                    imagenes: {
                        orderBy: {
                            orden: "asc",
                        },
                    },
                    especificaciones: {
                        orderBy: {
                            orden: "asc",
                        },
                    },
                },
            });
        });

        res.json({
            ok: true,
            mensaje: "Producto actualizado correctamente",
            producto: productoEditado,
        });
    } catch (error) {
        logger.error("Error al editar producto:", serializeError(error));

        res.status(500).json({
            ok: false,
            mensaje: "Error al editar producto",
            error: error.message,
        });
    }
};

export const desactivarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const productoId = Number(id);

        if (!productoId) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID de producto inválido",
            });
        }

        const productoExiste = await prisma.producto.findUnique({
            where: {
                id: productoId,
            },
        });

        if (!productoExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Producto no encontrado",
            });
        }

        const productoDesactivado = await prisma.producto.update({
            where: {
                id: productoId,
            },
            data: {
                activo: false,
            },
        });

        res.json({
            ok: true,
            mensaje: "Producto desactivado correctamente",
            producto: productoDesactivado,
        });
    } catch (error) {
        logger.error("Error al desactivar producto:", serializeError(error));

        res.status(500).json({
            ok: false,
            mensaje: "Error al desactivar producto",
            error: error.message,
        });
    }
};

export const obtenerProductosAdmin = async (req, res) => {
    try {
        const productos = await prisma.producto.findMany({
            include: {
                categoria: true,
                marca: true,
                imagenes: {
                    orderBy: {
                        orden: "asc",
                    },
                },
                especificaciones: {
                    orderBy: {
                        orden: "asc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            ok: true,
            productos,
        });
    } catch (error) {
        logger.error("Error al obtener productos admin:", serializeError(error));

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener productos para admin",
            error: error.message,
        });
    }
};


export const reactivarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const productoId = Number(id);

        if (!productoId) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID de producto inválido",
            });
        }

        const productoExiste = await prisma.producto.findUnique({
            where: {
                id: productoId,
            },
        });

        if (!productoExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Producto no encontrado",
            });
        }

        const productoReactivado = await prisma.producto.update({
            where: {
                id: productoId,
            },
            data: {
                activo: true,
            },
            include: {
                categoria: true,
                marca: true,
                imagenes: {
                    orderBy: {
                        orden: "asc",
                    },
                },
                especificaciones: {
                    orderBy: {
                        orden: "asc",
                    },
                },
            },
        });

        res.json({
            ok: true,
            mensaje: "Producto reactivado correctamente",
            producto: productoReactivado,
        });
    } catch (error) {
        logger.error("Error al reactivar producto:", serializeError(error));

        res.status(500).json({
            ok: false,
            mensaje: "Error al reactivar producto",
            error: error.message,
        });
    }
};

export const agregarImagenProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const productoId = Number(id);

        const {
            url,
            publicId,
            esPrincipal = false,
            orden = 1,
            tipo = "galeria",
        } = req.body;

        if (!productoId) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID de producto inválido",
            });
        }

        if (!url) {
            return res.status(400).json({
                ok: false,
                mensaje: "La URL de la imagen es obligatoria",
            });
        }

        const productoExiste = await prisma.producto.findUnique({
            where: {
                id: productoId,
            },
        });

        if (!productoExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Producto no encontrado",
            });
        }

        const nuevaImagen = await prisma.$transaction(async (tx) => {
            if (esPrincipal) {
                await tx.productoImagen.updateMany({
                    where: {
                        productoId,
                    },
                    data: {
                        esPrincipal: false,
                    },
                });
            }

            return tx.productoImagen.create({
                data: {
                    productoId,
                    url,
                    publicId: publicId || null,
                    esPrincipal,
                    orden: Number(orden),
                    tipo,
                },
            });
        });

        res.status(201).json({
            ok: true,
            mensaje: "Imagen agregada correctamente",
            imagen: nuevaImagen,
        });
    } catch (error) {
        logger.error("Error al agregar imagen:", serializeError(error));

        res.status(500).json({
            ok: false,
            mensaje: "Error al agregar imagen",
            error: error.message,
        });
    }
};

export const actualizarImagenProducto = async (req, res) => {
    try {
        const { imagenId } = req.params;
        const idImagen = Number(imagenId);

        const { url, publicId, esPrincipal, orden, tipo } = req.body;

        if (!idImagen) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID de imagen inválido",
            });
        }

        if (!url) {
            return res.status(400).json({
                ok: false,
                mensaje: "La URL de la imagen es obligatoria",
            });
        }

        const imagenExiste = await prisma.productoImagen.findUnique({
            where: {
                id: idImagen,
            },
        });

        if (!imagenExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Imagen no encontrada",
            });
        }

        const imagenActualizada = await prisma.$transaction(async (tx) => {
            if (esPrincipal === true) {
                await tx.productoImagen.updateMany({
                    where: {
                        productoId: imagenExiste.productoId,
                    },
                    data: {
                        esPrincipal: false,
                    },
                });
            }

            return tx.productoImagen.update({
                where: {
                    id: idImagen,
                },
                data: {
                    url,
                    publicId: publicId || null,
                    esPrincipal: esPrincipal ?? imagenExiste.esPrincipal,
                    orden: orden !== undefined ? Number(orden) : imagenExiste.orden,
                    tipo: tipo || imagenExiste.tipo,
                },
            });
        });

        res.json({
            ok: true,
            mensaje: "Imagen actualizada correctamente",
            imagen: imagenActualizada,
        });
    } catch (error) {
        logger.error("Error al actualizar imagen:", serializeError(error));

        res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar imagen",
            error: error.message,
        });
    }
};


export const eliminarImagenProducto = async (req, res) => {
    try {
        const { imagenId } = req.params;
        const idImagen = Number(imagenId);

        if (!idImagen) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID de imagen inválido",
            });
        }

        const imagenExiste = await prisma.productoImagen.findUnique({
            where: {
                id: idImagen,
            },
        });

        if (!imagenExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Imagen no encontrada",
            });
        }

        await prisma.productoImagen.delete({
            where: {
                id: idImagen,
            },
        });

        res.json({
            ok: true,
            mensaje: "Imagen eliminada correctamente",
            imagenEliminada: imagenExiste,
        });
    } catch (error) {
        logger.error("Error al eliminar imagen:", serializeError(error));

        res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar imagen",
            error: error.message,
        });
    }
};

export const obtenerProductosDestacados = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        activo: true,
        destacado: true,
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
      orderBy: {
        updatedAt: "desc",
      },
      take: 8,
    });

    return res.json({
      ok: true,
      productos,
    });
  } catch (error) {
    logger.error("Error al obtener productos destacados:", serializeError(error));

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener productos destacados",
    });
  }
};
