import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RutaAdmin({ children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (usuario.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaAdmin;