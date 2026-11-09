const marcas = [
  { nombre: 'Apple',   img: '/img/marcas/Apple_logo_black.svg.webp',   h: 'h-[70px]' },
  { nombre: 'ASUS',    img: '/img/marcas/ASUS_Logo.svg.webp',          h: 'h-[45px]' },
  { nombre: 'Dell',    img: '/img/marcas/Dell_Logo.svg.webp',          h: 'h-[70px]' },
  { nombre: 'HP',      img: '/img/marcas/HP_logo_2025.svg.webp',       h: 'h-[75px]' },
  { nombre: 'Lenovo',  img: '/img/marcas/Lenovo_logo_2015.svg.webp',   h: 'h-[45px]' },
  { nombre: 'Samsung', img: '/img/marcas/Samsung_logo.svg.webp',       h: 'h-[70px]' },
];

function Marcas() {
  return (
    <section className="bg-gray-100 px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[2px] w-20 bg-gray-900" />
          <h2 className="text-2xl font-bold text-gray-900 text-center">Marcas que trabajamos</h2>
          <div className="h-[2px] w-20 bg-gray-900" />
        </div>
        <p className="text-center text-sm text-gray-500 -mt-4 mb-7">
          Distribuimos equipos originales de las principales marcas del mundo
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {marcas.map((m) => (
            <a
              key={m.nombre}
              href={`/productos?marca=${m.nombre}`}
              title={m.nombre}
              className="group flex items-center justify-center h-[120px] bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition duration-300"
            >
              <img
                src={m.img}
                alt={m.nombre}
                loading="lazy"
                className={`${m.h} max-w-[120px] w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition duration-300`}
                style={{ mixBlendMode: 'multiply' }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Marcas;
