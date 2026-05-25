import { Link } from 'react-router-dom'
import { Collapse } from 'antd'
import {
  AimOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  TruckOutlined,
  LaptopOutlined,
} from '@ant-design/icons'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const marcas = [
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

const preguntas = [
  {
    key: '1',
    label: '¿Hacen envíos a regiones?',
    children:
      'Sí, realizamos envíos a distintas zonas de Chile mediante servicios de despacho asociados. Los tiempos pueden variar según la ubicación.',
  },
  {
    key: '2',
    label: '¿Los productos tienen garantía?',
    children:
      'Sí, los productos cuentan con garantía según las condiciones del fabricante y la documentación correspondiente de compra.',
  },
  {
    key: '3',
    label: '¿Qué medios de pago aceptan?',
    children:
      'Aceptamos pagos por transferencia y otros medios de pago que pueden integrarse más adelante en la plataforma.',
  },
  {
    key: '4',
    label: '¿Puedo solicitar una cotización?',
    children:
      'Sí, puedes solicitar una cotización para productos tecnológicos, compras de empresa o equipamiento específico.',
  },
]

function QuienesSomos() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span>Quiénes somos</span>
        </div>

        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm mb-5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-sm font-bold text-gray-700">
                Quiénes somos
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              Econnet: tecnología con servicio y confianza en Chile
            </h1>

            <p className="text-gray-700 text-base md:text-lg leading-relaxed mt-6 max-w-2xl">
              Desde 2014 acercamos notebooks, computadores y accesorios
              tecnológicos a personas, pymes y empresas, con atención clara,
              productos confiables y una experiencia de compra simple.
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mt-7">
              <div className="flex items-center gap-3 mb-4">
                <AimOutlined className="text-blue-600 text-xl" />

                <h2 className="text-lg font-black text-gray-900">
                  Nuestro enfoque
                </h2>
              </div>

              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <CheckCircleOutlined className="text-emerald-500 mt-1" />
                  <span>
                    Productos tecnológicos pensados para estudiar, trabajar,
                    emprender y mejorar tu setup.
                  </span>
                </li>

                <li className="flex gap-3">
                  <CheckCircleOutlined className="text-emerald-500 mt-1" />
                  <span>
                    Atención cercana, asesoría honesta y procesos de compra más
                    simples.
                  </span>
                </li>

                <li className="flex gap-3">
                  <CheckCircleOutlined className="text-emerald-500 mt-1" />
                  <span>
                    Despachos confiables, documentación de compra y soporte
                    postventa.
                  </span>
                </li>
              </ul>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-gray-900">
                    10+
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    años de experiencia
                  </p>
                </div>

                <div className="bg-gray-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-gray-900">
                    Chile
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    cobertura nacional
                  </p>
                </div>

                <div className="bg-gray-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-gray-900">
                    Clientes
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    personas y empresas
                  </p>
                </div>
              </div>

              <Link to="/contacto">
                <button className="mt-6 h-12 px-6 rounded-xl border border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition">
                  Necesito una cotización
                </button>
              </Link>
            </div>
          </div>

          {/* Imagen principal */}
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl"></div>

            <div className="relative bg-white rounded-3xl shadow-sm border border-gray-200 p-4">
              <img
                src="/img/quienes/quienes-tech.png"
                alt="Tecnología Econnet"
                className="w-full h-[360px] object-cover rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* Historia y compromisos */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
          <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <LaptopOutlined className="text-blue-600 text-xl" />

              <h2 className="text-xl font-black text-gray-900">
                Nuestra historia
              </h2>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Partimos como una tienda online con una misión clara: hacer que la
              compra de tecnología sea simple, transparente y segura. Hoy
              seguimos creciendo gracias a la confianza de nuestros clientes y
              al trabajo con marcas reconocidas del mercado.
            </p>
          </article>

          <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <SafetyCertificateOutlined className="text-blue-600 text-xl" />

              <h2 className="text-xl font-black text-gray-900">
                Compromisos
              </h2>
            </div>

            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <CheckCircleOutlined className="text-emerald-500 mt-1" />
                Garantía y documentación de compra en cada producto.
              </li>

              <li className="flex gap-3">
                <CheckCircleOutlined className="text-emerald-500 mt-1" />
                Asesoría para elegir el equipo correcto según tu uso.
              </li>

              <li className="flex gap-3">
                <TruckOutlined className="text-emerald-500 mt-1" />
                Procesos claros de despacho, entrega y postventa.
              </li>
            </ul>
          </article>
        </section>

        {/* Marcas */}
        <section className="mt-14">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900">
              Marcas con las que trabajamos
            </h2>

            <div className="h-[3px] w-16 bg-emerald-400 mx-auto mt-3"></div>

            <p className="text-gray-600 mt-4">
              Gestionamos productos tecnológicos de marcas reconocidas en el
              mercado.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {marcas.map((marca) => (
                <div
                  key={marca.id}
                  className="h-28 bg-gray-50 rounded-2xl flex items-center justify-center p-4 hover:bg-white hover:shadow-md transition group"
                >
                  <img
                    src={marca.imagen}
                    alt={marca.nombre}
                    className="max-h-20 max-w-[150px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <QuestionCircleOutlined className="text-blue-600 text-xl" />

            <h2 className="text-3xl font-black text-gray-900">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
            <Collapse
              bordered={false}
              items={preguntas}
              className="bg-white"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default QuienesSomos