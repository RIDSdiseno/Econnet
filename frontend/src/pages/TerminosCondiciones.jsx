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

function TerminosCondiciones() {
  useMeta({
    title: 'Términos y condiciones',
    description:
      'Conoce los términos y condiciones de uso de Econnet: proceso de compra, pagos, despachos, garantías, devoluciones y más.',
    canonical: 'https://econnet.cl/terminos-condiciones',
  })

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="text-sm text-gray-500 mb-8">
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span>Términos y condiciones</span>
        </div>

        <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 md:p-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Términos y condiciones</h1>
          <p className="text-sm text-gray-400 mb-8">Última actualización: octubre 2026</p>

          <Seccion titulo="1. Identificación del vendedor">
            <p>
              <strong>Econnet SpA</strong>, RUT 76.758.352-4, domiciliada en La Concepción
              65, of. 1003, Santiago, Chile, es una tienda de comercio electrónico dedicada
              a la venta de productos tecnológicos. Al realizar una compra en nuestro sitio
              web aceptas íntegramente estos términos y condiciones.
            </p>
          </Seccion>

          <Seccion titulo="2. Proceso de compra">
            <p>
              Para comprar en Econnet puedes hacerlo como invitado o creando una cuenta. El
              proceso es: selección del producto → carrito → datos de envío → pago →
              confirmación por correo electrónico.
            </p>
            <p>
              El contrato de compraventa se perfecciona una vez que Econnet confirma la
              disponibilidad del producto y acredita el pago. Nos reservamos el derecho de
              rechazar pedidos en caso de error de precio manifiesto, falta de stock o
              problemas con el medio de pago.
            </p>
          </Seccion>

          <Seccion titulo="3. Precios y disponibilidad">
            <p>
              Todos los precios se expresan en pesos chilenos (CLP) e incluyen IVA salvo
              indicación contraria. Econnet se reserva el derecho de modificar los precios
              en cualquier momento sin previo aviso; el precio aplicable es el vigente al
              momento de confirmar la compra.
            </p>
            <p>
              La disponibilidad de stock es informativa y puede variar. Si un producto no
              está disponible luego de confirmado tu pedido, te contactaremos para ofrecerte
              una alternativa o el reembolso íntegro.
            </p>
          </Seccion>

          <Seccion titulo="4. Medios de pago">
            <p>
              Aceptamos los siguientes medios de pago:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Tarjetas de crédito y débito (Visa, Mastercard) vía Webpay / Transbank</li>
              <li>Tarjeta de crédito mediante Oneclick</li>
              <li>MercadoPago</li>
              <li>Transferencia bancaria</li>
            </ul>
            <p>
              El pago debe acreditarse dentro de las 48 horas siguientes a la creación del
              pedido; de lo contrario el pedido podrá ser cancelado automáticamente.
            </p>
          </Seccion>

          <Seccion titulo="5. Despacho y tiempos de entrega">
            <p>
              Realizamos despachos a todo el territorio nacional a través de empresas de
              courier. El plazo estimado de entrega es de 2 a 7 días hábiles según la
              región de destino, contados desde la confirmación del pago.
            </p>
            <p>
              Los plazos son referenciales y pueden verse afectados por factores externos
              (fuerza mayor, restricciones logísticas, feriados). Econnet no se hace
              responsable por demoras ocasionadas por el courier o por datos de envío
              erróneos ingresados por el comprador.
            </p>
            <p>
              También disponemos de retiro en tienda cuando así se indique en el producto.
              Los costos de despacho se informan al momento del checkout.
            </p>
          </Seccion>

          <Seccion titulo="6. Garantía">
            <p>
              Los productos nuevos cuentan con la garantía del fabricante indicada en cada
              ficha de producto. La garantía legal mínima exigida por la Ley del Consumidor
              (Ley 19.496) es de 3 meses para productos con falla o vicio oculto.
            </p>
            <p>
              Para hacer efectiva la garantía el comprador debe:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Contactar a Econnet dentro del período de garantía vigente</li>
              <li>Presentar boleta o comprobante de compra</li>
              <li>Describir el defecto o falla presentada</li>
            </ul>
            <p>
              La garantía no cubre daños ocasionados por mal uso, accidentes, modificaciones
              no autorizadas o desgaste normal del producto.
            </p>
          </Seccion>

          <Seccion titulo="7. Cambios y devoluciones">
            <p>
              De acuerdo a la Ley del Consumidor (artículo 12 A), tienes derecho a retracto
              dentro de los <strong>10 días corridos</strong> siguientes a la recepción del
              producto, siempre que:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>El producto esté en su embalaje original y sin uso</li>
              <li>Se devuelva con todos sus accesorios y documentación</li>
              <li>La solicitud se realice dentro del plazo indicado</li>
            </ul>
            <p>
              Para solicitar un cambio o devolución escríbenos a través del{' '}
              <Link to="/contacto" className="text-blue-600 hover:underline">
                formulario de contacto
              </Link>{' '}
              o al correo de atención al cliente. El costo del envío de devolución es de
              cargo del comprador, salvo que el producto presente un defecto de fábrica.
            </p>
            <p>
              El reembolso se realizará a través del mismo medio de pago utilizado en la
              compra dentro de un plazo máximo de 10 días hábiles desde la recepción del
              producto devuelto.
            </p>
          </Seccion>

          <Seccion titulo="8. Propiedad intelectual">
            <p>
              Todo el contenido de este sitio web (textos, imágenes, logotipos, diseño)
              es propiedad de Econnet o de sus respectivos titulares y está protegido por
              las leyes de propiedad intelectual. Queda prohibida su reproducción total o
              parcial sin autorización expresa.
            </p>
          </Seccion>

          <Seccion titulo="9. Limitación de responsabilidad">
            <p>
              Econnet no será responsable por daños indirectos, lucro cesante o pérdida de
              datos derivados del uso del sitio o de los productos adquiridos, en la medida
              que lo permita la legislación chilena vigente.
            </p>
          </Seccion>

          <Seccion titulo="10. Legislación aplicable">
            <p>
              Estos términos se rigen por la legislación chilena, en especial la Ley
              19.496 sobre Protección de los Derechos de los Consumidores y la Ley
              19.628 modificada por la Ley 21.719 sobre Protección de Datos Personales.
              Cualquier controversia se someterá a los tribunales competentes de la ciudad
              de Santiago de Chile.
            </p>
            <p>
              El tratamiento de los datos personales asociados a tu compra o cuenta se
              rige por nuestra{' '}
              <Link to="/politicas-privacidad" className="text-blue-600 hover:underline">
                Política de privacidad
              </Link>.
            </p>
          </Seccion>

          <Seccion titulo="11. Modificaciones">
            <p>
              Econnet se reserva el derecho de modificar estos términos y condiciones en
              cualquier momento. Los cambios se publicarán en esta página con la fecha de
              actualización. El uso continuado del sitio luego de la publicación implica
              la aceptación de los nuevos términos.
            </p>
          </Seccion>

          <div className="border-t border-gray-200 mt-8 pt-6 text-sm text-gray-500">
            ¿Tienes dudas?{' '}
            <Link to="/contacto" className="text-blue-600 hover:underline">
              Contáctanos
            </Link>{' '}
            o visita nuestro{' '}
            <Link to="/centro-ayuda" className="text-blue-600 hover:underline">
              Centro de ayuda
            </Link>
            .
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default TerminosCondiciones
