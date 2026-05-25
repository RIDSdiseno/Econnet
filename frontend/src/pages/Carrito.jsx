import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import {
  MinusOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const carritoInicial = [
  {
    id: 1,
    nombre:
      "Notebook HP Victus Gaming AMD Ryzen 7, 24GB RAM, RTX 5050, 1TB SSD",
    marca: "HP",
    categoria: "Notebook",
    imagen: "/img/productos/notebook-hp.png",
    precio: 1349480,
    precioNormal: 1666650,
    descuento: 19,
    cantidad: 1,
    stock: "Más de 20 unidades",
  },
  {
    id: 2,
    nombre: 'Monitor Gamer ASUS TUF 27" Full HD 180Hz',
    marca: "ASUS",
    categoria: "Monitores",
    imagen: "/img/productos/monitor-asus.png",
    precio: 224990,
    precioNormal: 299990,
    descuento: 25,
    cantidad: 1,
    stock: "Disponible",
  },
];

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function Carrito() {
  const [productosCarrito, setProductosCarrito] = useState(carritoInicial);

  const aumentarCantidad = (id) => {
    setProductosCarrito((productos) =>
      productos.map((producto) =>
        producto.id === id
          ? { ...producto, cantidad: producto.cantidad + 1 }
          : producto,
      ),
    );
  };

  const disminuirCantidad = (id) => {
    setProductosCarrito((productos) =>
      productos.map((producto) =>
        producto.id === id && producto.cantidad > 1
          ? { ...producto, cantidad: producto.cantidad - 1 }
          : producto,
      ),
    );
  };

  const eliminarProducto = (id) => {
    setProductosCarrito((productos) =>
      productos.filter((producto) => producto.id !== id),
    );
  };

  const resumen = useMemo(() => {
    const subtotal = productosCarrito.reduce(
      (total, producto) => total + producto.precioNormal * producto.cantidad,
      0,
    );

    const totalProductos = productosCarrito.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0,
    );

    const descuento = subtotal - totalProductos;

    return {
      subtotal,
      descuento,
      total: totalProductos,
      cantidadProductos: productosCarrito.reduce(
        (total, producto) => total + producto.cantidad,
        0,
      ),
    };
  }, [productosCarrito]);

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
                        onClick={() => eliminarProducto(producto.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-[130px_1fr_150px] gap-5 items-center">
                      {/* Imagen */}
                      <Link to={`/producto/${producto.id}`}>
                        <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center p-3">
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase">
                          {producto.marca}
                        </p>

                        <Link to={`/producto/${producto.id}`}>
                          <h2 className="text-base font-bold text-gray-900 mt-1 hover:text-black">
                            {producto.nombre}
                          </h2>
                        </Link>

                        <p className="text-sm text-gray-500 mt-1">
                          Categoría: {producto.categoria}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-blue-700 bg-cyan-100 px-2 py-1 rounded">
                            {producto.descuento}% DCTO.
                          </span>

                          <span className="text-xs text-gray-400 line-through">
                            {formatearPrecio(producto.precioNormal)}
                          </span>
                        </div>

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
                            onClick={() => disminuirCantidad(producto.id)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
                          >
                            <MinusOutlined />
                          </button>

                          <span className="w-12 h-10 flex items-center justify-center bg-white font-bold">
                            {producto.cantidad}
                          </span>

                          <button
                            type="button"
                            onClick={() => aumentarCantidad(producto.id)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
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

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">Descuentos</span>

                  <span className="font-bold text-emerald-600">
                    -{formatearPrecio(resumen.descuento)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">Despacho</span>

                  <span className="font-bold text-emerald-600">Gratis</span>
                </div>
              </div>

              <div className="flex justify-between items-end mt-5">
                <div>
                  <p className="text-sm font-bold text-gray-600">Total</p>

                  <p className="text-xs text-gray-500">IVA incluido</p>
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
