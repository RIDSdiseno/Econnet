import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Collapse, Input, Button } from 'antd'
import {
  SearchOutlined,
  TruckOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  UndoOutlined,
  DollarOutlined,
  BuildOutlined,
  CustomerServiceOutlined,
  LaptopOutlined,
  RightOutlined,
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const categoriasAyuda = [
  {
    id: 'despacho',
    titulo: 'Despacho y seguimiento',
    descripcion: 'Consulta tiempos de entrega, estados de compra y cobertura.',
    icono: <TruckOutlined />,
  },
  {
    id: 'pagos',
    titulo: 'Pagos',
    descripcion: 'Información sobre transferencia, medios de pago y confirmación.',
    icono: <CreditCardOutlined />,
  },
  {
    id: 'boletas',
    titulo: 'Boletas y facturas',
    descripcion: 'Revisa documentos de compra, facturación y datos tributarios.',
    icono: <FileTextOutlined />,
  },
  {
    id: 'garantias',
    titulo: 'Garantías',
    descripcion: 'Consulta garantía de productos tecnológicos y soporte postventa.',
    icono: <SafetyCertificateOutlined />,
  },
  {
    id: 'devoluciones',
    titulo: 'Devoluciones',
    descripcion: 'Conoce las condiciones para cambios o devoluciones.',
    icono: <UndoOutlined />,
  },
  {
    id: 'reembolsos',
    titulo: 'Reembolsos',
    descripcion: 'Información sobre tiempos y validación de reembolsos.',
    icono: <DollarOutlined />,
  },
  {
    id: 'empresas',
    titulo: 'Compras empresas',
    descripcion: 'Cotizaciones para pymes, empresas y compras corporativas.',
    icono: <BuildOutlined />,
  },
  {
    id: 'soporte',
    titulo: 'Soporte técnico',
    descripcion: 'Ayuda con notebooks, monitores, cámaras, AIO y almacenamiento.',
    icono: <LaptopOutlined />,
  },
]

const preguntasFrecuentes = [
  {
    key: '1',
    label: '¿Hacen envíos a regiones?',
    children:
      'Sí, realizamos envíos a distintas zonas de Chile. Los tiempos de entrega pueden variar según la comuna, región y disponibilidad del producto.',
  },
  {
    key: '2',
    label: '¿Los productos tienen garantía?',
    children:
      'Sí, los productos cuentan con garantía según las condiciones del fabricante y la documentación de compra correspondiente.',
  },
  {
    key: '3',
    label: '¿Puedo solicitar una cotización para empresa?',
    children:
      'Sí, puedes solicitar una cotización para notebooks, monitores, almacenamiento, cámaras de seguridad u otros productos tecnológicos.',
  },
  {
    key: '4',
    label: '¿Qué medios de pago aceptan?',
    children:
      'Por ahora puedes considerar pago por transferencia y otros medios que se pueden integrar más adelante en la plataforma.',
  },
  {
    key: '5',
    label: '¿Puedo hacer seguimiento de mi compra?',
    children:
      'Sí, la idea es que más adelante puedas revisar el estado de tu compra desde tu cuenta o desde la sección de seguimiento.',
  },
  {
    key: '6',
    label: '¿Qué hago si mi producto presenta una falla?',
    children:
      'Debes contactarnos indicando tu número de compra, producto y detalle del problema. Revisaremos el caso según garantía y condiciones del fabricante.',
  },
]

function CentroAyuda() {
  const [busqueda, setBusqueda] = useState('')

  const categoriasFiltradas = categoriasAyuda.filter((categoria) =>
    categoria.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    categoria.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  )

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

          <span>Centro de ayuda</span>
        </div>

        {/* Hero */}
        <section className="bg-gray-950 text-white rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden mb-10">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 mb-5">
                <CustomerServiceOutlined className="text-emerald-400" />
                <span className="text-sm font-bold">
                  Centro de ayuda
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                ¿En qué podemos ayudarte?
              </h1>

              <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">
                Encuentra respuestas sobre compras, despachos, pagos, garantías,
                devoluciones y soporte para tus productos tecnológicos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-sm">
              <Input
                size="large"
                placeholder="Buscar ayuda, garantía, despacho, pagos..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="!h-14 !rounded-xl !text-base"
              />
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-black text-gray-900">
              Temas principales
            </h2>

            <div className="h-[2px] flex-1 max-w-40 bg-gray-900"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categoriasFiltradas.map((categoria) => (
              <article
                key={categoria.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-950 group-hover:text-white transition">
                  <span className="text-xl">
                    {categoria.icono}
                  </span>
                </div>

                <h3 className="text-lg font-black text-gray-900">
                  {categoria.titulo}
                </h3>

                <p className="text-sm text-gray-600 mt-2 min-h-[42px]">
                  {categoria.descripcion}
                </p>

                <button className="mt-4 text-sm font-bold text-gray-900 flex items-center gap-2">
                  Ver más
                  <RightOutlined className="text-xs" />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Contacto rápido */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              Contáctanos
            </h2>

            <p className="text-gray-600 mb-6">
              Si no encontraste la respuesta que buscabas, puedes escribirnos
              directamente desde nuestro formulario de contacto.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
              <div className="flex gap-3">
                <MailOutlined className="text-xl text-gray-900 mt-1" />

                <div>
                  <p className="font-bold text-gray-900">
                    Correo
                  </p>

                  <p className="text-sm text-gray-600">
                    contacto@econnet.cl
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <PhoneOutlined className="text-xl text-gray-900 mt-1" />

                <div>
                  <p className="font-bold text-gray-900">
                    Teléfono
                  </p>

                  <p className="text-sm text-gray-600">
                    +56 9 1234 5678
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ClockCircleOutlined className="text-xl text-gray-900 mt-1" />

                <div>
                  <p className="font-bold text-gray-900">
                    Horario
                  </p>

                  <p className="text-sm text-gray-600">
                    Lun a Vie, 09:00 a 18:00
                  </p>
                </div>
              </div>
            </div>

            <Link to="/contacto">
              <Button
                size="large"
                className="!h-12 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black hover:!bg-black"
              >
                Ir al formulario de contacto
              </Button>
            </Link>
          </div>

          <aside className="bg-white border border-gray-200 rounded-3xl shadow-sm p-7">
            <h3 className="text-xl font-black text-gray-900 mb-3">
              Antes de contactarnos
            </h3>

            <ul className="space-y-3 text-sm text-gray-700">
              <li>• Ten a mano el número de compra si consultas por un pedido.</li>
              <li>• Indica el producto y marca si necesitas soporte técnico.</li>
              <li>• Para cotizaciones, menciona cantidad y tipo de producto.</li>
              <li>• Revisa tu correo para respuestas o confirmaciones.</li>
            </ul>
          </aside>
        </section>

        {/* Preguntas frecuentes */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-black text-gray-900">
              Preguntas frecuentes
            </h2>

            <div className="h-[2px] flex-1 max-w-40 bg-gray-900"></div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-4">
            <Collapse
              bordered={false}
              items={preguntasFrecuentes}
              className="bg-white"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default CentroAyuda