const marcasFilaUno = [
  {
    id: 1,
    nombre: 'Apple',
    imagen: '/img/marcas/apple.png',
  },
  {
    id: 2,
    nombre: 'ASUS',
    imagen: '/img/marcas/asus.png',
  },
  {
    id: 3,
    nombre: 'Dell',
    imagen: '/img/marcas/dell.png',
  },
]

const marcasFilaDos = [
  {
    id: 4,
    nombre: 'HP',
    imagen: '/img/marcas/hp.png',
  },
  {
    id: 5,
    nombre: 'Lenovo',
    imagen: '/img/marcas/lenovo.png',
  },
  {
    id: 6,
    nombre: 'Samsung',
    imagen: '/img/marcas/samsung.png',
  },
]

function MarcaCard({ marca }) {
  return (
    <article className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition group h-44 flex flex-col items-center justify-center px-5 py-4">
      <img
        src={marca.imagen}
        alt={marca.nombre}
        className="max-h-[125px] max-w-[280px] object-contain transition duration-300 group-hover:scale-105"
      />

      <p className="mt-2 text-base font-bold text-gray-800 tracking-wide uppercase text-center">
        {marca.nombre}
      </p>
    </article>
  );
}

function Marcas() {
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

        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {marcasFilaUno.map((marca) => (
              <MarcaCard key={marca.id} marca={marca} />
            ))}
          </div>

          {/* Segunda fila: 2 marcas centradas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {marcasFilaDos.map((marca) => (
              <MarcaCard key={marca.id} marca={marca} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Marcas;
