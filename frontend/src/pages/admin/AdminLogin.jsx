import { useEffect, useState } from "react";
import { Button, Input, message } from "antd";
import {
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const {
    loginAdmin,
    usuario,
    cargandoAuth,
  } = useAuth();

  useEffect(() => {
    if (!cargandoAuth && usuario?.rol === "admin") {
      navigate("/admin", {
        replace: true,
      });
    }
  }, [cargandoAuth, usuario, navigate]);

  const iniciarSesionAdmin = async () => {
    if (!correo.trim()) {
      message.warning("Ingresa tu correo");
      return;
    }

    if (!password.trim()) {
      message.warning("Ingresa tu contraseña");
      return;
    }

    try {
      setCargando(true);

      await loginAdmin({
        email: correo.trim(),
        password,
      });

      message.success("Acceso administrativo correcto");

      navigate("/admin", {
        replace: true,
      });
    } catch (error) {
      message.error(
        error.message ||
          "No se pudo iniciar la sesión administrativa",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex bg-black border border-slate-700 rounded-2xl px-6 py-4"
          >
            <img
              src="/img/logo.png"
              alt="Logo Econnet"
              className="h-16 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center justify-center gap-2 mt-6 text-emerald-400">
            <SafetyCertificateOutlined className="text-xl" />

            <span className="font-bold">
              Acceso administrativo
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-black text-slate-950">
              Panel de administración
            </h1>

            <p className="text-slate-500 mt-2 mb-7">
              Ingresa con una cuenta que tenga permisos de
              administrador.
            </p>

            <div className="space-y-5">
              <Input
                size="large"
                type="email"
                placeholder="Correo administrativo"
                prefix={
                  <MailOutlined className="text-gray-400" />
                }
                value={correo}
                onChange={(event) =>
                  setCorreo(event.target.value)
                }
                className="!h-14 !rounded-xl"
              />

              <Input.Password
                size="large"
                placeholder="Contraseña"
                prefix={
                  <LockOutlined className="text-gray-400" />
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                onPressEnter={iniciarSesionAdmin}
                className="!h-14 !rounded-xl"
              />
            </div>

            <Button
              block
              size="large"
              loading={cargando}
              onClick={iniciarSesionAdmin}
              className="!h-14 !mt-7 !rounded-xl !bg-slate-950 !border-slate-950 !text-white !font-bold"
            >
              Ingresar al panel
            </Button>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black"
            >
              <ArrowLeftOutlined />
              Volver a la tienda
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Acceso restringido exclusivamente a personal autorizado.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;