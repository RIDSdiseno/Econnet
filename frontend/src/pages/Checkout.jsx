import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Radio, Select, Divider, message } from 'antd'
import {
  ArrowLeftOutlined,
  HomeOutlined,
  CreditCardOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const productosCheckout = [
  {
    id: 1,
    nombre: 'Notebook HP Victus Gaming AMD Ryzen 7, 24GB RAM, RTX 5050, 1TB SSD',
    marca: 'HP',
    imagen: '/img/productos/notebook-hp.png',
    precio: 1349480,
    precioNormal: 1666650,
    cantidad: 1,
  },
  {
    id: 2,
    nombre: 'Monitor Gamer ASUS TUF 27" Full HD 180Hz',
    marca: 'ASUS',
    imagen: '/img/productos/monitor-asus.png',
    precio: 224990,
    precioNormal: 299990,
    cantidad: 1,
  },
]

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor)
}

function Checkout() {
  const navigate = useNavigate()

  const [datos, setDatos] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    region: '',
    comuna: '',
    tipoEntrega: 'despacho',
    metodoPago: 'transferencia',
    documento: 'boleta',
  })

  const actualizarCampo = (campo, valor) => {
    setDatos((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const resumen = useMemo(() => {
    const subtotal = productosCheckout.reduce(
      (total, producto) => total + producto.precioNormal * producto.cantidad,
      0
    )

    const totalProductos = productosCheckout.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0
    )

    const descuento = subtotal - totalProductos
    const despacho = datos.tipoEntrega === 'despacho' ? 0 : 0

    return {
      subtotal,
      descuento,
      despacho,
      total: totalProductos + despacho,
      cantidadProductos: productosCheckout.reduce(
        (total, producto) => total + producto.cantidad,
        0
      ),
    }
  }, [datos.tipoEntrega])

  const finalizarCompra = () => {
    if (!datos.nombre.trim()) {
      message.warning('Ingresa tu nombre')
      return
    }

    if (!datos.correo.trim() || !datos.correo.includes('@')) {
      message.warning('Ingresa un correo válido')
      return
    }

    if (!datos.telefono.trim()) {
      message.warning('Ingresa tu teléfono')
      return
    }

    if (datos.tipoEntrega === 'despacho') {
      if (!datos.direccion.trim()) {
        message.warning('Ingresa tu dirección')
        return
      }

      if (!datos.region || !datos.comuna) {
        message.warning('Selecciona región y comuna')
        return
      }
    }

    message.success('Compra generada correctamente')

    setTimeout(() => {
      navigate('/compra-exitosa')
    }, 700)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/carrito" className="text-blue-600 hover:underline">
            Carrito
          </Link>
          <span className="mx-2">/</span>
          <span>Checkout</span>
        </div>

        <div className="mb-6">
          <Link
            to="/carrito"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black"
          >
            <ArrowLeftOutlined />
            Volver al carrito
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <section className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Finalizar compra
              </h1>

              <p className="text-gray-600 mt-1">
                Completa tus datos para continuar con el pedido.
              </p>
            </div>

            {/* Datos de contacto */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserOutlined className="text-2xl text-gray-900" />

                <h2 className="text-2xl font-black text-gray-900">
                  Datos de contacto
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-gray-800">
                    Nombre completo
                  </label>

                  <Input
                    size="large"
                    placeholder="Ingresa tu nombre"
                    prefix={<UserOutlined className="text-gray-400" />}
                    value={datos.nombre}
                    onChange={(e) => actualizarCampo('nombre', e.target.value)}
                    className="!h-12 !rounded-xl !mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-800">
                    Correo electrónico
                  </label>

                  <Input
                    size="large"
                    placeholder="Ingresa tu correo"
                    prefix={<MailOutlined className="text-gray-400" />}
                    value={datos.correo}
                    onChange={(e) => actualizarCampo('correo', e.target.value)}
                    className="!h-12 !rounded-xl !mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-800">
                    Teléfono
                  </label>

                  <Input
                    size="large"
                    placeholder="Ingresa tu teléfono"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    addonBefore="+56"
                    value={datos.telefono}
                    onChange={(e) => actualizarCampo('telefono', e.target.value)}
                    className="!h-12 !rounded-xl !mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-800">
                    Documento
                  </label>

                  <Select
                    size="large"
                    value={datos.documento}
                    onChange={(value) => actualizarCampo('documento', value)}
                    className="!h-12 !mt-2 w-full"
                    options={[
                      { value: 'boleta', label: 'Boleta' },
                      { value: 'factura', label: 'Factura' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Método de entrega */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <TruckOutlined className="text-2xl text-gray-900" />

                <h2 className="text-2xl font-black text-gray-900">
                  Método de entrega
                </h2>
              </div>

              <Radio.Group
                value={datos.tipoEntrega}
                onChange={(e) => actualizarCampo('tipoEntrega', e.target.value)}
                className="w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`border rounded-2xl p-5 cursor-pointer transition ${
                    datos.tipoEntrega === 'despacho'
                      ? 'border-gray-950 bg-gray-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}>
                    <Radio value="despacho">
                      <span className="font-black text-gray-900">
                        Despacho a domicilio
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Recibe tu pedido en la dirección que indiques.
                    </p>
                  </label>

                  <label className={`border rounded-2xl p-5 cursor-pointer transition ${
                    datos.tipoEntrega === 'retiro'
                      ? 'border-gray-950 bg-gray-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}>
                    <Radio value="retiro">
                      <span className="font-black text-gray-900">
                        Retiro en tienda
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Retira tu compra cuando esté disponible.
                    </p>
                  </label>
                </div>
              </Radio.Group>

              {datos.tipoEntrega === 'despacho' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-800">
                      Dirección
                    </label>

                    <Input
                      size="large"
                      placeholder="Ingresa tu dirección"
                      prefix={<HomeOutlined className="text-gray-400" />}
                      value={datos.direccion}
                      onChange={(e) => actualizarCampo('direccion', e.target.value)}
                      className="!h-12 !rounded-xl !mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Región
                    </label>

                    <Select
                      size="large"
                      placeholder="Selecciona región"
                      value={datos.region || undefined}
                      onChange={(value) => actualizarCampo('region', value)}
                      className="!h-12 !mt-2 w-full"
                      options={[
                        { value: 'metropolitana', label: 'Región Metropolitana' },
                        { value: 'valparaiso', label: 'Valparaíso' },
                        { value: 'biobio', label: 'Biobío' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Comuna
                    </label>

                    <Select
                      size="large"
                      placeholder="Selecciona comuna"
                      value={datos.comuna || undefined}
                      onChange={(value) => actualizarCampo('comuna', value)}
                      className="!h-12 !mt-2 w-full"
                      options={[
                        { value: 'santiago', label: 'Santiago' },
                        { value: 'providencia', label: 'Providencia' },
                        { value: 'puente-alto', label: 'Puente Alto' },
                        { value: 'maipu', label: 'Maipú' },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Método de pago */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCardOutlined className="text-2xl text-gray-900" />

                <h2 className="text-2xl font-black text-gray-900">
                  Método de pago
                </h2>
              </div>

              <Radio.Group
                value={datos.metodoPago}
                onChange={(e) => actualizarCampo('metodoPago', e.target.value)}
                className="w-full"
              >
                <div className="space-y-4">
                  <label className={`block border rounded-2xl p-5 cursor-pointer transition ${
                    datos.metodoPago === 'transferencia'
                      ? 'border-gray-950 bg-gray-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}>
                    <Radio value="transferencia">
                      <span className="font-black text-gray-900">
                        Transferencia bancaria
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Recibirás los datos bancarios al confirmar el pedido.
                    </p>
                  </label>

                  <label className={`block border rounded-2xl p-5 cursor-pointer transition ${
                    datos.metodoPago === 'webpay'
                      ? 'border-gray-950 bg-gray-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}>
                    <Radio value="webpay">
                      <span className="font-black text-gray-900">
                        Webpay / Tarjeta
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Pago con tarjeta de débito o crédito. Integración pendiente.
                    </p>
                  </label>

                  <label className={`block border rounded-2xl p-5 cursor-pointer transition ${
                    datos.metodoPago === 'mercadopago'
                      ? 'border-gray-950 bg-gray-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}>
                    <Radio value="mercadopago">
                      <span className="font-black text-gray-900">
                        Mercado Pago
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Opción preparada para futura integración.
                    </p>
                  </label>
                </div>
              </Radio.Group>
            </div>
          </section>

          {/* Resumen */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-5">
                Resumen del pedido
              </h2>

              <div className="space-y-4 mb-5">
                {productosCheckout.map((producto) => (
                  <div key={producto.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center p-2">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-black text-gray-900">
                        {producto.marca}
                      </p>

                      <p className="text-xs text-gray-600 line-clamp-2">
                        {producto.nombre}
                      </p>

                      <p className="text-sm font-black mt-1">
                        {formatearPrecio(producto.precio)}
                      </p>
                    </div>

                    <span className="text-sm font-bold text-gray-500">
                      x{producto.cantidad}
                    </span>
                  </div>
                ))}
              </div>

              <Divider />

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">
                    Productos ({resumen.cantidadProductos})
                  </span>

                  <span className="font-bold">
                    {formatearPrecio(resumen.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">
                    Descuentos
                  </span>

                  <span className="font-bold text-emerald-600">
                    -{formatearPrecio(resumen.descuento)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">
                    Despacho
                  </span>

                  <span className="font-bold text-emerald-600">
                    Gratis
                  </span>
                </div>
              </div>

              <Divider />

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-bold text-gray-600">
                    Total
                  </p>

                  <p className="text-xs text-gray-500">
                    IVA incluido
                  </p>
                </div>

                <p className="text-3xl font-black text-gray-950">
                  {formatearPrecio(resumen.total)}
                </p>
              </div>

              <Button
                block
                size="large"
                onClick={finalizarCompra}
                className="!h-14 !mt-6 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black hover:!bg-black"
              >
                Finalizar compra
              </Button>

              <div className="mt-5 flex gap-2 text-sm text-gray-600">
                <CheckCircleOutlined className="text-emerald-500 mt-1" />

                <p>
                  Esta es una simulación visual. El pago real se integrará más
                  adelante con backend.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Checkout