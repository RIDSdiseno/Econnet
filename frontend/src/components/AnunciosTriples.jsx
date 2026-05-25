const anuncios = [
  {
    id: 1,
    titulo: 'Gaming',
    imagen: '/img/anuncios/monitor.png',
  },
  {
    id: 2,
    titulo: 'Oficina',
    imagen: '/img/anuncios/seguridadcamara.png',
  },
  {
    id: 3,
    titulo: 'Almacenamiento',
    imagen: '/img/anuncios/ssd.png',
  },
]

function AnuncioCard({ anuncio }) {
  return (
    <article className="group text-center">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition">
        <img
          src={anuncio.imagen}
          alt={anuncio.titulo}
          className="w-full aspect-square object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <h3 className="mt-4 text-lg md:text-xl font-medium text-gray-900">
        {anuncio.titulo}
      </h3>
    </article>
  )
}

function AnunciosTriples() {
  return (
    <section className="bg-gray-100 px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-7">
          <div className="h-[2px] w-20 bg-gray-900"></div>

          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Explora por categoría
          </h2>

          <div className="h-[2px] w-20 bg-gray-900"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {anuncios.map((anuncio) => (
            <AnuncioCard key={anuncio.id} anuncio={anuncio} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default AnunciosTriples