import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerMarcas } from "../services/api";

function MarcaCard({ marca }) {
  return (
    <Link
      to={`/productos?marca=${encodeURIComponent(marca.nombre)}`}
      className="block h-full"
    >
      <article className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition group flex flex-col items-center justify-center px-5 py-4 cursor-pointer h-44">
        {marca.logoUrl ? (
          <img
            src={marca.logoUrl}
            alt={marca.nombre}
            className="object-contain transition duration-300 group-hover:scale-105 max-h-[105px] max-w-[230px]"
          />
        ) : (
          <div className="w-full h-[80px] flex items-center justify-center rounded-xl bg-gray-100">
            <span className="text-xl font-black text-gray-800">
              {marca.nombre}
            </span>
          </div>
        )}

        <p className="mt-3 text-sm font-bold text-gray-800 tracking-wide uppercase text-center">
          {marca.nombre}
        </p>
      </article>
    </Link>
  );
}

function Marcas() {
  const [marcasPrincipales, setMarcasPrincipales] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarMarcas = async () => {
      try {
        setCargando(true);

        const marcasApi = await obtenerMarcas();

        const principales = marcasApi
          .filter((marca) => marca.grupo === "principal")
          .sort((a, b) => a.orden - b.orden);

        setMarcasPrincipales(principales);
      } catch (error) {
        console.error("Error al cargar marcas:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarMarcas();
  }, []);

  if (cargando) {
    return (
      <section className="bg-gray-100 px-8 py-10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Marcas que trabajamos
          </h2>

          <p className="text-gray-600 mt-3">Cargando marcas...</p>
        </div>
      </section>
    );
  }

  if (marcasPrincipales.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-100 px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[2px] w-20 bg-gray-900"></div>

          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Marcas que trabajamos
          </h2>

          <div className="h-[2px] w-20 bg-gray-900"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {marcasPrincipales.map((marca) => (
            <MarcaCard key={marca.id} marca={marca} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Marcas;