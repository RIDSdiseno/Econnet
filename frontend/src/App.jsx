import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Carrito from "./pages/Carrito";
import QuienesSomos from "./pages/QuienesSomos";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import MiCuenta from "./pages/MiCuenta";
import Contacto from "./pages/Contacto";
import CentroAyuda from "./pages/CentroAyuda";
import Checkout from "./pages/Checkout";
import CompraExitosa from "./pages/CompraExitosa";
import SeguimientoCompra from "./pages/SeguimientoCompra";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticasPrivacidad from "./pages/PoliticasPrivacidad";


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/mi-cuenta" element={<MiCuenta />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/centro-ayuda" element={<CentroAyuda />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/seguimiento-compra" element={<SeguimientoCompra />} />
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
        <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
        <Route path="/compra-exitosa" element={<CompraExitosa />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
