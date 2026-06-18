import prisma from "../config/prisma.js";

function numeroPositivo(valor, valorPredeterminado) {
  const numero = Number.parseInt(valor, 10);

  return Number.isInteger(numero) && numero > 0
    ? numero
    : valorPredeterminado;
}

function fechaValida(valor) {
  if (!valor) {
    return false;
  }

  const fecha = new Date(valor);

  return !Number.isNaN(fecha.getTime());
}

function obtenerEstadoVenta(pedido) {
  if (
    pedido.estado === "cancelado" ||
    pedido.estadoPago === "cancelado" ||
    pedido.estadoPago === "rechazado"
  ) {
    return "cancelada";
  }

  if (
    pedido.estadoPago === "aprobado" &&
    pedido.estado !== "cancelado"
  ) {
    return "aprobada";
  }

  return "pendiente";
}

function construirFiltros(query) {
  const {
    busqueda,
    estadoPedido,
    estadoPago,
    categoriaId,
    marcaId,
    fechaDesde,
    fechaHasta,
  } = query;

  const where = {};

  if (busqueda?.trim()) {
    const criterio = busqueda.trim();

    where.OR = [
      {
        nombreProducto: {
          contains: criterio,
          mode: "insensitive",
        },
      },
      {
        marcaProducto: {
          contains: criterio,
          mode: "insensitive",
        },
      },
      {
        pedido: {
          numero: {
            contains: criterio,
            mode: "insensitive",
          },
        },
      },
      {
        pedido: {
          nombreCliente: {
            contains: criterio,
            mode: "insensitive",
          },
        },
      },
      {
        pedido: {
          emailCliente: {
            contains: criterio,
            mode: "insensitive",
          },
        },
      },
      {
        producto: {
          sku: {
            contains: criterio,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const filtrosPedido = {};

  if (estadoPedido?.trim()) {
    filtrosPedido.estado = estadoPedido.trim();
  }

  if (estadoPago?.trim()) {
    filtrosPedido.estadoPago = estadoPago.trim();
  }

  if (
    fechaValida(fechaDesde) ||
    fechaValida(fechaHasta)
  ) {
    filtrosPedido.createdAt = {};

    if (fechaValida(fechaDesde)) {
      filtrosPedido.createdAt.gte = new Date(
        `${fechaDesde}T00:00:00.000`,
      );
    }

    if (fechaValida(fechaHasta)) {
      filtrosPedido.createdAt.lte = new Date(
        `${fechaHasta}T23:59:59.999`,
      );
    }
  }

  if (Object.keys(filtrosPedido).length > 0) {
    where.pedido = filtrosPedido;
  }

  const filtrosProducto = {};

  const categoriaIdNumero = Number(categoriaId);
  const marcaIdNumero = Number(marcaId);

  if (
    Number.isInteger(categoriaIdNumero) &&
    categoriaIdNumero > 0
  ) {
    filtrosProducto.categoriaId = categoriaIdNumero;
  }

  if (
    Number.isInteger(marcaIdNumero) &&
    marcaIdNumero > 0
  ) {
    filtrosProducto.marcaId = marcaIdNumero;
  }

  if (Object.keys(filtrosProducto).length > 0) {
    where.producto = filtrosProducto;
  }

  return where;
}

function construirFiltrosPedidos(query) {
  const {
    busqueda,
    estadoPedido,
    estadoPago,
    categoriaId,
    marcaId,
    fechaDesde,
    fechaHasta,
  } = query;

  const condiciones = [
    {
      items: {
        some: {},
      },
    },
  ];

  if (busqueda?.trim()) {
    const criterio = busqueda.trim();

    condiciones.push({
      OR: [
        {
          numero: {
            contains: criterio,
            mode: "insensitive",
          },
        },
        {
          nombreCliente: {
            contains: criterio,
            mode: "insensitive",
          },
        },
        {
          emailCliente: {
            contains: criterio,
            mode: "insensitive",
          },
        },
        {
          items: {
            some: {
              OR: [
                {
                  nombreProducto: {
                    contains: criterio,
                    mode: "insensitive",
                  },
                },
                {
                  marcaProducto: {
                    contains: criterio,
                    mode: "insensitive",
                  },
                },
                {
                  producto: {
                    sku: {
                      contains: criterio,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });
  }

  if (estadoPedido?.trim()) {
    condiciones.push({
      estado: estadoPedido.trim(),
    });
  }

  if (estadoPago?.trim()) {
    condiciones.push({
      estadoPago: estadoPago.trim(),
    });
  }

  if (fechaValida(fechaDesde) || fechaValida(fechaHasta)) {
    const filtroFecha = {};

    if (fechaValida(fechaDesde)) {
      filtroFecha.gte = new Date(
        `${fechaDesde}T00:00:00.000`,
      );
    }

    if (fechaValida(fechaHasta)) {
      filtroFecha.lte = new Date(
        `${fechaHasta}T23:59:59.999`,
      );
    }

    condiciones.push({
      createdAt: filtroFecha,
    });
  }

  const categoriaIdNumero = Number(categoriaId);
  const marcaIdNumero = Number(marcaId);

  const filtroProducto = {};

  if (
    Number.isInteger(categoriaIdNumero) &&
    categoriaIdNumero > 0
  ) {
    filtroProducto.categoriaId = categoriaIdNumero;
  }

  if (
    Number.isInteger(marcaIdNumero) &&
    marcaIdNumero > 0
  ) {
    filtroProducto.marcaId = marcaIdNumero;
  }

  if (Object.keys(filtroProducto).length > 0) {
    condiciones.push({
      items: {
        some: {
          producto: filtroProducto,
        },
      },
    });
  }

  return {
    AND: condiciones,
  };
}


export const obtenerProductosVendidosDetalle = async (
  req,
  res,
) => {
  try {
    const pagina = numeroPositivo(req.query.pagina, 1);

    const limite = Math.min(
      numeroPositivo(req.query.limite, 10),
      100,
    );

    const skip = (pagina - 1) * limite;

    const where = construirFiltrosPedidos(req.query);

    const [pedidos, total, pedidosMetricas] =
      await prisma.$transaction([
        prisma.pedido.findMany({
          where,
          skip,
          take: limite,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            numero: true,
            estado: true,
            estadoPago: true,
            metodoPago: true,
            subtotal: true,
            despacho: true,
            total: true,
            nombreCliente: true,
            emailCliente: true,
            createdAt: true,

            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },

            items: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
                productoId: true,
                nombreProducto: true,
                marcaProducto: true,
                imagenUrl: true,
                precioUnitario: true,
                cantidad: true,
                subtotal: true,

                producto: {
                  select: {
                    id: true,
                    nombre: true,
                    sku: true,
                    stock: true,
                    activo: true,

                    marca: {
                      select: {
                        id: true,
                        nombre: true,
                      },
                    },

                    categoria: {
                      select: {
                        id: true,
                        nombre: true,
                      },
                    },

                    imagenes: {
                      where: {
                        esPrincipal: true,
                      },
                      take: 1,
                      select: {
                        url: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),

        prisma.pedido.count({
          where,
        }),

        prisma.pedido.findMany({
          where,
          select: {
            id: true,
            estado: true,
            estadoPago: true,

            items: {
              select: {
                productoId: true,
                cantidad: true,
                subtotal: true,
              },
            },
          },
        }),
      ]);

    let unidadesAprobadas = 0;
    let unidadesPendientes = 0;
    let unidadesCanceladas = 0;
    let ingresosAprobados = 0;

    const productosDistintos = new Set();

    for (const pedido of pedidosMetricas) {
      const estadoVenta = obtenerEstadoVenta(pedido);

      for (const item of pedido.items) {
        productosDistintos.add(item.productoId);

        if (estadoVenta === "aprobada") {
          unidadesAprobadas += item.cantidad;
          ingresosAprobados += item.subtotal;
        } else if (estadoVenta === "cancelada") {
          unidadesCanceladas += item.cantidad;
        } else {
          unidadesPendientes += item.cantidad;
        }
      }
    }

    const ventas = pedidos.map((pedido) => {
      const productos = pedido.items.map((item) => ({
        id: item.id,
        productoId: item.productoId,

        nombre:
          item.nombreProducto ||
          item.producto.nombre,

        sku: item.producto.sku,

        marca:
          item.marcaProducto ||
          item.producto.marca?.nombre ||
          "Sin marca",

        categoria:
          item.producto.categoria?.nombre ||
          "Sin categoría",

        imagenUrl:
          item.imagenUrl ||
          item.producto.imagenes?.[0]?.url ||
          null,

        stockActual: item.producto.stock,
        activo: item.producto.activo,
        precioUnitario: item.precioUnitario,
        cantidad: item.cantidad,
        subtotal: item.subtotal,
      }));

      const unidadesTotales = productos.reduce(
        (totalUnidades, producto) =>
          totalUnidades + producto.cantidad,
        0,
      );

      const subtotalProductos = productos.reduce(
        (totalProductos, producto) =>
          totalProductos + producto.subtotal,
        0,
      );

      return {
        id: pedido.id,

        pedido: {
          id: pedido.id,
          numero: pedido.numero,
          estado: pedido.estado,
          estadoPago: pedido.estadoPago,
          metodoPago: pedido.metodoPago,
          subtotal: pedido.subtotal,
          despacho: pedido.despacho,
          total: pedido.total,
          createdAt: pedido.createdAt,
        },

        cliente: {
          id: pedido.usuario?.id || null,

          nombre:
            pedido.usuario?.nombre ||
            pedido.nombreCliente ||
            "Sin nombre",

          email:
            pedido.usuario?.email ||
            pedido.emailCliente ||
            "Sin correo",
        },

        productos,
        cantidadProductos: productos.length,
        unidadesTotales,
        subtotalProductos,
        estadoVenta: obtenerEstadoVenta(pedido),
      };
    });

    const totalPaginas = Math.max(
      Math.ceil(total / limite),
      1,
    );

    return res.json({
      ok: true,
      ventas,

      metricas: {
        totalRegistros: total,
        productosDistintos: productosDistintos.size,
        unidadesAprobadas,
        unidadesPendientes,
        unidadesCanceladas,
        ingresosAprobados,
      },

      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas,
        tieneAnterior: pagina > 1,
        tieneSiguiente: pagina < totalPaginas,
      },
    });
  } catch (error) {
    console.error(
      "Error al obtener ventas agrupadas por pedido:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        "No se pudieron obtener los productos vendidos",
    });
  }
};

export const obtenerResumenProductosVendidos = async (
  req,
  res,
) => {
  try {
    const pagina = numeroPositivo(req.query.pagina, 1);
    const limite = Math.min(
      numeroPositivo(req.query.limite, 10),
      100,
    );

    const where = construirFiltros(req.query);

    const items = await prisma.pedidoItem.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        productoId: true,
        nombreProducto: true,
        marcaProducto: true,
        imagenUrl: true,
        cantidad: true,
        subtotal: true,
        createdAt: true,

        producto: {
          select: {
            id: true,
            nombre: true,
            sku: true,
            stock: true,
            activo: true,

            marca: {
              select: {
                id: true,
                nombre: true,
              },
            },

            categoria: {
              select: {
                id: true,
                nombre: true,
              },
            },

            imagenes: {
              where: {
                esPrincipal: true,
              },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },

        pedido: {
          select: {
            id: true,
            estado: true,
            estadoPago: true,
            createdAt: true,
          },
        },
      },
    });

    const resumenMap = new Map();

    for (const item of items) {
      if (!resumenMap.has(item.productoId)) {
        resumenMap.set(item.productoId, {
          productoId: item.productoId,
          nombre:
            item.nombreProducto ||
            item.producto.nombre,
          sku: item.producto.sku,
          marca:
            item.marcaProducto ||
            item.producto.marca?.nombre ||
            "Sin marca",
          categoria:
            item.producto.categoria?.nombre ||
            "Sin categoría",
          imagenUrl:
            item.imagenUrl ||
            item.producto.imagenes?.[0]?.url ||
            null,
          stockActual: item.producto.stock,
          activo: item.producto.activo,

          unidadesAprobadas: 0,
          unidadesPendientes: 0,
          unidadesCanceladas: 0,
          ingresosAprobados: 0,
          cantidadPedidos: 0,
          ultimaVenta: null,

          pedidosIds: new Set(),
        });
      }

      const productoResumen = resumenMap.get(
        item.productoId,
      );

      productoResumen.pedidosIds.add(
        item.pedido.id,
      );

      const estadoVenta = obtenerEstadoVenta(
        item.pedido,
      );

      if (estadoVenta === "aprobada") {
        productoResumen.unidadesAprobadas +=
          item.cantidad;

        productoResumen.ingresosAprobados +=
          item.subtotal;

        if (
          !productoResumen.ultimaVenta ||
          new Date(item.pedido.createdAt) >
          new Date(productoResumen.ultimaVenta)
        ) {
          productoResumen.ultimaVenta =
            item.pedido.createdAt;
        }
      } else if (estadoVenta === "cancelada") {
        productoResumen.unidadesCanceladas +=
          item.cantidad;
      } else {
        productoResumen.unidadesPendientes +=
          item.cantidad;
      }
    }

    let resumen = Array.from(
      resumenMap.values(),
    ).map((producto) => ({
      productoId: producto.productoId,
      nombre: producto.nombre,
      sku: producto.sku,
      marca: producto.marca,
      categoria: producto.categoria,
      imagenUrl: producto.imagenUrl,
      stockActual: producto.stockActual,
      activo: producto.activo,

      unidadesAprobadas:
        producto.unidadesAprobadas,
      unidadesPendientes:
        producto.unidadesPendientes,
      unidadesCanceladas:
        producto.unidadesCanceladas,
      ingresosAprobados:
        producto.ingresosAprobados,
      cantidadPedidos:
        producto.pedidosIds.size,
      ultimaVenta: producto.ultimaVenta,
    }));

    const ordenarPor =
      req.query.ordenarPor || "unidades";

    resumen.sort((a, b) => {
      if (ordenarPor === "ingresos") {
        return (
          b.ingresosAprobados -
          a.ingresosAprobados
        );
      }

      if (ordenarPor === "ultimaVenta") {
        return (
          new Date(b.ultimaVenta || 0) -
          new Date(a.ultimaVenta || 0)
        );
      }

      if (ordenarPor === "producto") {
        return a.nombre.localeCompare(
          b.nombre,
          "es",
        );
      }

      return (
        b.unidadesAprobadas -
        a.unidadesAprobadas
      );
    });

    const total = resumen.length;
    const inicio = (pagina - 1) * limite;
    const fin = inicio + limite;

    resumen = resumen.slice(inicio, fin);

    return res.json({
      ok: true,
      resumen,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.max(
          Math.ceil(total / limite),
          1,
        ),
        tieneAnterior: pagina > 1,
        tieneSiguiente:
          pagina < Math.ceil(total / limite),
      },
    });
  } catch (error) {
    console.error(
      "Error al obtener resumen de productos vendidos:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        "No se pudo obtener el resumen de productos vendidos",
    });
  }
};



export const obtenerFiltrosProductosVendidos = async (req, res) => {
  try {
    /*
     * Solo consideramos productos que aparecen al menos una vez
     * dentro de un pedido.
     */
    const items = await prisma.pedidoItem.findMany({
      distinct: ["productoId"],
      select: {
        productoId: true,

        producto: {
          select: {
            categoria: {
              select: {
                id: true,
                nombre: true,
              },
            },

            marca: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    const categoriasMap = new Map();
    const marcasMap = new Map();

    for (const item of items) {
      const categoria = item.producto?.categoria;
      const marca = item.producto?.marca;

      if (!categoria || !marca) {
        continue;
      }

      if (!categoriasMap.has(categoria.id)) {
        categoriasMap.set(categoria.id, {
          id: categoria.id,
          nombre: categoria.nombre,
          marcaIds: new Set(),
        });
      }

      if (!marcasMap.has(marca.id)) {
        marcasMap.set(marca.id, {
          id: marca.id,
          nombre: marca.nombre,
          categoriaIds: new Set(),
        });
      }

      categoriasMap
        .get(categoria.id)
        .marcaIds.add(marca.id);

      marcasMap
        .get(marca.id)
        .categoriaIds.add(categoria.id);
    }

    const categorias = Array.from(
      categoriasMap.values(),
    )
      .map((categoria) => ({
        id: categoria.id,
        nombre: categoria.nombre,
        marcaIds: Array.from(categoria.marcaIds),
      }))
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es"),
      );

    const marcas = Array.from(marcasMap.values())
      .map((marca) => ({
        id: marca.id,
        nombre: marca.nombre,
        categoriaIds: Array.from(
          marca.categoriaIds,
        ),
      }))
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es"),
      );

    return res.json({
      ok: true,
      categorias,
      marcas,
    });
  } catch (error) {
    console.error(
      "Error al obtener filtros de productos vendidos:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        "No se pudieron obtener las opciones de los filtros",
    });
  }
};