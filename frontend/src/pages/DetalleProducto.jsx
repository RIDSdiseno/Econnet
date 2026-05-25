import { useRef, useState } from 'react'

import { Link, useParams } from 'react-router-dom'
import { Button, Rate, Input, Carousel } from 'antd'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'

const productos = [
  {
    id: 1,
    nombre: 'Notebook HP Victus Gaming AMD Ryzen 7, 24GB RAM, RTX 5050, 1TB SSD',
    categoria: 'Notebook',
    marca: 'HP',
    modelo: 'Victus Gaming',
    partNumber: 'HP-VIC-R7-RTX5050',
    precio: 1349480,
    precioNormal: 1666650,
    descuento: 19,
    otrosMedios: 1410214,
    stockOnline: 'Más de 20 unidades',
    stockTienda: 'No disponible',
    garantia: '12 meses',
    imagenes: [
      '/img/productos/prueba.png',
      '/img/productos/prueba2.png',
      '/img/productos/prueba3.png',
    ],
    especificaciones: {
      SKU: 'NB-HP-001',
      Marca: 'HP',
      Modelo: 'Victus Gaming',
      Procesador: 'AMD Ryzen 7',
      RAM: '24GB DDR5',
      Almacenamiento: '1TB SSD',
      Grafica: 'NVIDIA RTX 5050',
      Pantalla: '15.6 pulgadas Full HD',
      Sistema: 'Windows 11 Home',
      Garantia: '12 meses',
    },
    descripcion:
      'Notebook gamer diseñado para alto rendimiento en juegos, trabajo pesado y multitarea. Cuenta con procesador AMD Ryzen 7, memoria RAM de 24GB, almacenamiento SSD de 1TB y gráfica dedicada RTX 5050 para una experiencia fluida.',
  },
  {
    id: 2,
    nombre: 'Monitor Gamer ASUS TUF 27 Full HD 180Hz',
    categoria: 'Monitores',
    marca: 'ASUS',
    modelo: 'TUF Gaming',
    partNumber: 'ASUS-TUF-27',
    precio: 224990,
    precioNormal: 299990,
    descuento: 25,
    otrosMedios: 239990,
    stockOnline: 'Disponible',
    stockTienda: 'Disponible',
    garantia: '12 meses',
    imagenes: [
      '/img/productos/monitor-asus.png',
      '/img/productos/monitor-asus.png',
      '/img/productos/monitor-asus.png',
    ],
    especificaciones: {
      SKU: 'MON-ASUS-001',
      Marca: 'ASUS',
      Modelo: 'TUF Gaming',
      Tamano: '27 pulgadas',
      Resolucion: 'Full HD',
      Frecuencia: '180Hz',
      Respuesta: '1ms',
      Panel: 'IPS',
      Garantia: '12 meses',
    },
    descripcion:
      'Monitor gamer ASUS TUF ideal para juegos competitivos, con alta tasa de refresco, bajo tiempo de respuesta y excelente calidad de imagen.',
  },
  {
    id: 3,
    nombre: 'SSD Samsung 1TB NVMe alta velocidad',
    categoria: 'Almacenamiento',
    marca: 'Samsung',
    modelo: 'NVMe 1TB',
    partNumber: 'SSD-SAM-1TB',
    precio: 89990,
    precioNormal: 119990,
    descuento: 25,
    otrosMedios: 94990,
    stockOnline: 'Disponible',
    stockTienda: 'Disponible',
    garantia: '6 meses',
    imagenes: [
      '/img/productos/.png',
      '/img/productos/ssd-samsung.png',
      '/img/productos/ssd-samsung.png',
    ],
    especificaciones: {
      SKU: 'SSD-SAM-001',
      Marca: 'Samsung',
      Modelo: 'NVMe 1TB',
      Capacidad: '1TB',
      Tipo: 'SSD NVMe',
      Formato: 'M.2',
      Uso: 'Notebook / PC',
      Garantia: '6 meses',
    },
    descripcion:
      'Unidad SSD NVMe de alto rendimiento, ideal para mejorar velocidad de arranque, carga de programas y transferencia de archivos.',
  },
]
function dividirEnGrupos(lista, cantidad) {
  const grupos = []

  for (let i = 0; i < lista.length; i += cantidad) {
    grupos.push(lista.slice(i, i + cantidad))
  }

  return grupos
}

