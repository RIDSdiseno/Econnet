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

function Tabla({ headers, rows }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h) => (
              <th key={h} className="text-left p-3 border border-gray-200 font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
              {row.map((cell, j) => (
                <td key={j} className="p-3 border border-gray-200 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
          <h1 className="text-4xl font-black text-gray-900 mb-2">Política de Privacidad</h1>
          <p className="text-sm text-gray-400 mb-1">Última actualización: 27 de octubre de 2026</p>
          <p className="text-sm text-gray-400 mb-8">Versión: 2.0</p>

          <p className="text-gray-700 leading-relaxed mb-8">
            En Econnet cuidamos los datos personales de quienes visitan nuestro sitio, compran o
            se comunican con nosotros. Esta política explica qué datos tratamos, para qué, con quién
            los compartimos y cómo puedes ejercer tus derechos, conforme a la Ley N.° 19.628 sobre
            Protección de la Vida Privada, modificada por la Ley N.° 21.719.
          </p>

          <Seccion titulo="1. Responsable del tratamiento">
            <ul className="list-none space-y-1 ml-0">
              <li><strong>Razón social:</strong> ECONNET SpA</li>
              <li><strong>RUT:</strong> 76.758.352-4</li>
              <li><strong>Domicilio:</strong> La Concepción 65, oficina 1003, Providencia, Región Metropolitana, Chile</li>
              <li>
                <strong>Correo para temas de datos personales:</strong>{' '}
                <a href="mailto:privacidad@econnet.cl" className="text-blue-600 hover:underline">
                  privacidad@econnet.cl
                </a>
              </li>
            </ul>
          </Seccion>

          <Seccion titulo="2. Qué datos tratamos">
            <p>Según cómo uses el sitio:</p>
            <Tabla
              headers={['Cuándo', 'Datos']}
              rows={[
                ['Al crear una cuenta', 'Nombre, apellidos, correo, celular, RUN/RUT y contraseña (guardada cifrada).'],
                ['Al entrar con Google o Microsoft', 'Nombre y correo que esas cuentas nos entregan. No recibimos tu contraseña.'],
                ['Al comprar', 'Dirección de despacho, región, comuna, teléfono, nombre de quien recibe, productos comprados, monto, medio de pago elegido y estado del pago. No guardamos los datos de tu tarjeta: el pago lo procesa directamente Transbank (Webpay y Oneclick) o Mercado Pago.'],
                ['Si pides factura', 'RUT, razón social y giro de la empresa, y los datos de la persona de contacto.'],
                ['Al suscribirte al boletín', 'Tu correo.'],
                ['Al escribirnos (contacto o soporte)', 'Nombre, correo, teléfono, asunto, mensaje y las respuestas que intercambiemos.'],
                ['Al dejar una reseña', 'Tu nombre y tu opinión, que se publican en la ficha del producto.'],
                ['Al navegar', 'Datos técnicos necesarios para que el sitio funcione: sesión, carrito y preferencias guardadas en tu navegador. Ver la Política de Cookies.'],
              ]}
            />
            <p className="mt-3">
              No pedimos datos sensibles (salud, origen étnico, opiniones políticas, datos biométricos, etc.).
              Si compras para otra persona, asegúrate de que esté de acuerdo en que usemos su nombre,
              dirección y teléfono para la entrega.
            </p>
          </Seccion>

          <Seccion titulo="3. Para qué los usamos y con qué base legal">
            <Tabla
              headers={['Finalidad', 'Base legal']}
              rows={[
                ['Crear y administrar tu cuenta', 'Contrato (lo pides tú y aceptas los términos)'],
                ['Procesar tu compra, el pago, el despacho, el retiro, los cambios, las devoluciones y la garantía', 'Ejecución del contrato de compraventa'],
                ['Emitir boletas y facturas, y llevar la contabilidad', 'Obligación legal (tributaria)'],
                ['Responder consultas, cotizaciones y solicitudes de soporte', 'Medidas precontractuales o contrato, a tu solicitud'],
                ['Enviarte promociones, novedades y el boletín', 'Tu consentimiento (casilla en el registro o suscripción al boletín). Puedes retirarlo cuando quieras.'],
                ['Mostrarte publicidad de productos según tus preferencias', 'Tu consentimiento (casilla separada en el registro). Puedes retirarlo cuando quieras.'],
                ['Publicar tu reseña', 'Tu consentimiento, al enviarla'],
                ['Mantener la seguridad del sitio y prevenir fraudes', 'Interés legítimo de Econnet'],
                ['Atender requerimientos de autoridades', 'Obligación legal'],
              ]}
            />
            <p className="mt-3">No tomamos decisiones que te afecten basadas únicamente en tratamientos automatizados.</p>
          </Seccion>

          <Seccion titulo="4. Con quién compartimos tus datos">
            <p>
              No vendemos tus datos. Solo los compartimos con quienes necesitamos para operar,
              y cada uno recibe solo lo necesario:
            </p>
            <Tabla
              headers={['Proveedor', 'Para qué', 'Dónde']}
              rows={[
                ['Asesorías RIDS Limitada', 'Desarrollo, soporte y administración del sitio', 'Chile'],
                ['Blue Express', 'Despacho de pedidos (nombre, dirección, teléfono)', 'Chile'],
                ['Transbank (Webpay y Oneclick)', 'Procesar pagos', 'Chile'],
                ['Mercado Pago', 'Procesar pagos', 'Chile / Argentina'],
                ['Railway', 'Servidor y base de datos del sitio', 'Estados Unidos'],
                ['Wirenet Chile', 'Alojamiento del sitio', 'Chile'],
                ['Cloudinary', 'Imágenes del catálogo (no datos de clientes)', 'Estados Unidos'],
                ['Google y Microsoft', 'Inicio de sesión, si eliges esa opción', 'Estados Unidos'],
                ['Microsoft 365', 'Correo electrónico de Econnet', 'Irlanda (Europa)'],
              ]}
            />
            <p className="mt-3">
              También entregamos datos a autoridades (por ejemplo, el SII o un tribunal) cuando la ley lo exige.
            </p>
          </Seccion>

          <Seccion titulo="5. Datos que salen de Chile">
            <p>
              Algunos proveedores (los de la tabla con país distinto de Chile) guardan o procesan
              datos fuera del país. En esos casos exigimos que protejan los datos al menos como lo
              exige la ley chilena, mediante contratos o condiciones de servicio con cláusulas de
              protección de datos.
            </p>
          </Seccion>

          <Seccion titulo="6. Cuánto tiempo los guardamos">
            <Tabla
              headers={['Datos', 'Plazo']}
              rows={[
                ['Cuenta', 'Mientras la tengas activa. Si la cierras, la eliminamos dentro de 30 días, salvo lo que debamos guardar por ley.'],
                ['Compras, boletas y facturas', 'El plazo que exige la ley tributaria (hasta 6 años).'],
                ['Consultas y soporte', '2 años desde la última respuesta.'],
                ['Boletín y promociones', 'Hasta que te des de baja. Después guardamos solo tu correo en una lista de exclusión, para no volver a escribirte.'],
                ['Reseñas', 'Mientras el producto esté publicado, o hasta que pidas borrarla.'],
              ]}
            />
          </Seccion>

          <Seccion titulo="7. Seguridad">
            <p>
              Usamos conexión cifrada (HTTPS), acceso restringido a la información y proveedores
              con medidas de seguridad reconocidas. Si ocurriera una vulneración de seguridad que
              ponga en riesgo tus datos, la informaremos a la Agencia de Protección de Datos
              Personales y, cuando corresponda, a las personas afectadas, como exige la ley.
            </p>
          </Seccion>

          <Seccion titulo="8. Tus derechos">
            <p>Puedes pedirnos en cualquier momento:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Acceso:</strong> saber qué datos tuyos tenemos y cómo los usamos.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> borrar tus datos, salvo los que debamos guardar por ley.</li>
              <li><strong>Oposición:</strong> que dejemos de usarlos para algún fin, por ejemplo, la publicidad.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en un formato electrónico de uso común.</li>
              <li><strong>Bloqueo:</strong> suspender temporalmente su uso mientras se resuelve una solicitud tuya.</li>
            </ul>
            <p>
              <strong>Cómo pedirlo:</strong> escribe a{' '}
              <a href="mailto:privacidad@econnet.cl" className="text-blue-600 hover:underline">
                privacidad@econnet.cl
              </a>{' '}
              con el asunto "Datos personales", indica qué derecho quieres ejercer y adjunta algo
              que acredite tu identidad (por ejemplo, escribir desde el correo registrado en tu cuenta).
              Para darte de baja de promociones también basta con el enlace que viene en cada correo,
              o desmarcar la opción en "Mi cuenta".
            </p>
            <p>
              <strong>Plazo:</strong> respondemos dentro de 30 días corridos desde que recibimos
              la solicitud. Ese plazo se puede extender una vez por 30 días más si hace falta;
              si eso ocurre, te avisamos.
            </p>
            <p>
              <strong>Reclamo:</strong> si no respondemos a tiempo o no estás de acuerdo con la
              respuesta, puedes reclamar ante la Agencia de Protección de Datos Personales.
            </p>
            <p>Ejercer estos derechos es gratis.</p>
          </Seccion>

          <Seccion titulo="9. Menores de edad">
            <p>
              El sitio está dirigido a personas mayores de 18 años y a empresas. No recopilamos
              a sabiendas datos de menores. Si detectamos que lo hicimos, los eliminaremos.
            </p>
          </Seccion>

          <Seccion titulo="10. Cookies">
            <p>
              Usamos solo las cookies y el almacenamiento del navegador necesarios para que el
              sitio funcione. El detalle está en nuestra{' '}
              <Link to="/politica-cookies" className="text-blue-600 hover:underline">
                Política de Cookies
              </Link>.
            </p>
          </Seccion>

          <Seccion titulo="11. Cambios a esta política">
            <p>
              Si cambiamos esta política, publicaremos la nueva versión en esta página con su
              fecha y número de versión. Si el cambio es importante, por ejemplo una finalidad
              nueva, te avisaremos por correo o en el sitio y, cuando corresponda, te pediremos
              de nuevo tu consentimiento.
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
            <br />
            <span className="mt-2 block">ECONNET SpA · RUT 76.758.352-4</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default PoliticasPrivacidad
