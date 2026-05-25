import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function TerminosCondiciones() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="text-sm text-gray-500 mb-8">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Términos y condiciones</span>
        </div>

        <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 md:p-10">
          <h1 className="text-4xl font-black text-gray-900 mb-6">
            Términos y condiciones
          </h1>

          <p className="text-gray-700 leading-relaxed">
            Esta sección está pendiente de redacción legal. Aquí se incluirán las
            condiciones de uso del sitio, proceso de compra, pagos, despachos,
            garantías, cambios, devoluciones y responsabilidades de la tienda.
          </p>

          <div className="bg-gray-100 rounded-2xl p-6 mt-8">
            <p className="text-sm text-gray-600">
              Contenido temporal para el frontend. Debe ser revisado y completado
              antes de usar el sitio en producción.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default TerminosCondiciones