import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Steps, message } from 'antd'
import {
  SearchOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  HomeOutlined,
  MailOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const pedidoDemo = {
  numero: 'EC-2026-0001',
  correo: 'cliente@econnet.cl',
  estado: 'Preparando pedido',
  fechaCompra: '25/05/2026',
  total: 1574470,
  metodoPago: 'Transferencia bancaria',
  metodoEntrega: 'Despacho a domicilio',
  direccion: 'Santiago, Región Metropolitana',
  productos: [
    {
      id: 1,
      nombre: 'Notebook HP Victus Gaming AMD Ryzen 7, 24GB RAM, RTX 5050, 1TB SSD',
      marca: 'HP',
      imagen: '/img/productos/notebook-hp.png',
      cantidad: 1,
    },
    {
      id: 2,
      nombre: 'Monitor Gamer ASUS TUF 27" Full HD 180Hz',
      marca: 'ASUS',
      imagen: '/img/productos/monitor-asus.png',
      cantidad: 1,
    },
  ],
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor)
}

function SeguimientoCompra() {
  const [numeroPedido, setNumeroPedido] = useState('')
  const [correo, setCorreo] = useState('')
  const [mostrarPedido, setMostrarPedido] = useState(false)

  const buscarPedido = () => {
    if (!numeroPedido.trim()) {
      message.warning('Ingresa el número de pedido')
      return
    }

    if (!correo.trim() || !correo.includes('@')) {
      message.warning('Ingresa un correo válido')
      return
    }

    message.success('Pedido encontrado')
    setMostrarPedido(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="text-sm text-gray-500 mb-8">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span>Seguimiento de compra</span>
        </div>

        <section className="bg-gray-950 text-white rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden mb-10">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 mb-5">
                <TruckOutlined className="text-emerald-400" />

                <span className="text-sm font-bold">
                  Seguimiento de compra
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                Revisa el estado de tu pedido
              </h1>

              <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">
                Ingresa tu número de pedido y correo electrónico para consultar
                el estado de tu compra en Econnet.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm text-gray-900">
              <h2 className="text-xl font-black mb-4">
                Buscar pedido
              </h2>

              <div className="space-y-4">
                <Input
                  size="large"
                  placeholder="Ej: EC-2026-0001"
                  prefix={<FileTextOutlined className="text-gray-400" />}
                  value={numeroPedido}
                  onChange={(e) => setNumeroPedido(e.target.value)}
                  className="!h-13 !rounded-xl"
                />

                <Input
                  size="large"
                  placeholder="Correo usado en la compra"
                  prefix={<MailOutlined className="text-gray-400" />}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="!h-13 !rounded-xl"
                />

                <Button
                  block
                  size="large"
                  onClick={buscarPedido}
                  className="!h-13 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black hover:!bg-black"
                >
                  Buscar pedido
                </Button>
              </div>
            </div>
          </div>
        </section>

        {mostrarPedido ? (
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Pedido {pedidoDemo.numero}
                    </h2>

                    <p className="text-gray-600 mt-1">
                      Compra realizada el {pedidoDemo.fechaCompra}
                    </p>
                  </div>

                  <span className="w-fit text-sm font-black text-emerald-700 bg-emerald-100 px-4 py-2 rounded-full">
                    {pedidoDemo.estado}
                  </span>
                </div>

                <Steps
                  current={2}
                  items={[
                    {
                      title: 'Recibido',
                      icon: <CheckCircleOutlined />,
                    },
                    {
                      title: 'Pago confirmado',
                      icon: <CheckCircleOutlined />,
                    },
                    {
                      title: 'Preparando',
                      icon: <ClockCircleOutlined />,
                    },
                    {
                      title: 'En camino',
                      icon: <TruckOutlined />,
                    },
                    {
                      title: 'Entregado',
                      icon: <HomeOutlined />,
                    },
                  ]}
                />

                <div className="mt-8 bg-gray-100 rounded-2xl p-5">
                  <p className="text-sm font-bold text-gray-900">
                    Estado actual
                  </p>

                  <p className="text-gray-700 mt-1">
                    Tu pedido está siendo preparado. Cuando sea despachado,
                    podrás revisar el estado de envío.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-5">
                  Productos del pedido
                </h2>

                <div className="space-y-4">
                  {pedidoDemo.productos.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex gap-4 border border-gray-200 rounded-2xl p-4"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center p-2">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900">
                          {producto.marca}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {producto.nombre}
                        </p>

                        <p className="text-xs text-gray-500 mt-2">
                          Cantidad: {producto.cantidad}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
                <h2 className="text-xl font-black text-gray-900 mb-5">
                  Resumen
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">
                      Total
                    </span>

                    <span className="font-black">
                      {formatearPrecio(pedidoDemo.total)}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-gray-700">
                      Método de pago
                    </p>

                    <p className="text-gray-600 mt-1">
                      {pedidoDemo.metodoPago}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-gray-700">
                      Método de entrega
                    </p>

                    <p className="text-gray-600 mt-1">
                      {pedidoDemo.metodoEntrega}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-gray-700">
                      Dirección
                    </p>

                    <p className="text-gray-600 mt-1">
                      {pedidoDemo.direccion}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 text-white rounded-3xl shadow-sm p-6">
                <CustomerServiceOutlined className="text-3xl text-emerald-400 mb-4" />

                <h3 className="text-xl font-black">
                  ¿Necesitas ayuda?
                </h3>

                <p className="text-sm text-gray-300 mt-2 mb-5">
                  Si tienes problemas con tu pedido, puedes escribirnos para
                  revisar el caso.
                </p>

                <Link to="/contacto">
                  <Button
                    block
                    className="!h-12 !rounded-xl !font-bold"
                  >
                    Contactar soporte
                  </Button>
                </Link>
              </div>
            </aside>
          </section>
        ) : (
          <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 text-center">
            <SearchOutlined className="text-5xl text-gray-300 mb-4" />

            <h2 className="text-2xl font-black text-gray-900">
              Ingresa los datos de tu compra
            </h2>

            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Para consultar el estado de tu pedido, usa el número de compra y
              el correo electrónico ingresado al momento de comprar.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default SeguimientoCompra