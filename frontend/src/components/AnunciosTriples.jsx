import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerCategorias } from "../services/api";

const imagenesPorCategoria = {
  Notebooks: "/img/categorias/notebook.png",
  Monitores: "/img/categorias/monitor.png",
  Almacenamiento: "/img/categorias/almacenamiento.png",
  "Cámaras de seguridad": "/img/categorias/camara.png",
};

function CategoriaCard({ categoria }) {
  const imagen =
    categoria.imagenUrl ||
    imagenesPorCategoria[categoria.nombre] ||
    "/img/productos/producto.png";

  return (
    <Link
      to={`/productos?categoria=${encodeURIComponent(categoria.nombre)}`}
      className="block h-full"
    >
      <article className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden h-full">
        <div className="h-44 bg-white flex items-center justify-center p-5">
          <img
            src={imagen}
            alt={categoria.nombre}
            className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="p-5 pt-2 text-center">
          <h3 className="text-lg font-black text-gray-900">
            {categoria.nombre}
          </h3>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-[40px]">
            {categoria.descripcion || "Explora productos de esta categoría."}
          </p>

          <span className="inline-block mt-4 text-sm font-bold text-emerald-700">
            Ver productos
          </span>
        </div>
      </article>
    </Link>
  );
}

function AnunciosTriples() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setCargando(true);

        const categoriasApi = await obtenerCategorias();

        setCategorias(categoriasApi);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarCategorias();
  }, []);

  if (cargando) {
    return (
      <section className="bg-gray-100 px-8 py-10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Explorar categorías
          </h2>

          <p className="text-gray-600 mt-3">Cargando categorías...</p>
        </div>
      </section>
    );
  }

  if (categorias.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-100 px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[2px] w-20 bg-gray-900"></div>

          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Explorar categorías
          </h2>

          <div className="h-[2px] w-20 bg-gray-900"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categorias.map((categoria) => (
            <CategoriaCard key={categoria.id} categoria={categoria} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AnunciosTriples;
