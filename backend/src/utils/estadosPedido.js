export const estadosPedido = [
  {
    estado: "pendiente",
    titulo: "Pedido recibido",
    detalle: "Recibimos tu pedido correctamente.",
    orden: 1,
  },
  {
    estado: "confirmado",
    titulo: "Pago confirmado",
    detalle: "El pago fue confirmado y el pedido continuará su proceso.",
    orden: 2,
  },
  {
    estado: "preparando",
    titulo: "Preparando productos",
    detalle: "Estamos preparando los productos de tu pedido.",
    orden: 3,
  },
  {
    estado: "empaquetando",
    titulo: "Empaquetando pedido",
    detalle: "Tu pedido está siendo empaquetado para el despacho.",
    orden: 4,
  },
  {
    estado: "en_despacho",
    titulo: "Pedido en despacho",
    detalle: "Tu pedido ya salió a despacho.",
    orden: 5,
  },
  {
    estado: "entregado",
    titulo: "Pedido entregado",
    detalle: "Tu pedido fue entregado correctamente.",
    orden: 6,
  },
  {
    estado: "cancelado",
    titulo: "Pedido cancelado",
    detalle: "El pedido fue cancelado.",
    orden: 99,
  },
];

export const obtenerInfoEstadoPedido = (estado) => {
  return estadosPedido.find((item) => item.estado === estado) || estadosPedido[0];
};

export const estadoPedidoValido = (estado) => {
  return estadosPedido.some((item) => item.estado === estado);
};