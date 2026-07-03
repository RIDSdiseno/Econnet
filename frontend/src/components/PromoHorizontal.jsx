import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerAnuncios } from "../services/api";

function PromoHorizontal() {
  const [promo, setPromo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPromo = async () => {
      try {
        setCargando(true);

        const anuncios = await obtenerAnuncios("promo_horizontal");

        setPromo(anuncios[0] || null);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error al cargar promo horizontal:", error);
        }
      } finally {
        setCargando(false);
      }
    };

    cargarPromo();
  }, []);

  if (cargando) {
    return (
      <section className="bg-gray-100 px-4 md:px-8 lg:px-20 pt-2 pb-5">
        <div className="max-w-7xl mx-auto h-[220px] md:h-[320px] lg:h-[400px] rounded-3xl bg-white flex items-center justify-center">
          <p className="text-gray-600 font-bold">Cargando promoción...</p>
        </div>
      </section>
    );
  }

  if (!promo) {
    return null;
  }

  return (
    <section className="bg-gray-100 px-4 md:px-8 lg:px-20 pt-2 pb-5">
      <div className="max-w-7xl mx-auto">
        <Link to={promo.enlace} className="block">
          <div className="overflow-hidden rounded-3xl shadow-sm group bg-white">
            <img
              src={promo.imagenUrl}
              alt={promo.titulo || "Anuncio promocional"}
              className="w-full h-[220px] md:h-[320px] lg:h-[400px] object-cover object-center block transition duration-300 group-hover:scale-[1.03]"
              onError={(e) => {
                e.currentTarget.src = "/img/banners/banner-placeholder.png";
              }}
            />
          </div>
        </Link>
      </div>
    </section>
  );
}

export default PromoHorizontal;
