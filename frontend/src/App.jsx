import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

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
import RutaAdmin from "./routes/RutaAdmin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminDetallePedido from "./pages/admin/AdminDetallePedido";
import AdminTarifas from "./pages/admin/AdminTarifas";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminMarcas from "./pages/admin/AdminMarcas";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminAnuncios from "./pages/admin/AdminAnuncios";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AuthCallback from "./pages/AuthCallback";
import AdminSoporte from "./pages/admin/AdminSoporte";
import AdminDetalleSoporte from "./pages/admin/AdminDetalleSoporte";
import AdminProductosVendidos from "./pages/admin/AdminProductosVendidos";
import AdminLogin from "./pages/admin/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/centro-ayuda" element={<CentroAyuda />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/seguimiento-compra" element={<SeguimientoCompra />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/terminos-condiciones"
            element={<TerminosCondiciones />}
          />
          <Route
            path="/politicas-privacidad"
            element={<PoliticasPrivacidad />}
          />
          <Route path="/compra-exitosa" element={<CompraExitosa />} />

          <Route
            path="/admin"
            element={
              <RutaAdmin>
                <AdminLayout />
              </RutaAdmin>
            }
          >
            <Route
              path="productos-vendidos"
              element={<AdminProductosVendidos />}
            />
            <Route index element={<AdminDashboard />} />
            <Route path="pedidos" element={<AdminPedidos />} />
            <Route path="pedidos/:id" element={<AdminDetallePedido />} />
            <Route path="tarifas" element={<AdminTarifas />} />
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="marcas" element={<AdminMarcas />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="anuncios" element={<AdminAnuncios />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="soporte" element={<AdminSoporte />} />
            <Route path="soporte/:id" element={<AdminDetalleSoporte />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
