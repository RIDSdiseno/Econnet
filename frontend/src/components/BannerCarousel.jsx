import { useEffect, useState } from "react";
import { Carousel } from "antd";
import { Link } from "react-router-dom";
import { obtenerAnuncios } from "../services/api";

function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarBanners = async () => {
      try {
        setCargando(true);

        const anuncios = await obtenerAnuncios("banner_home");

        setBanners(anuncios);
      } catch (error) {
        console.error("Error al cargar banners:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarBanners();
  }, []);

  if (cargando) {
    return (
      <section className="bg-gray-100 px-4 md:px-8 pt-6">
        <div className="max-w-7xl mx-auto h-[360px] md:h-[430px] rounded-3xl bg-white flex items-center justify-center">
          <p className="text-gray-600 font-bold">Cargando banners...</p>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-100 px-4 md:px-8 pt-6">
      <div className="max-w-7xl mx-auto">
        <Carousel autoplay autoplaySpeed={4500} dots>
          {banners.map((banner) => (
            <div key={banner.id}>
              <div className="relative h-[360px] md:h-[430px] rounded-3xl overflow-hidden bg-gray-950 shadow-sm">
                <img
                  src={banner.imagenUrl}
                  alt={banner.titulo || "Banner promocional"}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                <div className="relative z-10 h-full flex items-center">
                  <div className="px-6 md:px-12 max-w-2xl text-white">
                    <span className="inline-flex items-center rounded-full bg-emerald-400 text-gray-950 px-4 py-1 text-xs font-black uppercase tracking-wide mb-4">
                      Econnet
                    </span>

                    <h2 className="text-3xl md:text-5xl font-black leading-tight mb-4">
                      {banner.titulo}
                    </h2>

                    {banner.subtitulo && (
                      <p className="text-sm md:text-lg text-gray-200 max-w-xl mb-7">
                        {banner.subtitulo}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <Link to={banner.enlace}>
                        <button className="bg-white text-gray-950 px-6 py-3 rounded-xl font-black hover:bg-emerald-300 transition shadow-sm">
                          Ver productos
                        </button>
                      </Link>

                      <Link to="/productos">
                        <button className="border border-white/40 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition">
                          Ver catálogo
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export default BannerCarousel;
