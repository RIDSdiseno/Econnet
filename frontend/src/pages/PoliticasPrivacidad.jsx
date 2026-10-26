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

function PoliticasPrivacidad() {
  useMeta({
    title: 'Política de privacidad',
    description:
      'Conoce cómo Econnet SpA recopila, usa y protege tu información personal de acuerdo a la Ley 19.628 modificada por la Ley 21.719 de Chile.',
    canonical: 'https://econnet.cl/politicas-privacidad',
  })

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="text-sm text-gray-500 mb-8">
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span>Política de privacidad</span>
        </div>

        <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 md:p-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Política de privacidad</h1>
          <p className="text-sm text-gray-400 mb-8">Última actualización: octubre 2026</p>

          <Seccion titulo="1. Responsable del tratamiento">
            <p>
              El responsable del tratamiento de los datos personales es:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Razón social:</strong> Econnet SpA</li>
              <li><strong>RUT:</strong> 76.758.352-4</li>
              <li><strong>Domicilio:</strong> La Concepción 65, of. 1003, Santiago, Chile</li>
              <li><strong>Correo de privacidad:</strong>{' '}
                <a href="mailto:privacidad@econnet.cl" className="text-blue-600 hover:underline">
                  privacidad@econnet.cl
                </a>
              </li>
            </ul>
            <p>
              Para cualquier consulta sobre el tratamiento de tus datos personales puedes
              contactarnos por el correo indicado o a través del{' '}
              <Link to="/contacto" className="text-blue-600 hover:underline">
                formulario de contacto
              </Link>.
            </p>
          </Seccion>

          <Seccion titulo="2. Datos que recopilamos">
            <p>Recopilamos los siguientes tipos de información:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Datos de registro:</strong> nombre, correo electrónico, teléfono y
                RUT (opcional).
              </li>
              <li>
                <strong>Datos de compra:</strong> dirección de despacho, región, comuna y
                método de pago (no almacenamos datos de tarjetas; el procesamiento lo
                realiza Transbank / MercadoPago).
              </li>
              <li>
                <strong>Datos de navegación:</strong> dirección IP, tipo de navegador,
                páginas visitadas y tiempo de sesión, recopilados mediante herramientas de
                analítica (Google Analytics, Microsoft Clarity).
              </li>
              <li>
                <strong>Comunicaciones:</strong> mensajes enviados a través del formulario
                de contacto o soporte.
              </li>
            </ul>
          </Seccion>

          <Seccion titulo="3. Finalidad del tratamiento">
            <p>Utilizamos tus datos para:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Procesar y gestionar tus pedidos y pagos.</li>
              <li>Enviarte confirmaciones, actualizaciones de estado y comprobantes.</li>
              <li>Brindarte atención al cliente y soporte posventa.</li>
              <li>
                Mejorar la experiencia de navegación y el rendimiento del sitio
                (interés legítimo del responsable).
              </li>
              <li>
                Enviarte comunicaciones promocionales y publicidad relacionada con tus
                preferencias si has dado tu consentimiento expreso; puedes revocarlo en
                cualquier momento.
              </li>
              <li>Cumplir con obligaciones legales y tributarias.</li>
            </ul>
          </Seccion>

          <Seccion titulo="4. Base legal del tratamiento">
            <p>
              El tratamiento de tus datos se basa en la Ley 19.628 sobre Protección de la
              Vida Privada, modificada por la Ley 21.719, y según el caso en:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Ejecución del contrato</strong> de compraventa.</li>
              <li><strong>Consentimiento expreso</strong> para comunicaciones de marketing y perfilamiento publicitario.</li>
              <li><strong>Interés legítimo</strong> para mejorar la seguridad, el rendimiento y la experiencia del sitio.</li>
              <li><strong>Cumplimiento de obligaciones legales</strong> tributarias y regulatorias.</li>
            </ul>
          </Seccion>

          <Seccion titulo="5. Perfilamiento">
            <p>
              Si al registrarte activas la opción "publicidad relacionada con mis preferencias",
              utilizaremos tu historial de navegación y compras para mostrarte recomendaciones
              de productos personalizadas. Este tratamiento se basa en tu consentimiento
              expreso y puedes revocarlo en cualquier momento desde tu perfil de cuenta o
              escribiéndonos a{' '}
              <a href="mailto:privacidad@econnet.cl" className="text-blue-600 hover:underline">
                privacidad@econnet.cl
              </a>.
            </p>
          </Seccion>

          <Seccion titulo="6. Compartición de datos con terceros">
            <p>
              No vendemos ni cedemos tus datos personales a terceros con fines comerciales.
              Solo los compartimos con:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Empresas de despacho</strong> (courier): nombre, dirección y
                teléfono para la entrega del pedido.
              </li>
              <li>
                <strong>Procesadores de pago</strong> (Transbank, MercadoPago): para
                gestionar las transacciones de manera segura.
              </li>
              <li>
                <strong>Proveedores de servicios tecnológicos</strong> (hosting, correo
                transaccional, analítica): bajo acuerdos de confidencialidad.
              </li>
              <li>
                <strong>Autoridades competentes:</strong> cuando la ley así lo exija.
              </li>
            </ul>
          </Seccion>

          <Seccion titulo="7. Transferencias internacionales de datos">
            <p>
              Algunos de nuestros proveedores operan fuera de Chile y podrían procesar
              tus datos en servidores ubicados en el extranjero:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Railway (Estados Unidos):</strong> proveedor de infraestructura
                donde se aloja el backend del sitio.
              </li>
              <li>
                <strong>Cloudinary (Estados Unidos):</strong> servicio de almacenamiento
                y optimización de imágenes de productos.
              </li>
              <li>
                <strong>Google LLC (Estados Unidos):</strong> inicio de sesión con Google
                (OAuth), analítica (Google Analytics) y servicios de autenticación.
              </li>
            </ul>
            <p>
              Todos estos proveedores cuentan con certificaciones de seguridad
              reconocidas internacionalmente (ISO 27001, SOC 2) y están sujetos a
              sus propias políticas de privacidad. Econnet SpA ha suscrito cláusulas
              contractuales que garantizan un nivel de protección adecuado.
            </p>
          </Seccion>

          <Seccion titulo="8. Almacenamiento, seguridad y retención">
            <p>
              Tus datos se almacenan con cifrado en tránsito (HTTPS) y en reposo.
              Aplicamos medidas técnicas y organizativas para proteger tu información
              contra acceso no autorizado, pérdida o destrucción.
            </p>
            <p>Conservamos tus datos durante los siguientes plazos:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Datos de cuenta:</strong> mientras la cuenta esté activa y hasta
                2 años después del último inicio de sesión o de la solicitud de supresión.
              </li>
              <li>
                <strong>Mensajes de contacto y soporte:</strong> 2 años desde la fecha
                de recepción.
              </li>
              <li>
                <strong>Documentos tributarios y de compra:</strong> 5 años, conforme a
                la legislación tributaria chilena.
              </li>
            </ul>
            <p>
              En caso de detectar una brecha de seguridad que afecte tus datos, Econnet SpA
              notificará a la Agencia de Protección de Datos Personales en el plazo que
              exige la ley y a los titulares afectados a la brevedad posible.
            </p>
          </Seccion>

          <Seccion titulo="9. Cookies y tecnologías similares">
            <p>
              Usamos cookies propias para mantener tu sesión activa y conservar el contenido
              del carrito de compras. También utilizamos herramientas de analítica de terceros
              (Google Analytics, Microsoft Clarity) que pueden instalar cookies para medir
              el rendimiento y la experiencia del sitio.
            </p>
            <p>
              Puedes configurar tu navegador para rechazar o eliminar cookies; algunas
              funciones del sitio podrían verse afectadas.
            </p>
          </Seccion>

          <Seccion titulo="10. Tus derechos">
            <p>
              De acuerdo a la Ley 19.628 modificada por la Ley 21.719 tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios o hayas revocado el consentimiento.</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos con fines de marketing o perfilamiento.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común para transferirlos a otro responsable.</li>
              <li><strong>Bloqueo temporal:</strong> solicitar la suspensión del tratamiento mientras se verifica su exactitud o se resuelve una oposición.</li>
              <li><strong>No quedar sujeto a decisiones automatizadas:</strong> solicitar que las decisiones que te afecten significativamente sean revisadas por una persona.</li>
            </ul>
            <p>
              Para ejercer estos derechos escríbenos a{' '}
              <a href="mailto:privacidad@econnet.cl" className="text-blue-600 hover:underline">
                privacidad@econnet.cl
              </a>{' '}
              o a través del{' '}
              <Link to="/contacto" className="text-blue-600 hover:underline">
                formulario de contacto
              </Link>.
              Responderemos dentro de <strong>30 días corridos</strong>, plazo prorrogable
              por 30 días adicionales cuando la complejidad o el volumen de solicitudes
              lo justifique.
            </p>
            <p>
              Si consideras que el tratamiento de tus datos infringe la ley, puedes
              presentar un reclamo ante la{' '}
              <strong>Agencia de Protección de Datos Personales</strong> de Chile una vez
              que esta entre en funcionamiento.
            </p>
          </Seccion>

          <Seccion titulo="11. Menores de edad">
            <p>
              Nuestros servicios están dirigidos a personas mayores de 18 años. No
              recopilamos intencionalmente datos de menores de edad.
            </p>
          </Seccion>

          <Seccion titulo="12. Modificaciones a esta política">
            <p>
              Podemos actualizar esta política en cualquier momento. Los cambios se
              publicarán en esta página con la nueva fecha de actualización. Te
              recomendamos revisarla periódicamente.
            </p>
          </Seccion>

          <div className="border-t border-gray-200 mt-8 pt-6 text-sm text-gray-500">
            ¿Tienes preguntas sobre tus datos? Escríbenos a{' '}
            <a href="mailto:privacidad@econnet.cl" className="text-blue-600 hover:underline">
              privacidad@econnet.cl
            </a>{' '}
            o{' '}
            <Link to="/contacto" className="text-blue-600 hover:underline">
              contáctanos
            </Link>.
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default PoliticasPrivacidad
