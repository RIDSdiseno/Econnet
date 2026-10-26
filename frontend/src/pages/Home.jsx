import { useMeta } from '../hooks/useMeta'
import Navbar from '../components/Navbar'
import BannerCarousel from '../components/BannerCarousel'
import Recomendados from '../components/Recomendados'
import PromoHorizontal from '../components/PromoHorizontal'
import OfertasLanzamientos from '../components/OfertasLanzamientos'
import ProductosDestacados from '../components/ProductosDestacados'
import AnunciosTriples from '../components/AnunciosTriples'
import Marcas from '../components/Marcas'
import Footer from '../components/Footer'
import SuscripcionModal from '../components/SuscripcionModal'

function Home() {
  useMeta({
    title: "Tecnología al mejor precio en Chile",
    description:
      "Compra online notebooks, monitores, almacenamiento y accesorios tecnológicos. Despacho a todo Chile, garantía incluida.",
    canonical: "https://econnet.cl/",
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      {/* h1 semántico requerido por SEO; la identidad visual la da el banner */}
      <h1 className="sr-only">Econnet — Tecnología al mejor precio en Chile</h1>

      <BannerCarousel />

      <Recomendados />

      <PromoHorizontal />

      <OfertasLanzamientos />

      <ProductosDestacados />

      <AnunciosTriples />

      <Marcas />

      <Footer />

      <SuscripcionModal />
    </div>
  )
}

export default Home