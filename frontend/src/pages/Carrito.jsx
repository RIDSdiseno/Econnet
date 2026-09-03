import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, message } from "antd";
import {
  MinusOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  obtenerCarrito,
  obtenerProductoPorId,
  actualizarCantidadCarrito,
  eliminarProductoCarrito,
} from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductoDetalleLink from "../components/ProductoDetalleLink";
import { useAuth } from "../context/AuthContext";
import {
  obtenerCarritoInvitado,
  actualizarCantidadCarritoInvitado,
  eliminarItemCarritoInvitado,
} from "../utils/carritoInvitado";

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function adaptarItemCarrito(item) {
  const producto = item.producto;

  const imagenPrincipal =
    producto.imagenes?.find((imagen) => imagen.esPrincipal)?.url ||
    producto.imagenes?.find((imagen) => imagen.tipo !== "oferta_wide")?.url ||
    producto.imagenes?.[0]?.url ||
    "/img/productos/producto.png";

  return {
    id: producto.id,
    nombre: producto.nombre,
    marca: producto.marca?.nombre || "Sin marca",
    categoria: producto.categoria?.nombre || "Sin categoría",
    imagen: imagenPrincipal,
    precio: producto.precio,
    precioNormal: producto.precioNormal || producto.precio,
    descuento: producto.enOferta ? producto.descuento || 0 : 0,
    cantidad: item.cantidad,
    stock: producto.stock > 0 ? `${producto.stock} unidades` : "No disponible",
    stockNumero: producto.stock,
  };
}

function adaptarProductoInvitado(producto, cantidad) {
  const imagenPrincipal =
    producto.imagenes?.find((imagen) => imagen.esPrincipal)?.url ||
    producto.imagenes?.find((imagen) => imagen.tipo !== "oferta_wide")?.url ||
    producto.imagenes?.[0]?.url ||
    "/img/productos/producto.png";

  return {
    id: producto.id,
    nombre: producto.nombre,
    marca: producto.marca?.nombre || "Sin marca",
    categoria: producto.categoria?.nombre || "Sin categoría",
    imagen: imagenPrincipal,
    precio: producto.precio,
    precioNormal: producto.precioNormal || producto.precio,
    descuento: producto.enOferta ? producto.descuento || 0 : 0,
    cantidad,
    stock: producto.stock > 0 ? `${producto.stock} unidades` : "No disponible",
    stockNumero: producto.stock,
  };
}

function Carrito() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, usuario, estaLogueado, cargandoAuth } = useAuth();

  const [productosCarrito, setProductosCarrito] = useState([]);
  const [cargandoCarrito, setCargandoCarrito] = useState(true);
  const [actualizandoId, setActualizandoId] = useState(null);

  useEffect(() => {
    const cargarCarrito = async () => {
      if (cargandoAuth) return;

      try {
        setCargandoCarrito(true);

        if (estaLogueado && token) {
          const data = await obtenerCarrito(token);
          const productosAdaptados = data.items.map(adaptarItemCarrito);

          setProductosCarrito(productosAdaptados);
          return;
        }

        const carritoInvitado = obtenerCarritoInvitado();

        if (carritoInvitado.length === 0) {
          setProductosCarrito([]);
          return;
        }

        const productosAdaptados = await Promise.all(
          carritoInvitado.map(async (item) => {
            const producto = await obtenerProductoPorId(item.productoId);

            return adaptarProductoInvitado(producto, item.cantidad);
          }),
        );

        setProductosCarrito(
          productosAdaptados.filter((producto) => producto.stockNumero > 0),
        );
      } catch (error) {
        message.error(error.message || "No se pudo cargar el carrito");
      } finally {
        setCargandoCarrito(false);
      }
    };

    cargarCarrito();
  }, [token, estaLogueado, cargandoAuth]);

  const aumentarCantidad = async (id) => {
    const productoActual = productosCarrito.find(
      (producto) => producto.id === id,
    );

    if (!productoActual) return;

    const nuevaCantidad = productoActual.cantidad + 1;

    if (nuevaCantidad > productoActual.stockNumero) {
      message.warning("No hay stock suficiente");
      return;
    }

    try {
      setActualizandoId(id);

      if (estaLogueado && token) {
        const itemActualizado = await actualizarCantidadCarrito(
          token,
          id,
          nuevaCantidad,
        );

        const productoAdaptado = adaptarItemCarrito(itemActualizado);

        setProductosCarrito((productos) =>
          productos.map((producto) =>
            producto.id === id ? productoAdaptado : producto,
          ),
        );

        return;
      }

      actualizarCantidadCarritoInvitado(id, nuevaCantidad);

      setProductosCarrito((productos) =>
        productos.map((producto) =>
          producto.id === id
            ? {
                ...producto,
                cantidad: nuevaCantidad,
              }
            : producto,
        ),
      );
    } catch (error) {
      message.error(error.message || "No se pudo actualizar la cantidad");
    } finally {
      setActualizandoId(null);
    }
  };

  const disminuirCantidad = async (id) => {
    const productoActual = productosCarrito.find(
      (producto) => producto.id === id,
    );

    if (!productoActual || productoActual.cantidad <= 1) return;

    const nuevaCantidad = productoActual.cantidad - 1;

    try {
      setActualizandoId(id);

      if (estaLogueado && token) {
        const itemActualizado = await actualizarCantidadCarrito(
          token,
          id,
          nuevaCantidad,
        );

        const productoAdaptado = adaptarItemCarrito(itemActualizado);

        setProductosCarrito((productos) =>
          productos.map((producto) =>
            producto.id === id ? productoAdaptado : producto,
          ),
        );

        return;
      }

      actualizarCantidadCarritoInvitado(id, nuevaCantidad);

      setProductosCarrito((productos) =>
        productos.map((producto) =>
          producto.id === id
            ? {
                ...producto,
                cantidad: nuevaCantidad,
              }
            : producto,
        ),
      );
    } catch (error) {
      message.error(error.message || "No se pudo actualizar la cantidad");
    } finally {
      setActualizandoId(null);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      setActualizandoId(id);

      if (estaLogueado && token) {
        await eliminarProductoCarrito(token, id);
      } else {
        eliminarItemCarritoInvitado(id);
      }

      setProductosCarrito((productos) =>
        productos.filter((producto) => producto.id !== id),
      );

      message.success("Producto eliminado del carrito");
    } catch (error) {
      message.error(error.message || "No se pudo eliminar el producto");
    } finally {
      setActualizandoId(null);
    }
  };

  const errorPago = searchParams.get("error");

  const avisoPago = useMemo(() => {
    if (errorPago === "webpay_cancelado") {
      return {
        tipo: "warning",
        titulo: "Pago cancelado",
        descripcion:
          "Anulaste el pago en Webpay. Tus productos siguen en el carrito para que puedas intentarlo nuevamente.",
      };
    }

    if (errorPago === "pago_rechazado") {
      return {
        tipo: "error",
        titulo: "Pago rechazado",
        descripcion:
          "Webpay rechazó el pago. El pedido fue cancelado, pero tus productos siguen en el carrito.",
      };
    }

    if (errorPago === "webpay_error") {
      return {
        tipo: "error",
        titulo: "No se pudo procesar el pago",
        descripcion:
          "Ocurrió un problema al volver desde Webpay. Puedes revisar tu carrito e intentarlo nuevamente.",
      };
    }

    return null;
  }, [errorPago]);

  const tieneDescuentoBienvenida =
    usuario?.descuentoBienvenidaDisponible === true &&
    usuario?.descuentoBienvenidaUsado === false;

  const resumen = useMemo(() => {
    const subtotal = productosCarrito.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0,
    );

    const descuentoBienvenida = tieneDescuentoBienvenida
      ? Math.round(subtotal * 0.03)
      : 0;

    const total = subtotal - descuentoBienvenida;

    const neto = Math.round(total / 1.19);
    const iva = total - neto;

    return {
      subtotal,
      descuentoBienvenida,
      descuento: descuentoBienvenida,
      neto,
      iva,
      total,
      cantidadProductos: productosCarrito.reduce(
        (total, producto) => total + producto.cantidad,
        0,
      ),
    };
  }, [productosCarrito, tieneDescuentoBienvenida]);

  if (cargandoAuth || cargandoCarrito) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Cargando carrito...
          </h1>

          <p className="text-gray-600 mt-2">
            Estamos obteniendo tus productos guardados.
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span>Carrito</span>
        </div>

        <div className="mb-6">
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black"
          >
            <ArrowLeftOutlined />
            Seguir comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Columna izquierda */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <ShoppingCartOutlined className="text-3xl text-gray-900" />

              <div>
                <h1 className="text-3xl font-black text-gray-900">Carrito</h1>

                <p className="text-gray-600">
                  {resumen.cantidadProductos} producto
                  {resumen.cantidadProductos !== 1 ? "s" : ""} en tu carrito
                </p>
              </div>
            </div>

            {tieneDescuentoBienvenida && (
              <Alert
                type="success"
                message="Descuento de bienvenida activo"
                description={`Se aplicará un 3% de descuento en tu primera compra: -${formatearPrecio(
                  resumen.descuentoBienvenida,
                )}.`}
                showIcon
                className="!mb-6 !rounded-2xl"
              />
            )}

            {/* Aviso */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 mb-6 flex items-center gap-3">
              <CheckCircleOutlined className="text-emerald-500 text-xl" />

              <p className="text-sm text-gray-700">
                Compra segura. Revisa tus productos antes de continuar con el
                pago.
              </p>
            </div>

            {productosCarrito.length > 0 ? (
              <div className="space-y-5">
                {productosCarrito.map((producto) => (
                  <article
                    key={producto.id}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                  >
                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Vendido por Econnet
                        </p>

                        <p className="text-xs text-gray-500">
                          Producto tecnológico seleccionado
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={actualizandoId === producto.id}
                        onClick={() => eliminarProducto(producto.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-[130px_1fr_150px] gap-5 items-center">
                      {/* Imagen */}
                      <ProductoDetalleLink productoId={producto.id}>
                        <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center p-3">
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </ProductoDetalleLink>

                      {/* Info */}
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase">
                          {producto.marca}
                        </p>

                        <ProductoDetalleLink productoId={producto.id}>
                          <h2 className="text-base font-bold text-gray-900 mt-1 hover:text-black">
                            {producto.nombre}
                          </h2>
                        </ProductoDetalleLink>

                        <p className="text-sm text-gray-500 mt-1">
                          Categoría: {producto.categoria}
                        </p>

                        {producto.descuento > 0 &&
                          producto.precioNormal > producto.precio && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-blue-700 bg-cyan-100 px-2 py-1 rounded">
                                {producto.descuento}% DCTO.
                              </span>

                              <span className="text-xs text-gray-400 line-through">
                                {formatearPrecio(producto.precioNormal)}
                              </span>
                            </div>
                          )}

                        <p className="text-sm text-emerald-600 font-bold mt-2">
                          Stock: {producto.stock}
                        </p>
                      </div>

                      {/* Precio y cantidad */}
                      <div className="md:text-right">
                        <p className="text-2xl font-black text-gray-950">
                          {formatearPrecio(producto.precio)}
                        </p>

                        <p className="text-xs text-gray-500">
                          Precio transferencia
                        </p>

                        <div className="mt-4 inline-flex items-center rounded-xl border border-gray-300 overflow-hidden">
                          <button
                            type="button"
                            disabled={
                              actualizandoId === producto.id ||
                              producto.cantidad <= 1
                            }
                            onClick={() => disminuirCantidad(producto.id)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                          >
                            <MinusOutlined />
                          </button>

                          <span className="w-12 h-10 flex items-center justify-center bg-white font-bold">
                            {producto.cantidad}
                          </span>

                          <button
                            type="button"
                            disabled={
                              actualizandoId === producto.id ||
                              producto.cantidad >= producto.stockNumero
                            }
                            onClick={() => aumentarCantidad(producto.id)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                          >
                            <PlusOutlined />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
                <ShoppingCartOutlined className="text-5xl text-gray-300 mb-4" />

                <h2 className="text-2xl font-black text-gray-900">
                  Tu carrito está vacío
                </h2>

                <p className="text-gray-600 mt-2">
                  Agrega productos para continuar con tu compra.
                </p>

                <Link to="/productos">
                  <Button
                    size="large"
                    className="!mt-6 !h-12 !rounded-xl !font-bold"
                  >
                    Ver productos
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* Resumen */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-5">
                Resumen de la compra
              </h2>
              <div className="space-y-4 border-b border-gray-200 pb-5">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">
                    Productos ({resumen.cantidadProductos})
                  </span>

                  <span className="font-bold">
                    {formatearPrecio(resumen.subtotal)}
                  </span>
                </div>

                {resumen.descuentoBienvenida > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">
                      Descuento bienvenida 3%
                    </span>

                    <span className="font-bold text-emerald-600">
                      -{formatearPrecio(resumen.descuentoBienvenida)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">Despacho</span>

                  <span className="font-bold text-emerald-600">Gratis</span>
                </div>
              </div>

              <div className="flex justify-between items-end mt-5">
                <div>
                  <p className="text-sm font-bold text-gray-600">Total</p>

                  <p className="text-xs text-gray-500">
                    Neto: {formatearPrecio(resumen.neto)}
                  </p>

                  <p className="text-xs text-gray-500">
                    IVA incluido 19%: {formatearPrecio(resumen.iva)}
                  </p>
                </div>

                <p className="text-3xl font-black text-gray-950">
                  {formatearPrecio(resumen.total)}
                </p>
              </div>

              <Link to="/checkout">
                <Button
                  block
                  size="large"
                  type="primary"
                  disabled={productosCarrito.length === 0}
                  className="!h-14 !mt-6 !rounded-2xl !bg-gray-950 !font-black hover:!bg-black disabled:!bg-gray-300"
                >
                  Continuar compra
                </Button>
              </Link>

              <Link to="/productos">
                <Button
                  block
                  size="large"
                  className="!h-12 !mt-3 !rounded-2xl !font-bold"
                >
                  Agregar más productos
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Carrito;
