import { Link } from 'react-router-dom'
import { Button, Result } from 'antd'
import {
  CheckCircleOutlined,
  ShoppingOutlined,
  HomeOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function CompraExitosa() {
  const numeroPedido = 'EC-2026-0001'

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-12">
        <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-gray-950 text-white px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-400 text-gray-950 flex items-center justify-center mx-auto mb-5">
                <CheckCircleOutlined className="text-4xl" />
              </div>

              <h1 className="text-4xl font-black">
                Compra realizada correctamente
              </h1>

              <p className="text-gray-300 mt-3">
                Gracias por comprar en Econnet. Hemos recibido tu pedido.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <Result
              status="success"
              title="Tu pedido fue generado con éxito"
              subTitle={`Número de pedido: ${numeroPedido}`}
              extra={null}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
              <div className="bg-gray-100 rounded-2xl p-5 text-center">
                <FileTextOutlined className="text-3xl text-gray-900 mb-3" />

                <h3 className="font-black text-gray-900">
                  Comprobante
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  Recibirás el detalle de tu compra en tu correo.
                </p>
              </div>

              <div className="bg-gray-100 rounded-2xl p-5 text-center">
                <ShoppingOutlined className="text-3xl text-gray-900 mb-3" />

                <h3 className="font-black text-gray-900">
                  Preparación
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  Tu pedido será revisado y preparado para entrega.
                </p>
              </div>

              <div className="bg-gray-100 rounded-2xl p-5 text-center">
                <HomeOutlined className="text-3xl text-gray-900 mb-3" />

                <h3 className="font-black text-gray-900">
                  Seguimiento
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  Más adelante podrás revisar el estado desde tu cuenta.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <Link to="/">
                <Button
                  size="large"
                  className="!h-12 !rounded-2xl !font-bold !px-8"
                >
                  Volver al inicio
                </Button>
              </Link>

              <Link to="/productos">
                <Button
                  size="large"
                  className="!h-12 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black !px-8 hover:!bg-black"
                >
                  Seguir comprando
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default CompraExitosa