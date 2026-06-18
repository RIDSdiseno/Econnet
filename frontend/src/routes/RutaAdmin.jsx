import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../context/AuthContext";

function RutaAdmin({ children }) {
  const location = useLocation();

  const { usuario, token, cargandoAuth } = useAuth();

  if (cargandoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spin size="large" />
      </div>
    );
  }

  if (!token || !usuario) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (usuario.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaAdmin;
