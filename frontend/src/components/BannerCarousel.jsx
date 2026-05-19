import { Carousel } from 'antd'

const banners = [
  {
    id: 1,
    titulo: 'Ofertas en notebooks',
    subtitulo: 'Encuentra equipos para estudio, trabajo y gaming.',
    imagen: '/img/banners/banner.png',
  },
  {
    id: 2,
    titulo: 'Accesorios tecnológicos',
    subtitulo: 'Mouse, teclados, audífonos y más.',
    imagen: '/img/banners/banner2.png',
  },
  {
    id: 3,
    titulo: 'Componentes para tu PC',
    subtitulo: 'Tarjetas gráficas, procesadores, memorias y almacenamiento.',
    imagen: '/img/banners/banner3.png',
  },
]

function BannerCarousel() {
  return (
    <section className="bg-gray-100">
      <Carousel autoplay autoplaySpeed={3500} dots>
        {banners.map((banner) => (
          <div key={banner.id}>
            <div className="relative h-[320px] md:h-[420px] overflow-hidden">
              <img
                src={banner.imagen}
                alt={banner.titulo}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/35"></div>

              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-8 w-full">
                  <div className="max-w-xl text-white">
                    <p className="text-sm md:text-base uppercase tracking-widest text-gray-200 mb-3">
                      Ecomer Rids
                    </p>

                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                      {banner.titulo}
                    </h2>

                    <p className="text-base md:text-lg text-gray-200 mb-6">
                      {banner.subtitulo}
                    </p>

                    <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                      Ver productos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  )
}

export default BannerCarousel