import { useEffect, useRef, useState } from "react";
import { Carousel } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { obtenerProductos } from "../services/api";

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

function adaptarProducto(producto) {
  const imagenPrincipal =
    producto.imagenes?.find((img) => img.esPrincipal)?.url ||
    producto.imagenes?.[0]?.url ||
    "/img/productos/producto.png";

  return {
    id: producto.id,
    marca: producto.marca?.nombre || "Sin marca",
    nombre: producto.nombre,
    precio: producto.precio,
    precioNormal: producto.precioNormal || producto.precio,
    descuento: producto.descuento || 0,
    imagen: imagenPrincipal,
  };
}

function CardRecomendado({ producto }) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden h-full group">
      <Link to={`/producto/${producto.id}`}>
        <div className="h-40 bg-white flex items-center justify-center p-4">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
          />
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

        <div className="mt-3 flex items-center gap-2 min-h-[24px]">
          {producto.descuento > 0 && (
            <span className="text-[10px] font-bold text-blue-700 bg-cyan-100 px-2 py-1 rounded">
              {producto.descuento}% DCTO.
            </span>
          )}

          {producto.precioNormal > producto.precio && (
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

            <p className="text-xs text-gray-500">Precio transferencia</p>
          </div>

          <button className="w-10 h-10 rounded-xl bg-emerald-400 text-gray-950 flex items-center justify-center hover:bg-emerald-300 transition shadow-sm border border-emerald-500">
            <ShoppingCartOutlined className="text-lg" />
          </button>
        </div>
      </div>
    </article>
  );
}

function Recomendados() {
  const carouselRef = useRef(null);

  const [recomendados, setRecomendados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarRecomendados = async () => {
      try {
        setCargando(true);

        const productosApi = await obtenerProductos();

        const productosAdaptados = productosApi
          .slice(0, 8)
          .map(adaptarProducto);

        setRecomendados(productosAdaptados);
      } catch (error) {
        console.error("Error al cargar recomendados:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarRecomendados();
  }, []);

  const grupos = dividirEnGrupos(recomendados, 4);

  if (cargando) {
    return (
      <section className="bg-gray-100 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900">
            Seleccionados para ti
          </h2>

          <p className="text-gray-600 mt-3">Cargando productos...</p>
        </div>
      </section>
    );
  }

  if (recomendados.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-100 px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Seleccionados para ti
            </h2>

            <div className="h-[2px] flex-1 min-w-20 max-w-40 bg-gray-900"></div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => carouselRef.current?.prev()}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
            >
              <LeftOutlined />
            </button>

            <button
              onClick={() => carouselRef.current?.next()}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
            >
              <RightOutlined />
            </button>
          </div>
        </div>

        <Carousel ref={carouselRef} dots={false} autoplay autoplaySpeed={4500}>
          {grupos.map((grupo, index) => (
            <div key={index}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {grupo.map((producto) => (
                  <CardRecomendado key={producto.id} producto={producto} />
                ))}
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export default Recomendados;