import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerProductos } from "../services/api";

function formatearPrecio(valor) {
  const numero = Number(valor) || 0;

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(numero);
}

function obtenerImagenCard(producto) {
  return (
    producto.imagenes?.find((img) => img.tipo === "principal")?.url ||
    producto.imagenes?.find(
      (img) => img.esPrincipal && img.tipo !== "oferta_wide",
    )?.url ||
    producto.imagenes?.find((img) => img.tipo === "galeria")?.url ||
    producto.imagenes?.[0]?.url ||
    "/img/productos/producto.png"
  );
}

function obtenerImagenOfertaWide(producto) {
  return (
    producto.imagenes?.find((img) => img.tipo === "oferta_wide")?.url ||
    obtenerImagenCard(producto)
  );
}

function adaptarProducto(producto, tipo = "small") {
  if (!producto) return null;

  const imagenOfertaWide = producto.imagenes?.find(
    (img) => img.tipo === "oferta_wide",
  );

  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion || "Producto disponible en Econnet",
    marca: producto.marca?.nombre || "Sin marca",
    categoria: producto.categoria?.nombre || "Sin categoría",
    precio: producto.precio,
    precioNormal: producto.precioNormal || producto.precio,
    descuento: producto.descuento || 0,
    imagen:
      tipo === "wide"
        ? obtenerImagenOfertaWide(producto)
        : obtenerImagenCard(producto),
    tieneOfertaWide: Boolean(imagenOfertaWide),
    disponible: producto.stock > 0,
    tipo,
  };
}

function OfertaWide({ item }) {
  if (!item) return null;

  if (item.tieneOfertaWide) {
    return (
      <Link to={`/producto/${item.id}`} className="block h-full">
        <article className="relative w-full h-[400px] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
          <img
            src={item.imagen}
            alt={item.nombre}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />

          <div className="absolute inset-0 ring-1 ring-black/5 rounded-xl pointer-events-none"></div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/producto/${item.id}`} className="block h-full">
      <article className="relative w-full h-[400px] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-end p-8 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800">
          <img
            src={item.imagen}
            alt={item.nombre}
            className="max-h-full max-w-[55%] object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8 text-white max-w-xl">
          <span className="w-fit text-[11px] font-black bg-emerald-400 text-gray-950 px-3 py-1 rounded-full mb-3">
            OFERTA / LANZAMIENTO
          </span>

          <p className="text-sm font-bold uppercase text-emerald-200">
            {item.marca}
          </p>

          <h3 className="text-2xl md:text-3xl font-black leading-tight mt-2 line-clamp-2">
            {item.nombre}
          </h3>

          <p className="text-sm text-gray-200 mt-2 line-clamp-2">
            {item.descripcion}
          </p>

          <p className="text-3xl font-black mt-4">
            {formatearPrecio(item.precio)}
          </p>

          <p className="text-xs text-gray-200">Precio transferencia</p>
        </div>
      </article>
    </Link>
  );
}
function OfertaSmall({ item }) {
  if (!item) return null;

  return (
    <Link to={`/producto/${item.id}`} className="block h-full">
      <article className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden h-full">
        <div className="relative h-52 bg-white flex items-center justify-center p-3 overflow-hidden">
          <img
            src={item.imagen}
            alt={item.nombre}
            className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
          />

          <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
            {item.disponible && (
              <span className="text-[9px] font-bold text-purple-700 bg-purple-100/90 px-2 py-1 rounded">
                DISPONIBLE
              </span>
            )}
          </div>
        </div>

        <div className="p-4 pt-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase line-clamp-1">
            {item.marca}
          </h3>

          <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-[34px]">
            {item.nombre}
          </p>

          <div className="mt-3 flex items-center gap-2 min-h-[24px]">
            {item.descuento > 0 && (
              <span className="text-[10px] font-bold text-blue-700 bg-cyan-100 px-2 py-1 rounded">
                -{item.descuento}% DCTO.
              </span>
            )}

            {item.precioNormal > item.precio && (
              <span className="text-xs text-gray-400 line-through">
                {formatearPrecio(item.precioNormal)}
              </span>
            )}
          </div>

          <p className="text-xl font-bold text-indigo-900 mt-1">
            {formatearPrecio(item.precio)}
          </p>

          <p className="text-xs text-indigo-800">Transferencias</p>
        </div>
      </article>
    </Link>
  );
}

function OfertasLanzamientos() {
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarOfertas = async () => {
      try {
        setCargando(true);

        const productosApi = await obtenerProductos();

        const productosConOfertaWide = productosApi.filter((producto) =>
          producto.imagenes?.some((img) => img.tipo === "oferta_wide"),
        );

        const productosNormales = productosApi.filter(
          (producto) =>
            !producto.imagenes?.some((img) => img.tipo === "oferta_wide"),
        );

        const wide1 = productosConOfertaWide[0] || productosApi[0];
        const wide2 = productosConOfertaWide[1] || productosApi[1];

        const smalls = productosNormales
          .filter(
            (producto) =>
              producto.id !== wide1?.id && producto.id !== wide2?.id,
          )
          .slice(0, 4);

        const productosAdaptados = [
          adaptarProducto(smalls[0], "small"),
          adaptarProducto(smalls[1], "small"),
          adaptarProducto(wide1, "wide"),
          adaptarProducto(wide2, "wide"),
          adaptarProducto(smalls[2], "small"),
          adaptarProducto(smalls[3], "small"),
        ].filter(Boolean);

        setOfertas(productosAdaptados);
      } catch (error) {
        console.error("Error al cargar ofertas y lanzamientos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarOfertas();
  }, []);

  if (cargando) {
    return (
      <section className="bg-gray-100 px-8 py-7">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900">
            Ofertas y Lanzamientos
          </h2>

          <p className="text-gray-600 mt-3">Cargando productos...</p>
        </div>
      </section>
    );
  }

  if (ofertas.length === 0) {
    return null;
  }

  const producto1 = ofertas[0];
  const producto2 = ofertas[1];
  const producto3 = ofertas[2];
  const producto4 = ofertas[3];
  const producto5 = ofertas[4];
  const producto6 = ofertas[5];

  return (
    <section className="bg-gray-100 px-8 py-7">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-2xl font-bold text-gray-900">
            Ofertas y Lanzamientos
          </h2>

          <div className="h-[2px] flex-1 max-w-40 bg-emerald-400"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OfertaSmall item={producto1} />
            <OfertaSmall item={producto2} />
          </div>

          <div className="lg:col-span-4">
            <OfertaWide item={producto3} />
          </div>

          <div className="lg:col-span-4">
            <OfertaWide item={producto4} />
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OfertaSmall item={producto5} />
            <OfertaSmall item={producto6} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default OfertasLanzamientos;
