import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, message } from "antd";

function decodificarJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      message.error(error);
      navigate("/login", { replace: true });
      return;
    }

    if (!token) {
      message.error("No llegó el token de sesión");
      navigate("/login", { replace: true });
      return;
    }

    const usuario = decodificarJwt(token);

    localStorage.setItem("token", token);

    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
    }

    message.success("Sesión iniciada correctamente");

    setTimeout(() => {
      if (usuario?.rol === "admin") {
        window.location.href = "/admin";
        return;
      }

      window.location.href = "/mi-cuenta";
    }, 500);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 flex flex-col items-center gap-4">
        <Spin size="large" />
        <p className="text-gray-700 font-bold">Iniciando sesión...</p>
      </div>
    </div>
  );
}

export default AuthCallback;