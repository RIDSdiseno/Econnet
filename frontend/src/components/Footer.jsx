import {
  InstagramOutlined,
  FacebookFilled,
  LinkedinFilled,
  YoutubeFilled,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons'

function Footer() {
  return (
    <footer className="bg-gray-950 text-white mt-12">
      <div className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Primera fila: columnas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div>
            <h3 className="border-l-4 border-gray-400 pl-2 font-bold text-lg mb-4">
              Ayuda
            </h3>

            <ul className="space-y-3 text-sm text-gray-200">
              <li className="hover:text-white cursor-pointer">Centro de ayuda</li>
              <li className="hover:text-white cursor-pointer">Seguimiento de mi compra</li>
              <li className="hover:text-white cursor-pointer">Formulario de contacto</li>
              <li className="hover:text-white cursor-pointer">Bases de concursos</li>
            </ul>
          </div>

          <div>
            <h3 className="border-l-4 border-gray-400 pl-2 font-bold text-lg mb-4">
              Nosotros
            </h3>

            <ul className="space-y-3 text-sm text-gray-200">
              <li className="hover:text-white cursor-pointer">Quiénes somos</li>
              <li className="hover:text-white cursor-pointer">Ventas corporativas</li>
              <li className="hover:text-white cursor-pointer">Ecomer Rids Labs</li>
              <li className="hover:text-white cursor-pointer">Términos y condiciones</li>
              <li className="hover:text-white cursor-pointer">Políticas de privacidad</li>
            </ul>
          </div>

          <div>
            <h3 className="border-l-4 border-gray-400 pl-2 font-bold text-lg mb-4">
              Comunidad
            </h3>

            <ul className="space-y-3 text-sm text-gray-200">
              <li className="hover:text-white cursor-pointer">Instagram</li>
              <li className="hover:text-white cursor-pointer">Facebook</li>
              <li className="hover:text-white cursor-pointer">LinkedIn</li>
              <li className="hover:text-white cursor-pointer">YouTube</li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-700 my-10"></div>

        {/* Segunda fila: medios de pago */}
        <div>
          <h3 className="border-l-4 border-gray-400 pl-2 font-bold text-lg mb-5">
            Medios de pago
          </h3>

          <div className="flex flex-wrap items-center gap-8 text-gray-400 font-semibold text-xl">
            <span>webpay</span>
            <span>mercado pago</span>
            <span>Santander</span>
            <span>BancoEstado</span>
            <span className="text-sm">Transferencia Bancaria</span>
          </div>
        </div>

        {/* Tercera fila: seguridad, dirección y redes */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border-2 border-gray-400 rounded-xl flex items-center justify-center">
              <EnvironmentOutlined className="text-2xl text-gray-300" />
            </div>

            <div>
              <p className="text-sm text-gray-400">Dirección</p>
              <p className="text-lg font-semibold">Santiago de Chile</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <SafetyCertificateOutlined className="text-4xl text-gray-300" />

            <p className="text-sm text-gray-200">
              Econnet protege tu información con{' '}
              <strong>Secure Sockets Layer SSL</strong>
            </p>
          </div>

          <div className="lg:text-right">
            <div className="flex lg:justify-end gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                <InstagramOutlined />
              </div>

              <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                <FacebookFilled />
              </div>

              <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                <LinkedinFilled />
              </div>

              <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                <YoutubeFilled />
              </div>
            </div>

            

            
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
          Copyright © 2026 ecomer-rids.cl. Todos los derechos reservados.
        </div>
      </div>

      {/* Botón flotante */}
      <button className="fixed bottom-6 right-6 bg-gray-800 hover:bg-black text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
        <CustomerServiceOutlined />
        <span className="font-semibold">¿Necesitas ayuda?</span>
      </button>
    </footer>
  )
}

export default Footer