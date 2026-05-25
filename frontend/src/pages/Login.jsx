import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Divider, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  CustomerServiceOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const iniciarSesion = () => {
    if (!correo.trim()) {
      message.warning("Ingresa tu correo o usuario");
      return;
    }

    if (!password.trim()) {
      message.warning("Ingresa tu contraseña");
      return;
    }

    message.success("Inicio de sesión correcto");

    setTimeout(() => {
      navigate("/mi-cuenta");
    }, 800);
  };

  const iniciarConGoogle = () => {
    message.info("Inicio con Google pendiente de conectar al backend");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header simple */}
      <header className="bg-black border-b border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src="/img/logo.png"
              alt="Logo Econnet"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-200 hover:text-white"
            >
              <ArrowLeftOutlined />
              Volver al inicio
            </Link>

            <button
              type="button"
              className="flex items-center gap-2 text-sm font-bold !text-white hover:!text-gray-300 bg-transparent border-none"
            >
              <CustomerServiceOutlined className="text-xl !text-white" />
              <span className="!text-white">Ayuda</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Lado izquierdo */}
          <section className="hidden lg:block">
            <div className="max-w-md">
              <h1 className="text-5xl font-black tracking-widest text-gray-950">
                ECONNET
              </h1>

              <p className="text-2xl font-black text-emerald-500 mt-4">
                Te damos la bienvenida
              </p>

              <p className="text-gray-700 mt-4 leading-relaxed">
                Ingresa con tu cuenta para revisar tus compras, guardar
                productos favoritos y acceder a beneficios exclusivos.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <p className="text-xl font-black text-gray-900">Seguro</p>
                  <p className="text-xs text-gray-500 mt-1">acceso protegido</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <p className="text-xl font-black text-gray-900">Rápido</p>
                  <p className="text-xs text-gray-500 mt-1">compra simple</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <p className="text-xl font-black text-gray-900">Fácil</p>
                  <p className="text-xs text-gray-500 mt-1">gestión online</p>
                </div>
              </div>
            </div>
          </section>

          {/* Formulario */}
          <section className="flex justify-center">
            <div className="w-full max-w-[520px] bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="text-center mb-8 lg:hidden">
                  <h1 className="text-4xl font-black tracking-widest text-gray-950">
                    ECONNET
                  </h1>

                  <p className="text-emerald-500 font-black mt-2">
                    Te damos la bienvenida
                  </p>
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  Iniciar sesión
                </h2>

                <p className="text-gray-600 mb-7">
                  Ingresa tu correo y contraseña para acceder a tu cuenta.
                </p>

                <div className="space-y-5">
                  <Input
                    size="large"
                    placeholder="Ingresa tu correo o usuario"
                    prefix={<MailOutlined className="text-gray-400" />}
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="!h-14 !rounded-xl !text-base"
                  />

                  <Input.Password
                    size="large"
                    placeholder="Ingresa tu contraseña"
                    prefix={<LockOutlined className="text-gray-400" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="!h-14 !rounded-xl !text-base"
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Link
                    to="/recuperar-contrasena"
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  block
                  size="large"
                  onClick={iniciarSesion}
                  className="!h-14 !mt-6 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black hover:!bg-black"
                >
                  Iniciar sesión
                </Button>

                <Divider className="!my-6">
                  <span className="text-gray-500 text-sm">o continúa con</span>
                </Divider>

                <Button
                  block
                  size="large"
                  onClick={iniciarConGoogle}
                  className="!h-14 !rounded-2xl !font-bold !border-gray-300 hover:!border-gray-900"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-300 text-sm font-black mr-2">
                    G
                  </span>
                  Iniciar sesión con Google
                </Button>
              </div>

              <div className="bg-gray-50 border-t border-gray-200 px-8 py-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Primera vez en Econnet?
                </p>

                <Link
                  to="/registro"
                  className="inline-block mt-2 text-sm font-black text-emerald-600 hover:text-emerald-700"
                >
                  Crea tu cuenta
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Login;
