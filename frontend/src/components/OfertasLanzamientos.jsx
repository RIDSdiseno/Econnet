import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerProductos } from "../services/api";

const imagenFallback = "/img/productos/default-producto.png";

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function obtenerImagenCard(producto) {
  const imagenes = producto?.imagenes || [];

  const principal = imagenes.find(
    (img) => img.esPrincipal && img.tipo !== "oferta_wide",
  );

  const galeria = imagenes.find((img) => img.tipo === "galeria");

  return principal?.url || galeria?.url || imagenes[0]?.url || imagenFallback;
}

function obtenerImagenOfertaWide(producto) {
  const imagenes = producto?.imagenes || [];

  const ofertaWide = imagenes.find((img) => img.tipo === "oferta_wide");

  return ofertaWide?.url || null;
}

function adaptarProducto(producto, tipo) {
  if (!producto) return null;

  const imagenOfertaWide = obtenerImagenOfertaWide(producto);
  const precioActual = Number(producto.precio) || 0;
  const precioNormal = Number(producto.precioNormal) || null;

  return {
    id: producto.id,
    nombre: producto.nombre,
    marca: producto.marca?.nombre || producto.marca || "Producto",
    precio: precioActual,
    precioNormal,
    descuento: Number(producto.descuento) || 0,
    imagen:
      tipo === "wide"
        ? imagenOfertaWide || obtenerImagenCard(producto)
        : obtenerImagenCard(producto),
    slug: producto.slug,
    tipo,
    tieneOfertaWide: Boolean(imagenOfertaWide),
    disponible: producto.stock > 0,

    enOferta: producto.enOferta || false,
    etiquetaOferta: producto.etiquetaOferta || "",
    etiquetaEnvio: producto.etiquetaEnvio || "",
    etiquetaDisponibilidad: producto.etiquetaDisponibilidad || "",
  };
}

function OfertaSmall({ item }) {
  const mostrarPrecioNormal =
    item.enOferta && item.precioNormal && item.precioNormal > item.precio;

  const textoOferta =
    item.etiquetaOferta ||
    (item.descuento > 0 ? `${item.descuento}% DCTO.` : "");

  return (
    <Link
      to={`/producto/${item.id}`}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden group flex flex-col h-[405px]"
    >
      <div className="relative h-52 bg-white flex items-center justify-center p-4 shrink-0">
        <img
          src={item.imagen}
          alt={item.nombre}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
          onError={(e) => {
            e.currentTarget.src = imagenFallback;
          }}
        />

        {item.enOferta && textoOferta && (
          <span className="absolute left-3 top-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
            {textoOferta}
          </span>
        )}

        <div className="absolute right-3 bottom-3 flex flex-col items-end gap-1">
          {item.etiquetaEnvio && (
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">
              {item.etiquetaEnvio}
            </span>
          )}

          {item.etiquetaDisponibilidad ? (
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded">
              {item.etiquetaDisponibilidad}
            </span>
          ) : item.disponible ? (
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

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs uppercase font-semibold text-gray-700 mb-1">
          {item.marca}
        </p>

        <h3
          className="text-sm text-gray-900 leading-snug min-h-[58px] max-h-[58px]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.nombre}
        </h3>

        <div className="mt-auto">
          <div className="min-h-[22px] mb-1">
            {mostrarPrecioNormal && (
              <p className="text-sm text-gray-400 line-through">
                {formatearPrecio(item.precioNormal)}
              </p>
            )}
          </div>

          <p className="text-xl font-bold text-blue-900 mb-3">
            {formatearPrecio(item.precio)}
          </p>

          <p className="text-xs text-blue-700">Transferencias</p>
        </div>
      </div>
    </Link>
  );
}

function OfertaWide({ item }) {
  if (item.tieneOfertaWide) {
    return (
      <Link
        to={`/producto/${item.id}`}
        className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition block bg-white h-[405px]"
      >
        <img
          src={item.imagen}
          alt={item.nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = imagenFallback;
          }}
        />
      </Link>
    );
  }

  const mostrarPrecioNormal =
    item.enOferta && item.precioNormal && item.precioNormal > item.precio;

  return (
    <Link
      to={`/producto/${item.id}`}
      className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-slate-900 text-white h-[405px] flex items-center p-8 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-700" />

      <div className="relative z-10 max-w-[45%]">
        {item.enOferta && item.etiquetaOferta && (
          <span className="inline-block bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded mb-3">
            {item.etiquetaOferta}
          </span>
        )}

        <h3 className="text-3xl font-bold leading-tight mb-3">{item.nombre}</h3>

        <p className="text-sm text-slate-300 mb-5">
          {item.etiquetaEnvio || "Oferta destacada por tiempo limitado"}
        </p>

        {mostrarPrecioNormal && (
          <p className="text-lg text-slate-400 line-through">
            {formatearPrecio(item.precioNormal)}
          </p>
        )}

        <p className="text-3xl font-black text-white">
          {formatearPrecio(item.precio)}
        </p>
      </div>

      <div className="relative z-10 flex-1 flex justify-end">
        <img
          src={item.imagen}
          alt={item.nombre}
          className="max-h-[320px] max-w-[52%] object-contain"
          onError={(e) => {
            e.currentTarget.src = imagenFallback;
          }}
        />
      </div>
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

        const productosEnOfertas = productosApi
          .filter((producto) => producto.activo && producto.mostrarEnOfertas)
          .sort((a, b) => {
            const ordenA = Number(a.ordenOferta) || 0;
            const ordenB = Number(b.ordenOferta) || 0;

            if (ordenA !== ordenB) return ordenA - ordenB;

            return new Date(b.updatedAt) - new Date(a.updatedAt);
          });

        const productosWide = productosEnOfertas.filter(
          (producto) => producto.formatoOferta === "wide",
        );

        const productosSmall = productosEnOfertas.filter(
          (producto) => producto.formatoOferta !== "wide",
        );

        const wide1 = productosWide[0];
        const wide2 = productosWide[1];

        const smalls = productosSmall.slice(0, 4);

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
        console.error("Error al cargar ofertas:", error);
        setOfertas([]);
      } finally {
        setCargando(false);
      }
    };

    cargarOfertas();
  }, []);

  if (cargando) return null;

  if (ofertas.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Ofertas y Lanzamientos
        </h2>
        <div className="h-[2px] bg-emerald-400 flex-1 max-w-[160px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {ofertas.map((item, index) =>
          item.tipo === "wide" ? (
            <div
              key={`${item.id}-${index}`}
              className="md:col-span-4 lg:col-span-4"
            >
              <OfertaWide item={item} />
            </div>
          ) : (
            <div
              key={`${item.id}-${index}`}
              className="md:col-span-2 lg:col-span-1"
            >
              <OfertaSmall item={item} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}

export default OfertasLanzamientos;
