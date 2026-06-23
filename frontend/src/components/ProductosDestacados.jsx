import { useEffect, useRef, useState } from "react";
import { Carousel, message } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  obtenerProductosDestacados,
  agregarProductoCarrito,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { agregarItemCarritoInvitado } from "../utils/carritoInvitado";

const imagenFallback = "/img/productos/producto.png";

function dividirEnGrupos(lista, cantidad) {
  const grupos = [];

  for (let i = 0; i < lista.length; i += cantidad) {
    grupos.push(lista.slice(i, i + cantidad));
  }

  return grupos;
}

function formatearPrecio(valor) {
  const numero = Number(valor) || 0;

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(numero);
}

function obtenerImagenPrincipal(producto) {
  const imagenes = producto?.imagenes || [];

  const principal = imagenes.find(
    (img) => img.esPrincipal && img.tipo !== "oferta_wide",
  );

  const galeria = imagenes.find((img) => img.tipo === "galeria");

  return principal?.url || galeria?.url || imagenes[0]?.url || imagenFallback;
}

function adaptarProducto(producto) {
  const precio = Number(producto.precio) || 0;
  const precioNormal = Number(producto.precioNormal) || precio;

  return {
    id: producto.id,
    marca: producto.marca?.nombre || "Sin marca",
    nombre: producto.nombre,
    precio,
    precioNormal,
    descuento: Number(producto.descuento) || 0,
    imagen: obtenerImagenPrincipal(producto),

    enOferta: producto.enOferta || false,
    etiquetaOferta: producto.etiquetaOferta || "",
    etiquetaEnvio: producto.etiquetaEnvio || "",
    etiquetaDisponibilidad: producto.etiquetaDisponibilidad || "",
    disponible: producto.stock > 0,
  };
}

function ProductoCard({ producto, cargandoCarrito, onAgregarCarrito }) {
  const mostrarPrecioNormal =
    producto.enOferta &&
    producto.precioNormal &&
    producto.precioNormal > producto.precio;

  const textoOferta =
    producto.etiquetaOferta ||
    (producto.descuento > 0 ? `${producto.descuento}% DCTO.` : "");

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden h-full group">
      <Link to={`/producto/${producto.id}`}>
        <div className="relative h-44 bg-white flex items-center justify-center p-4">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = imagenFallback;
            }}
          />

          {producto.enOferta && textoOferta && (
            <span className="absolute left-3 top-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
              {textoOferta}
            </span>
          )}

          <div className="absolute right-3 bottom-3 flex flex-col items-end gap-1">
            {producto.etiquetaEnvio && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">
                {producto.etiquetaEnvio}
              </span>
            )}

            {producto.etiquetaDisponibilidad ? (
              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded">
                {producto.etiquetaDisponibilidad}
              </span>
            ) : producto.disponible ? (
              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded">
                DISPONIBLE
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded">
                SIN STOCK
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4 pt-2">
        <h3 className="text-sm font-bold text-gray-900 uppercase line-clamp-1">
          {producto.marca}
        </h3>

        <Link to={`/producto/${producto.id}`}>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-[34px] hover:text-gray-950 transition">
            {producto.nombre}
          </p>
        </Link>

        <div className="mt-3 min-h-[24px]">
          {mostrarPrecioNormal && (
            <span className="text-xs text-gray-400 line-through">
              {formatearPrecio(producto.precioNormal)}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-bold text-gray-950">
              {formatearPrecio(producto.precio)}
            </p>
          </div>

          <button
            type="button"
            disabled={cargandoCarrito || !producto.disponible}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAgregarCarrito(producto);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-sm border disabled:opacity-50 ${
              producto.disponible
                ? "bg-emerald-400 text-gray-950 hover:bg-emerald-300 border-emerald-500"
                : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
            }`}
            title={
              producto.disponible ? "Agregar al carrito" : "Producto sin stock"
            }
          >
            <ShoppingCartOutlined className="text-lg" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductosDestacados() {
  const carouselRef = useRef(null);

  const { token, estaLogueado } = useAuth();

  const [productosDestacados, setProductosDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoCarritoId, setCargandoCarritoId] = useState(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true);

        const respuesta = await obtenerProductosDestacados();

        const productosApi = Array.isArray(respuesta)
          ? respuesta
          : respuesta.productos || [];

        const productosAdaptados = productosApi.map(adaptarProducto);

        setProductosDestacados(productosAdaptados);
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
        setProductosDestacados([]);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  const agregarAlCarrito = async (producto) => {
    if (!producto.disponible) {
      message.warning("Este producto no tiene stock disponible");
      return;
    }

    if (!estaLogueado || !token) {
      try {
        setCargandoCarritoId(producto.id);

        agregarItemCarritoInvitado(producto.id, 1);

        message.success("Producto agregado al carrito");
      } catch (error) {
        message.error(error.message || "No se pudo agregar al carrito");
      } finally {
        setCargandoCarritoId(null);
      }

      return;
    }

    try {
      setCargandoCarritoId(producto.id);

      await agregarProductoCarrito(token, producto.id);

      message.success("Producto agregado al carrito");

      window.dispatchEvent(new Event("carritoActualizado"));
    } catch (error) {
      message.error(error.message || "No se pudo agregar al carrito");
    } finally {
      setCargandoCarritoId(null);
    }
  };

  const grupos = dividirEnGrupos(productosDestacados, 4);

  if (cargando) {
    return (
      <section className="bg-gray-100 px-8 pt-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900">
            Productos destacados
          </h2>

          <p className="text-gray-600 mt-3">Cargando productos...</p>
        </div>
      </section>
    );
  }

  if (productosDestacados.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-100 px-8 pt-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Productos destacados
            </h2>

            <div className="h-[2px] flex-1 min-w-20 max-w-40 bg-gray-900" />
          </div>

          {grupos.length > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => carouselRef.current?.prev()}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
              >
                <LeftOutlined />
              </button>

              <button
                type="button"
                onClick={() => carouselRef.current?.next()}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
              >
                <RightOutlined />
              </button>
            </div>
          )}
        </div>

        <Carousel ref={carouselRef} dots={false} autoplay autoplaySpeed={5000}>
          {grupos.map((grupo, index) => (
            <div key={index}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {grupo.map((producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    cargandoCarrito={cargandoCarritoId === producto.id}
                    onAgregarCarrito={agregarAlCarrito}
                  />
                ))}
              </div>
            </div>
          ))}
        </Carousel>

        <div className="relative z-10 flex justify-center mt-8 pb-2">
          <Link to="/productos">
            <button className="bg-black !text-white px-10 py-4 rounded-2xl font-bold text-base hover:bg-gray-800 transition shadow-lg border border-gray-700">
              Ver más productos
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProductosDestacados;
