import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Checkbox, Input, Select, Divider, message } from "antd";
import {
  MailOutlined,
  UserOutlined,
  PhoneOutlined,
  LockOutlined,
  IdcardOutlined,
  ArrowLeftOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

function Registro() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    correo: "",
    nombre: "",
    apellidos: "",
    tipoDocumento: "RUT",
    documento: "",
    celular: "",
    password: "",
    aceptaTerminos: false,
    aceptaPromociones: false,
    aceptaPublicidad: false,
  });

  const actualizarCampo = (campo, valor) => {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const passwordValida = {
    largo: formulario.password.length >= 8,
    numero: /\d/.test(formulario.password),
    mayuscula: /[A-Z]/.test(formulario.password),
    minuscula: /[a-z]/.test(formulario.password),
    sinEspacio: !/\s/.test(formulario.password),
  };

  const puedeRegistrarse =
    formulario.correo.trim() &&
    formulario.nombre.trim() &&
    formulario.apellidos.trim() &&
    formulario.documento.trim() &&
    formulario.celular.trim() &&
    formulario.password.trim() &&
    formulario.aceptaTerminos &&
    Object.values(passwordValida).every(Boolean);

  const registrarUsuario = () => {
    if (!puedeRegistrarse) {
      message.warning("Completa los campos obligatorios correctamente");
      return;
    }

    message.success("Registro realizado correctamente");

    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  const registrarConGoogle = () => {
    message.success("Registro con Google realizado correctamente");

    setTimeout(() => {
      navigate("/");
    }, 800);
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
              to="/login"
              className="hidden sm:flex items-center gap-2 text-sm font-bold !text-white hover:!text-gray-300"
            >
              <ArrowLeftOutlined className="!text-white" />
              <span className="!text-white">Volver a iniciar sesión</span>
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

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          {/* Lado izquierdo */}
          <section className="hidden lg:block pt-10">
            <h1 className="text-5xl font-black tracking-widest text-gray-950">
              ECONNET
            </h1>

            <p className="text-2xl font-black text-emerald-500 mt-4">
              Crea tu cuenta
            </p>

            <p className="text-gray-700 mt-4 leading-relaxed max-w-md">
              Regístrate para comprar más rápido, guardar tus productos
              favoritos, revisar pedidos y acceder a beneficios exclusivos.
            </p>

            <div className="mt-8 bg-white border border-gray-200 rounded-3xl shadow-sm p-6 max-w-md">
              <h2 className="text-lg font-black text-gray-900 mb-4">
                Beneficios de registrarte
              </h2>

              <ul className="space-y-3 text-sm text-gray-700">
                <li>• Compra más rápida y segura.</li>
                <li>• Acceso a ofertas y novedades.</li>
                <li>• Seguimiento de pedidos.</li>
                <li>• Historial de compras y cotizaciones.</li>
              </ul>
            </div>
          </section>

          {/* Formulario */}
          <section className="flex justify-center">
            <div className="w-full max-w-[620px] bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 md:p-10">
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  Regístrate para comprar
                </h2>

                <p className="text-gray-600 mb-7">
                  Crea tu cuenta y accede a una experiencia de compra más
                  simple.
                </p>

                <Button
                  block
                  size="large"
                  onClick={registrarConGoogle}
                  className="!h-13 !rounded-2xl !font-bold !border-gray-300 hover:!border-gray-900"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-300 text-sm font-black mr-2">
                    G
                  </span>
                  Registrarse con Google
                </Button>

                <Divider className="!my-6">
                  <span className="text-gray-500 text-sm">
                    o completa tus datos
                  </span>
                </Divider>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Correo
                    </label>

                    <Input
                      size="large"
                      placeholder="Ingresa un correo"
                      prefix={<MailOutlined className="text-gray-400" />}
                      value={formulario.correo}
                      onChange={(e) =>
                        actualizarCampo("correo", e.target.value)
                      }
                      className="!h-13 !rounded-xl !mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold text-gray-800">
                        Nombre
                      </label>

                      <Input
                        size="large"
                        placeholder="Ingresa tu nombre"
                        prefix={<UserOutlined className="text-gray-400" />}
                        value={formulario.nombre}
                        onChange={(e) =>
                          actualizarCampo("nombre", e.target.value)
                        }
                        className="!h-13 !rounded-xl !mt-2"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-800">
                        Apellidos
                      </label>

                      <Input
                        size="large"
                        placeholder="Ingresa tus apellidos"
                        value={formulario.apellidos}
                        onChange={(e) =>
                          actualizarCampo("apellidos", e.target.value)
                        }
                        className="!h-13 !rounded-xl !mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Documento
                    </label>

                    <Input
                      size="large"
                      placeholder="Ingresa tu documento"
                      prefix={<IdcardOutlined className="text-gray-400" />}
                      addonBefore={
                        <Select
                          value={formulario.tipoDocumento}
                          onChange={(value) =>
                            actualizarCampo("tipoDocumento", value)
                          }
                          options={[
                            { value: "RUT", label: "RUT" },
                            { value: "DNI", label: "DNI" },
                            { value: "PASAPORTE", label: "Pasaporte" },
                          ]}
                          className="w-28"
                        />
                      }
                      value={formulario.documento}
                      onChange={(e) =>
                        actualizarCampo("documento", e.target.value)
                      }
                      className="!h-13 !rounded-xl !mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Celular
                    </label>

                    <Input
                      size="large"
                      placeholder="Ingresa un celular"
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      addonBefore="+56"
                      value={formulario.celular}
                      onChange={(e) =>
                        actualizarCampo("celular", e.target.value)
                      }
                      className="!h-13 !rounded-xl !mt-2"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Comienza con 9.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Contraseña
                    </label>

                    <Input.Password
                      size="large"
                      placeholder="Ingresa una contraseña"
                      prefix={<LockOutlined className="text-gray-400" />}
                      value={formulario.password}
                      onChange={(e) =>
                        actualizarCampo("password", e.target.value)
                      }
                      className="!h-13 !rounded-xl !mt-2"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4 text-xs">
                      <p
                        className={
                          passwordValida.largo
                            ? "text-emerald-600"
                            : "text-gray-500"
                        }
                      >
                        • Mín. 8 caracteres
                      </p>

                      <p
                        className={
                          passwordValida.numero
                            ? "text-emerald-600"
                            : "text-gray-500"
                        }
                      >
                        • 1 número
                      </p>

                      <p
                        className={
                          passwordValida.mayuscula
                            ? "text-emerald-600"
                            : "text-gray-500"
                        }
                      >
                        • 1 mayúscula
                      </p>

                      <p
                        className={
                          passwordValida.minuscula
                            ? "text-emerald-600"
                            : "text-gray-500"
                        }
                      >
                        • 1 minúscula
                      </p>

                      <p
                        className={
                          passwordValida.sinEspacio
                            ? "text-emerald-600"
                            : "text-gray-500"
                        }
                      >
                        • Sin espacios
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Checkbox
                      checked={formulario.aceptaPromociones}
                      onChange={(e) =>
                        actualizarCampo("aceptaPromociones", e.target.checked)
                      }
                    >
                      <span className="text-sm text-gray-700">
                        Acepto recibir promociones, novedades y ofertas
                        personalizadas.
                      </span>
                    </Checkbox>

                    <Checkbox
                      checked={formulario.aceptaPublicidad}
                      onChange={(e) =>
                        actualizarCampo("aceptaPublicidad", e.target.checked)
                      }
                    >
                      <span className="text-sm text-gray-700">
                        Quiero recibir publicidad de productos relacionados con
                        mis preferencias.
                      </span>
                    </Checkbox>

                    <Checkbox
                      checked={formulario.aceptaTerminos}
                      onChange={(e) =>
                        actualizarCampo("aceptaTerminos", e.target.checked)
                      }
                    >
                      <span className="text-sm text-gray-700">
                        Acepto los{" "}
                        <Link
                          to="/terminos-condiciones"
                          className="underline font-bold"
                        >
                          términos y condiciones
                        </Link>{" "}
                        y la{" "}
                        <Link
                          to="/politicas-privacidad"
                          className="underline font-bold"
                        >
                          política de privacidad
                        </Link>
                        .
                      </span>
                    </Checkbox>
                  </div>
                </div>

                <Button
                  block
                  size="large"
                  disabled={!puedeRegistrarse}
                  onClick={registrarUsuario}
                  className="!h-14 !mt-8 !rounded-2xl !font-black disabled:!bg-gray-100 disabled:!text-gray-400 enabled:!bg-gray-950 enabled:!text-white enabled:!border-gray-950 hover:enabled:!bg-black"
                >
                  Regístrate
                </Button>
              </div>

              <div className="bg-gray-50 border-t border-gray-200 px-8 py-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    to="/login"
                    className="font-black text-emerald-600 hover:text-emerald-700"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Registro;
