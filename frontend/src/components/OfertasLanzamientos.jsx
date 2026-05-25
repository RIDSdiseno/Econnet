import { Link } from 'react-router-dom'

const ofertas = [
  {
    id: 1,
    nombre: 'Monitores',
    descripcion: 'Ofertas en monitores seleccionados',
    precio: '$129.990',
    precioNormal: '$179.990',
    descuento: '-28%',
    imagen: '/img/ofertas/prueba.png',
    tipo: 'small',
  },
  {
    id: 2,
    nombre: 'AIO',
    descripcion: 'Equipos All In One para oficina y hogar',
    precio: '$399.990',
    precioNormal: '$499.990',
    descuento: '-20%',
    imagen: '/img/ofertas/prueba.png',
    tipo: 'small',
  },
  {
    id: 3,
    nombre: 'Notebook',
    descripcion: 'Notebooks destacados en oferta',
    precio: '$599.990',
    precioNormal: '$699.990',
    descuento: '-14%',
    imagen: '/img/ofertas/oferta1.png',
    tipo: 'wide',
  },
  {
    id: 4,
    nombre: 'Webcam',
    descripcion: 'Cámaras web y accesorios',
    precio: '$29.990',
    precioNormal: '$39.990',
    descuento: '-25%',
    imagen: '/img/ofertas/oferta2.png',
    tipo: 'wide',
  },
  {
    id: 5,
    nombre: 'Almacenamiento',
    descripcion: 'SSD, discos externos y memorias',
    precio: '$49.990',
    precioNormal: '$69.990',
    descuento: '-29%',
    imagen: '/img/ofertas/camara.png',
    tipo: 'small',
  },
  {
    id: 6,
    nombre: 'Otros',
    descripcion: 'Otros productos tecnológicos',
    precio: '$19.990',
    precioNormal: '$29.990',
    descuento: '-33%',
    imagen: '/img/ofertas/prueba.png',
    tipo: 'small',
  },
]

function OfertaSmall({ item }) {
  const ruta =
    item.nombre === 'Monitores'
      ? `/productos?categoria=${encodeURIComponent('Monitores')}`
      : item.nombre === 'AIO'
      ? `/productos?categoria=${encodeURIComponent('AIO')}`
      : item.nombre === 'Notebook'
      ? `/productos?categoria=${encodeURIComponent('Notebook')}`
      : item.nombre === 'Webcam'
      ? `/productos?categoria=${encodeURIComponent('Cámara de seguridad')}`
      : item.nombre === 'Almacenamiento'
      ? `/productos?categoria=${encodeURIComponent('Almacenamiento')}`
      : '/productos'

  return (
    <Link to={ruta} className="block h-full">
      <article className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden h-full">
        {/* Imagen principal */}
        <div className="relative h-52 bg-white flex items-center justify-center p-3 overflow-hidden">
          <img
            src={item.imagen}
            alt={item.nombre}
            className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
          />

          {/* Etiquetas sobre la imagen, pero pequeñas */}
          <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
            {item.llegaHoy && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-1 rounded">
                LLEGA HOY
              </span>
            )}

            {item.disponible && (
              <span className="text-[9px] font-bold text-purple-700 bg-purple-100/90 px-2 py-1 rounded">
                DISPONIBLE
              </span>
            )}
          </div>
        </div>

        {/* Información */}
        <div className="p-4 pt-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase line-clamp-1">
            {item.nombre}
          </h3>

          <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-[34px]">
            {item.descripcion}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-700 bg-cyan-100 px-2 py-1 rounded">
              {item.descuento} DCTO.
            </span>

            <span className="text-xs text-gray-400 line-through">
              {item.precioNormal}
            </span>
          </div>

          <p className="text-xl font-bold text-indigo-900 mt-1">
            {item.precio}
          </p>

          <p className="text-xs text-indigo-800">
            Transferencias
          </p>
        </div>
      </article>
    </Link>
  )
}

function OfertaWide({ item }) {
  return (
    <article className="relative w-full h-[400px] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      <img
        src={item.imagen}
        alt={item.nombre}
        className="absolute inset-0 w-full h-full object-fill"
      />
    </article>
  )
}

function OfertasLanzamientos() {
  const monitores = ofertas[0]
  const AIO = ofertas[1]
  const notebook = ofertas[2]
  const webcam = ofertas[3]
  const almacenamiento = ofertas[4]
  const otros = ofertas[5]

function obtenerRutaOferta(item) {
  const rutas = {
    Monitores: `/productos?categoria=${encodeURIComponent('Monitores')}`,
    AIO: `/productos?categoria=${encodeURIComponent('AIO')}`,
    Notebook: `/productos?categoria=${encodeURIComponent('Notebook')}`,
    Webcam: `/productos?categoria=${encodeURIComponent('Cámara de seguridad')}`,
    Almacenamiento: `/productos?categoria=${encodeURIComponent('Almacenamiento')}`,
    Otros: '/productos',
  }

  return rutas[item.nombre] || '/productos'
}
  return (
    <section className="bg-gray-100 px-8 py-7">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-2xl font-bold text-gray-900">
            Ofertas y Lanzamientos
          </h2>

          <div className="h-[2px] flex-1 max-w-40 bg-emerald-400"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OfertaSmall item={monitores} />
            <OfertaSmall item={AIO} />
          </div>

          <div className="lg:col-span-4">
            <OfertaWide item={notebook} />
          </div>

          <div className="lg:col-span-4">
            <OfertaWide item={webcam} />
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OfertaSmall item={almacenamiento} />
            <OfertaSmall item={otros} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default OfertasLanzamientos