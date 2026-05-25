import { useEffect, useState } from 'react'
import { Modal, Input, Button, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

function SuscripcionModal() {
  const [open, setOpen] = useState(false)
  const [correo, setCorreo] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleEnviar = () => {
    if (!correo.trim()) {
      message.warning('Ingresa tu correo electrónico')
      return
    }

    if (!correo.includes('@')) {
      message.warning('Ingresa un correo válido')
      return
    }

    message.success('¡Gracias por suscribirte!')
    setCorreo('')
    setOpen(false)
  }

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      centered
      width={560}
      closeIcon={null}
      rootClassName="newsletter-modal"
      styles={{
        content: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          borderRadius: 0,
        },
        body: {
          padding: 0,
        },
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
        },
      }}
    >
      <div className="relative overflow-hidden min-h-[520px]">
        {/* Imagen de fondo */}
        <img
          src="/img/popup/popup-bg2.png"
          alt="Fondo tecnológico"
          className="absolute inset-0 w-full h-full object-cover scale-[1.05]"
          style={{
            objectPosition: '0% 50%',
          }}
        />

        {/* Oscurece un poco los bordes para que se note dónde termina */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.22)_45%,rgba(0,0,0,0.18)_100%)]"></div>

        {/* Capa suave para que el texto se lea */}
        <div className="absolute inset-0 bg-white/18"></div>

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/85 text-white flex items-center justify-center hover:bg-black transition"
          style={{
            color: '#ffffff',
          }}
        >
          <CloseOutlined className="text-sm !text-white" />
        </button>

        {/* Contenido */}
        <div className="relative z-10 px-8 py-12 min-h-[520px] flex flex-col justify-center text-center">
          <h2 className="text-3xl font-black text-gray-950 leading-tight mb-6 drop-shadow-sm">
            Suscríbete y accede a un 10% de descuento de bienvenida
          </h2>

          <p className="text-gray-800 text-base leading-relaxed mb-7 drop-shadow-sm">
            Suscríbete con tu correo y recibe un 10% de descuento en tu primera
            compra, además de promociones, ofertas especiales y novedades de
            Econnet.
          </p>

          <div className="space-y-0">
            <Input
              size="large"
              placeholder="Dirección de correo electrónico *"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="!h-14 !rounded-none !text-base !border-gray-700 !bg-white/90"
            />

            <Button
              block
              size="large"
              onClick={handleEnviar}
              className="!h-14 !rounded-none !bg-gray-900 !text-white !border-gray-900 !font-black hover:!bg-black"
            >
              RECIBIR BENEFICIOS
            </Button>
          </div>

          <p className="text-xs text-gray-700 leading-relaxed mt-7 drop-shadow-sm">
            Al registrarte, aceptas recibir promociones, ofertas especiales,
            novedades de Econnet y tu beneficio de 10% de descuento de bienvenida.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default SuscripcionModal