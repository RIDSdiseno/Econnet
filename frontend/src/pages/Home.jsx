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
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

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