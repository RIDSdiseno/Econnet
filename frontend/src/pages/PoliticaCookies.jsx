import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useMeta } from '../hooks/useMeta'

function Seccion({ titulo, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-black text-gray-900 mb-3">{titulo}</h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

function PoliticaCookies() {
  useMeta({
    title: 'Política de cookies',
    description:
      'Conoce qué cookies utiliza econnet.cl, para qué sirven y cómo puedes gestionarlas.',
    canonical: 'https://econnet.cl/politica-cookies',
  })

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="text-sm text-gray-500 mb-8">
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span>Política de cookies</span>
        </div>

        <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 md:p-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Política de cookies</h1>
          <p className="text-sm text-gray-400 mb-8">Última actualización: octubre 2026</p>

          <Seccion titulo="1. ¿Qué son las cookies?">
            <p>
              Las cookies son pequeños archivos de texto que un sitio web almacena en
              tu dispositivo cuando lo visitas. Permiten que el sitio recuerde tus
              preferencias, mantenga tu sesión activa y recopile información sobre
              cómo usas la página.
            </p>
          </Seccion>

          <Seccion titulo="2. Cookies que utilizamos">
            <p>En econnet.cl usamos los siguientes tipos de cookies:</p>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border border-gray-200 font-bold">Cookie</th>
                    <th className="text-left p-3 border border-gray-200 font-bold">Tipo</th>
                    <th className="text-left p-3 border border-gray-200 font-bold">Finalidad</th>
                    <th className="text-left p-3 border border-gray-200 font-bold">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-gray-200">token (JWT)</td>
                    <td className="p-3 border border-gray-200">Esencial</td>
                    <td className="p-3 border border-gray-200">Mantiene la sesión del usuario autenticado</td>
                    <td className="p-3 border border-gray-200">Sesión / localStorage</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 border border-gray-200">carrito</td>
                    <td className="p-3 border border-gray-200">Esencial</td>
                    <td className="p-3 border border-gray-200">Conserva el contenido del carrito de compras</td>
                    <td className="p-3 border border-gray-200">7 días</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-200">_ga, _ga_*</td>
                    <td className="p-3 border border-gray-200">Analítica</td>
                    <td className="p-3 border border-gray-200">Google Analytics: mide visitas, rutas y comportamiento de navegación de forma agregada</td>
                    <td className="p-3 border border-gray-200">2 años</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 border border-gray-200">_clck, _clsk</td>
                    <td className="p-3 border border-gray-200">Analítica</td>
                    <td className="p-3 border border-gray-200">Microsoft Clarity: registra mapas de calor y grabaciones de sesión para mejorar la experiencia</td>
                    <td className="p-3 border border-gray-200">1 año</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-200">_fbp</td>
                    <td className="p-3 border border-gray-200">Marketing</td>
                    <td className="p-3 border border-gray-200">Meta Pixel: mide la efectividad de campañas publicitarias en Facebook e Instagram</td>
                    <td className="p-3 border border-gray-200">90 días</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Seccion>

          <Seccion titulo="3. Cookies esenciales">
            <p>
              Las cookies esenciales son necesarias para que el sitio funcione
              correctamente. Sin ellas no podrías iniciar sesión, mantener productos
              en el carrito ni completar una compra. No requieren tu consentimiento
              previo porque son estrictamente necesarias para el servicio.
            </p>
          </Seccion>

          <Seccion titulo="4. Cookies de analítica y marketing">
            <p>
              Usamos Google Analytics y Microsoft Clarity para entender cómo
              los visitantes interactúan con el sitio, y Meta Pixel para medir
              el rendimiento de nuestras campañas publicitarias. Estas cookies
              no son esenciales y solo se activan con tu consentimiento.
            </p>
            <p>
              Puedes revisar las políticas de privacidad de cada proveedor:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Analytics — Política de privacidad de Google
                </a>
              </li>
              <li>
                <a
                  href="https://privacy.microsoft.com/privacystatement"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Microsoft Clarity — Declaración de privacidad de Microsoft
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/privacy/explanation"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Meta Pixel — Política de privacidad de Meta
                </a>
              </li>
            </ul>
          </Seccion>

          <Seccion titulo="5. Cómo gestionar las cookies">
            <p>
              Puedes configurar tu navegador para rechazar, eliminar o recibir
              avisos antes de aceptar cookies. Ten en cuenta que bloquear las
              cookies esenciales puede afectar el funcionamiento del sitio.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/es-cl/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/es-es/topic/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </Seccion>

          <Seccion titulo="6. Más información">
            <p>
              Para más detalles sobre cómo tratamos tus datos personales consulta
              nuestra{' '}
              <Link to="/politicas-privacidad" className="text-blue-600 hover:underline">
                política de privacidad
              </Link>
              . Si tienes preguntas escríbenos a{' '}
              <a href="mailto:privacidad@econnet.cl" className="text-blue-600 hover:underline">
                privacidad@econnet.cl
              </a>
              .
            </p>
          </Seccion>

          <div className="border-t border-gray-200 mt-8 pt-6 text-sm text-gray-500">
            Econnet SpA · RUT 76.758.352-4 ·{' '}
            <a href="mailto:privacidad@econnet.cl" className="text-blue-600 hover:underline">
              privacidad@econnet.cl
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default PoliticaCookies
