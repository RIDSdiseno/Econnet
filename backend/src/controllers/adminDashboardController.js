import prisma from "../config/prisma.js";

const ejecutarSeguro = async (consulta, valorDefecto) => {
    try {
        return await consulta();
    } catch (error) {
        console.warn("Consulta dashboard omitida:", error.message);
        return valorDefecto;
    }
};

export const obtenerDashboardAdmin = async (req, res) => {
    try {
        const [
            totalProductos,
            productosActivos,
            productosStockBajo,
            totalPedidos,
            pedidosPendientes,
            totalUsuarios,
            categoriasActivas,
            anunciosActivos,
            tarifasActivas,
            ventasResultado,
            ultimosPedidos,
        ] = await Promise.all([
            ejecutarSeguro(() => prisma.producto.count(), 0),

            ejecutarSeguro(
                () =>
                    prisma.producto.count({
                        where: {
                            activo: true,
                        },
                    }),
                0,
            ),

            ejecutarSeguro(
                () =>
                    prisma.producto.count({
                        where: {
                            activo: true,
                            stock: {
                                lte: 5,
                            },
                        },
                    }),
                0,
            ),

            ejecutarSeguro(() => prisma.pedido.count(), 0),

            ejecutarSeguro(
                () =>
                    prisma.pedido.count({
                        where: {
                            estado: {
                                in: [
                                    "pendiente",
                                    "Pendiente",
                                    "PENDIENTE",
                                    "pagado",
                                    "Pagado",
                                    "PAGADO",
                                    "preparando",
                                    "Preparando",
                                    "PREPARANDO",
                                ],
                            },
                        },
                    }),
                0,
            ),

            ejecutarSeguro(() => prisma.usuario.count(), 0),

            ejecutarSeguro(
                () =>
                    prisma.categoria.count({
                        where: {
                            activo: true,
                        },
                    }),
                0,
            ),

            ejecutarSeguro(
                () =>
                    prisma.anuncio.count({
                        where: {
                            activo: true,
                        },
                    }),
                0,
            ),

            ejecutarSeguro(
                () =>
                    prisma.tarifaDespacho.count({
                        where: {
                            activo: true,
                        },
                    }),
                0,
            ),

            ejecutarSeguro(
                () =>
                    prisma.pedido.aggregate({
                        where: {
                            estado: {
                                notIn: [
                                    "cancelado",
                                    "Cancelado",
                                    "CANCELADO",
                                ],
                            },
                        },
                        _sum: {
                            total: true,
                        },
                    }),
                {
                    _sum: {
                        total: 0,
                    },
                },
            ),

            ejecutarSeguro(
                () =>
                    prisma.pedido.findMany({
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 5,
                        select: {
                            id: true,
                            numero: true,
                            estado: true,
                            total: true,
                            createdAt: true,
                            usuario: {
                                select: {
                                    nombre: true,
                                    email: true,
                                },
                            },
                        },
                    }),
                [],
            ),
        ]);

        return res.json({
            ok: true,
            resumen: {
                totalProductos,
                productosActivos,
                productosStockBajo,
                totalPedidos,
                pedidosPendientes,
                totalUsuarios,
                categoriasActivas,
                anunciosActivos,
                tarifasActivas,
                ventasTotales: ventasResultado?._sum?.total || 0,
            },
            ultimosPedidos,
        });
    } catch (error) {
        console.error("Error al obtener dashboard admin:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener dashboard",
        });
    }
};