import prisma from "../config/prisma.js";
import {
    estadoPedidoValido,
    obtenerInfoEstadoPedido,
} from "../utils/estadosPedido.js";

export const obtenerPedidosAdmin = async (req, res) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        telefono: true,
                        rut: true,
                    },
                },
                items: true,
                seguimientos: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        return res.json({
            ok: true,
            pedidos,
        });
    } catch (error) {
        console.error("Error al obtener pedidos admin:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener pedidos",
        });
    }
};

export const obtenerPedidoAdminPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await prisma.pedido.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        telefono: true,
                        rut: true,
                    },
                },
                direccion: true,
                items: true,
                seguimientos: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

        if (!pedido) {
            return res.status(404).json({
                ok: false,
                mensaje: "Pedido no encontrado",
            });
        }

        return res.json({
            ok: true,
            pedido,
        });
    } catch (error) {
        console.error("Error al obtener pedido admin:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener el pedido",
        });
    }
};

export const actualizarEstadoPedidoAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El estado es obligatorio",
            });
        }

        if (!estadoPedidoValido(estado)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Estado de pedido no válido",
            });
        }

        const pedidoExistente = await prisma.pedido.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                seguimientos: true,
            },
        });

        if (!pedidoExistente) {
            return res.status(404).json({
                ok: false,
                mensaje: "Pedido no encontrado",
            });
        }

        const flujoEstados = [
            "pendiente",
            "confirmado",
            "preparando",
            "empaquetando",
            "en_despacho",
            "entregado",
        ];

        const estadosYaRegistrados = pedidoExistente.seguimientos.map(
            (seguimiento) => seguimiento.estado
        );

        let estadosParaCrear = [];

        if (estado === "cancelado") {
            estadosParaCrear = ["cancelado"];
        } else {
            const indiceEstadoNuevo = flujoEstados.indexOf(estado);

            if (indiceEstadoNuevo === -1) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Estado de pedido no válido",
                });
            }

            estadosParaCrear = flujoEstados
                .slice(0, indiceEstadoNuevo + 1)
                .filter((estadoFlujo) => !estadosYaRegistrados.includes(estadoFlujo));
        }

        const pedidoActualizado = await prisma.$transaction(async (tx) => {
            const pedido = await tx.pedido.update({
                where: {
                    id: Number(id),
                },
                data: {
                    estado,
                },
            });

            for (const estadoCrear of estadosParaCrear) {
                const infoEstado = obtenerInfoEstadoPedido(estadoCrear);

                await tx.pedidoSeguimiento.create({
                    data: {
                        pedidoId: Number(id),
                        estado: estadoCrear,
                        titulo: infoEstado.titulo,
                        detalle: infoEstado.detalle,
                    },
                });
            }

            return pedido;
        });

        return res.json({
            ok: true,
            mensaje: "Estado actualizado correctamente",
            pedido: pedidoActualizado,
        });
    } catch (error) {
        console.error("Error al actualizar estado admin:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar el estado del pedido",
        });
    }
};