function ProductosRelacionadosCarrusel({ productoActual }) {
  const carouselRef = useRef(null)

  const relacionados = productos.filter(
    (producto) => producto.id !== productoActual.id
  )

  const grupos = dividirEnGrupos(relacionados, 4)

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Productos relacionados
          </h2>

          <div className="h-[2px] flex-1 min-w-20 max-w-40 bg-gray-900"></div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => carouselRef.current?.prev()}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
          >
            <LeftOutlined />
          </button>

          <button
            type="button"
            onClick={() => carouselRef.current?.next()}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      <Carousel
        ref={carouselRef}
        dots={false}
        autoplay
        autoplaySpeed={4500}
      >
        {grupos.map((grupo, index) => (
          <div key={index}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {grupo.map((producto) => (
                <article
                  key={producto.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group"
                >
                  <Link to={`/producto/${producto.id}`}>
                    <div className="h-40 bg-white flex items-center justify-center p-4">
                      <img
                        src={producto.imagenes[0]}
                        alt={producto.nombre}
                        className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="p-4 pt-2">
                    <p className="text-sm font-black text-gray-900 uppercase">
                      {producto.marca}
                    </p>

                    <Link to={`/producto/${producto.id}`}>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-[34px] hover:text-gray-900">
                        {producto.nombre}
                      </p>
                    </Link>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-cyan-100 px-2 py-1 rounded">
                        {producto.descuento}% DCTO.
                      </span>

                      <span className="text-xs text-gray-400 line-through">
                        {formatearPrecio(producto.precioNormal)}
                      </span>
                    </div>

                    <p className="text-lg font-black text-gray-950 mt-2">
                      {formatearPrecio(producto.precio)}
                    </p>

                    <Link to={`/producto/${producto.id}`}>
                      <button className="mt-4 w-full h-10 rounded-xl bg-gray-950 text-white text-sm font-bold hover:bg-black transition">
                        Ver producto
                      </button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  )
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor)
}
function ValoracionesProducto({ producto }) {
  const [valoracion, setValoracion] = useState(0)
  const [comentario, setComentario] = useState('')

  return (
    <section className="mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Valoraciones
        </h2>

        <div className="h-[2px] flex-1 max-w-40 bg-gray-900"></div>
      </div>

      <p className="text-gray-600 mb-8">
        No hay valoraciones aún.
      </p>

      <div className="border-t border-gray-200 pt-7">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Sé el primero en valorar este producto
        </h3>

        <p className="text-sm text-gray-600 mb-5">
          Tu opinión ayuda a otros usuarios a elegir mejor.
        </p>

        <div className="mb-5">
          <p className="text-sm font-bold text-gray-800 mb-2">
            Tu valoración
          </p>

          <Rate value={valoracion} onChange={setValoracion} />
        </div>

        <div className="mb-5">
          <p className="text-sm font-bold text-gray-800 mb-2">
            Tu comentario
          </p>

          <Input.TextArea
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escribe tu opinión sobre este producto..."
            className="!rounded-xl"
          />
        </div>

        <Button
          type="primary"
          className="!bg-gray-950 !border-gray-950 !rounded-xl !font-bold hover:!bg-black"
        >
          Enviar valoración
        </Button>
      </div>
    </section>
  )
}


function DetalleProducto() {
  const { id } = useParams()

  const producto =
    productos.find((item) => item.id === Number(id)) || productos[0]

  const [imagenSeleccionada, setImagenSeleccionada] = useState(
    producto.imagenes[0]
  )

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>

          <span className="mx-2">/</span>

          <Link to="/productos" className="text-blue-600 hover:underline">
            Productos
          </Link>

          <span className="mx-2">/</span>

          <span>{producto.categoria}</span>
        </div>

        {/* Parte principal */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[90px_1fr_380px] gap-8">
            {/* Miniaturas */}
            <div className="flex lg:flex-col gap-3 order-2 lg:order-1">
              {producto.imagenes.map((imagen, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setImagenSeleccionada(imagen)}
                  className={`w-20 h-20 rounded-xl border flex items-center justify-center p-2 bg-white transition ${
                    imagenSeleccionada === imagen
                      ? 'border-gray-900 shadow-sm'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={imagen}
                    alt={`${producto.nombre} ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
              ))}
            </div>

            {/* Imagen grande */}
            <div className="order-1 lg:order-2 flex flex-col items-center justify-center">
              <div className="w-full min-h-[420px] flex items-center justify-center">
                <img
                  src={imagenSeleccionada}
                  alt={producto.nombre}
                  className="max-h-[430px] max-w-full object-contain"
                />
              </div>

              <p className="text-xs text-gray-400 italic mt-4">
                Imágenes referenciales
              </p>
            </div>

            {/* Información de compra */}
            <aside className="order-3">
              <h1 className="text-2xl font-bold text-gray-950 leading-tight">
                {producto.nombre}
              </h1>

              <p className="text-xs text-gray-500 mt-4">
                Part number: {producto.partNumber}
              </p>

              <p className="text-sm text-gray-800 mt-4 font-semibold">
                Marca: {producto.marca}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio normal</span>
                  <span className="text-gray-400 line-through">
                    {formatearPrecio(producto.precioNormal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento</span>
                  <span className="text-blue-700 bg-cyan-100 px-2 py-1 rounded text-xs font-black">
                    {producto.descuento}% DCTO.
                  </span>
                </div>

                <div className="flex justify-between items-end gap-4 border-t border-gray-200 pt-4">
                  <span className="text-sm font-bold text-gray-900">
                    Pago transferencia
                  </span>

                  <span className="text-2xl font-black text-gray-950">
                    {formatearPrecio(producto.precio)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Otros medios</span>
                  <span>{formatearPrecio(producto.otrosMedios)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  block
                  size="large"
                  className="!h-12 !rounded-xl !border-gray-900 !text-gray-900 !font-bold hover:!border-black hover:!text-black"
                >
                  Agregar al carro
                </Button>

                <Button
                  block
                  size="large"
                  type="primary"
                  className="!h-12 !rounded-xl !bg-gray-950 !font-bold hover:!bg-black"
                >
                  Comprar ahora
                </Button>
              </div>

              <div className="mt-6 border-t border-b border-gray-200 divide-y divide-gray-200">
                <div className="py-4 flex justify-between gap-4">
                  <span className="text-sm font-bold text-gray-900">
                    Stock online
                  </span>

                  <span className="text-xs font-bold text-emerald-600">
                    {producto.stockOnline}
                  </span>
                </div>

                <div className="py-4 flex justify-between gap-4">
                  <span className="text-sm font-bold text-gray-900">
                    Stock tienda
                  </span>

                  <span className="text-xs font-bold text-gray-500">
                    {producto.stockTienda}
                  </span>
                </div>

                <div className="py-4 flex justify-between gap-4">
                  <span className="text-sm font-bold text-gray-900">
                    Garantía
                  </span>

                  <span className="text-xs font-bold text-gray-500">
                    {producto.garantia}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Especificaciones y descripción */}
        <section className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 mt-10">
          {/* Especificaciones */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Especificaciones
            </h2>

            <div className="h-[3px] bg-gray-900 w-full mb-4"></div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-900 text-white px-5 py-4 font-black">
                Generalidades
              </div>

              {Object.entries(producto.especificaciones).map(
                ([key, value], index) => (
                  <div
                    key={key}
                    className={`grid grid-cols-2 px-5 py-4 text-sm ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <span className="font-bold text-gray-900">{key}</span>

                    <span className="text-gray-700">{value}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Descripción
            </h2>

            <div className="h-[3px] bg-gray-900 w-full mb-4"></div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">
                {producto.nombre}
              </h3>

              <p className="text-gray-700 leading-relaxed">
                {producto.descripcion}
              </p>
            </div>
          </div>
        </section>

        <ProductosRelacionadosCarrusel productoActual={producto} />

        <ValoracionesProducto producto={producto} />
      </main>


      <Footer />
    </div>
  )
}

export default DetalleProducto