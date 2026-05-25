import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Checkbox, Input, message } from 'antd'
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const { TextArea } = Input

function Contacto() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    mensaje: '',
    aceptaPrivacidad: false,
  })

  const actualizarCampo = (campo, valor) => {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const enviarFormulario = () => {
    if (!formulario.nombre.trim()) {
      message.warning('Ingresa tu nombre')
      return
    }

    if (!formulario.correo.trim()) {
      message.warning('Ingresa tu correo electrónico')
      return
    }

    if (!formulario.correo.includes('@')) {
      message.warning('Ingresa un correo válido')
      return
    }

    if (!formulario.mensaje.trim()) {
      message.warning('Escribe tu mensaje')
      return
    }

    if (!formulario.aceptaPrivacidad) {
      message.warning('Debes aceptar la política de privacidad')
      return
    }

    message.success('Mensaje enviado correctamente')

    setFormulario({
      nombre: '',
      correo: '',
      telefono: '',
      mensaje: '',
      aceptaPrivacidad: false,
    })
  }

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

          <span>Contacto</span>
        </div>

        {/* Título */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm mb-5">
            <CustomerServiceOutlined className="text-emerald-500" />
            <span className="text-sm font-bold text-gray-700">
              Atención al cliente
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900">
            Contáctanos
          </h1>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Escríbenos si necesitas ayuda con productos, cotizaciones,
            seguimiento de compra o soporte general.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Formulario */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 md:p-10">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Envíanos un mensaje
            </h2>

            <p className="text-gray-600 mb-7">
              Completa el formulario y te responderemos lo antes posible.
            </p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Nombre
                </label>

                <Input
                  size="large"
                  placeholder="Ingresa tu nombre"
                  prefix={<UserOutlined className="text-gray-400" />}
                  value={formulario.nombre}
                  onChange={(e) => actualizarCampo('nombre', e.target.value)}
                  className="!h-13 !rounded-xl !mt-2"
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
                  value={formulario.correo}
                  onChange={(e) => actualizarCampo('correo', e.target.value)}
                  className="!h-13 !rounded-xl !mt-2"
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
                  value={formulario.telefono}
                  onChange={(e) => actualizarCampo('telefono', e.target.value)}
                  className="!h-13 !rounded-xl !mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Mensaje
                </label>

                <TextArea
                  rows={6}
                  placeholder="Escribe tu mensaje aquí..."
                  value={formulario.mensaje}
                  onChange={(e) => actualizarCampo('mensaje', e.target.value)}
                  className="!rounded-xl !mt-2"
                />
              </div>

              <Checkbox
                checked={formulario.aceptaPrivacidad}
                onChange={(e) =>
                  actualizarCampo('aceptaPrivacidad', e.target.checked)
                }
              >
                <span className="text-sm text-gray-700">
                  He leído y acepto la{' '}
                  <Link
                    to="/politicas-privacidad"
                    className="font-bold underline"
                  >
                    política de privacidad
                  </Link>
                  .
                </span>
              </Checkbox>

              <Button
                size="large"
                onClick={enviarFormulario}
                className="!h-13 !px-10 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black hover:!bg-black"
              >
                Enviar mensaje
              </Button>
            </div>
          </div>

          {/* Información lateral */}
          <aside className="space-y-5">
            <div className="bg-gray-950 text-white rounded-3xl shadow-sm p-7">
              <h2 className="text-2xl font-black mb-4">
                Información de contacto
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed">
                Nuestro equipo puede ayudarte con dudas sobre productos,
                disponibilidad, despacho, cotizaciones y soporte de compra.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-5">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <MailOutlined className="text-xl text-gray-900" />
                </div>

                <div>
                  <p className="font-black text-gray-900">
                    Correo
                  </p>

                  <p className="text-sm text-gray-600">
                    contacto@econnet.cl
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <PhoneOutlined className="text-xl text-gray-900" />
                </div>

                <div>
                  <p className="font-black text-gray-900">
                    Teléfono
                  </p>

                  <p className="text-sm text-gray-600">
                    +56 9 1234 5678
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <EnvironmentOutlined className="text-xl text-gray-900" />
                </div>

                <div>
                  <p className="font-black text-gray-900">
                    Ubicación
                  </p>

                  <p className="text-sm text-gray-600">
                    Santiago de Chile
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <ClockCircleOutlined className="text-xl text-gray-900" />
                </div>

                <div>
                  <p className="font-black text-gray-900">
                    Horario de atención
                  </p>

                  <p className="text-sm text-gray-600">
                    Lunes a viernes, 09:00 a 18:00 hrs
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
              <h3 className="font-black text-gray-900 mb-2">
                ¿Necesitas una cotización?
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                También puedes contactarnos para compras de empresa, proyectos
                o equipamiento tecnológico.
              </p>

              <Button
                block
                className="!h-12 !rounded-xl !font-bold"
              >
                Solicitar cotización
              </Button>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Contacto