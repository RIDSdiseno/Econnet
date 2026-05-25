import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal, Input, message } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  CreditCardOutlined,
  HeartOutlined,
  SettingOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  RightOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const pedidosUsuario = [
  {
    id: 1,
    numero: "EC-2026-0001",
    fecha: "25/05/2026",
    estado: "Preparando pedido",
    total: 1574470,
    productos: 2,
  },
];
function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const menuCuenta = [
  {
    key: "datos",
    label: "Datos personales",
    icon: <UserOutlined />,
  },
  {
    key: "direcciones",
    label: "Direcciones",
    icon: <HomeOutlined />,
  },
  {
    key: "pedidos",
    label: "Mis pedidos",
    icon: <ShoppingOutlined />,
  },
  {
    key: "pagos",
    label: "Medios de pago",
    icon: <CreditCardOutlined />,
  },
  {
    key: "listas",
    label: "Mis listas",
    icon: <HeartOutlined />,
  },
  {
    key: "configuracion",
    label: "Configurar mi cuenta",
    icon: <SettingOutlined />,
  },
];

function MiCuenta() {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState("datos");
  const [modalDireccion, setModalDireccion] = useState(false);

  const [usuario, setUsuario] = useState({
    nombre: "Usuario Econnet",
    documento: "RUT",
    celular: "+56 9 1234 5678",
    correo: "usuario@econnet.cl",
  });

  const [direcciones, setDirecciones] = useState([
    {
      id: 1,
      direccion: "Av. Providencia 1234",
      comuna: "Providencia, Región Metropolitana",
      principal: true,
    },
    {
      id: 2,
      direccion: "Calle Los Carrera 456",
      comuna: "Santiago, Región Metropolitana",
      principal: false,
    },
  ]);

  const [nuevaDireccion, setNuevaDireccion] = useState({
    direccion: "",
    comuna: "",
  });

  const cerrarSesion = () => {
    message.success("Sesión cerrada");
    navigate("/");
  };

  const agregarDireccion = () => {
    if (!nuevaDireccion.direccion.trim() || !nuevaDireccion.comuna.trim()) {
      message.warning("Completa la dirección y comuna");
      return;
    }

    setDirecciones((prev) => [
      ...prev,
      {
        id: Date.now(),
        direccion: nuevaDireccion.direccion,
        comuna: nuevaDireccion.comuna,
        principal: false,
      },
    ]);

    setNuevaDireccion({
      direccion: "",
      comuna: "",
    });

    setModalDireccion(false);
    message.success("Dirección agregada");
  };

  const eliminarDireccion = (id) => {
    setDirecciones((prev) => prev.filter((item) => item.id !== id));
  };

  const guardarComoPrincipal = (id) => {
    setDirecciones((prev) =>
      prev.map((item) => ({
        ...item,
        principal: item.id === id,
      })),
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Mi cuenta</span>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-8">Mi cuenta</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Menú lateral */}
          <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-fit">
            {menuCuenta.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSeccionActiva(item.key)}
                className={`w-full px-5 py-5 flex items-center justify-between border-b border-gray-200 transition ${
                  seccionActiva === item.key
                    ? "bg-gray-950"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <span
                  className={`flex items-center gap-3 font-bold ${
                    seccionActiva === item.key ? "text-white" : "text-gray-700"
                  }`}
                >
                  <span
                    className={`text-xl ${
                      seccionActiva === item.key
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {item.label}
                </span>

                <RightOutlined
                  className={
                    seccionActiva === item.key ? "text-white" : "text-gray-400"
                  }
                />
              </button>
            ))}

            <button
              type="button"
              onClick={cerrarSesion}
              className="w-full px-5 py-5 flex items-center justify-between text-red-600 hover:bg-red-50 transition"
            >
              <span className="flex items-center gap-3 font-bold">
                <LogoutOutlined className="text-xl" />
                Cerrar sesión
              </span>

              <RightOutlined />
            </button>
          </aside>

          {/* Contenido */}
          <section>
            {seccionActiva === "datos" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Datos personales
                </h2>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-7">
                  <div className="border-b border-gray-200 pb-5 mb-5">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          Nombre y apellidos
                        </p>
                        <p className="text-gray-600 mt-1">{usuario.nombre}</p>
                      </div>

                      <button className="text-sm font-bold underline">
                        Editar
                      </button>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-5 mb-5">
                    <p className="font-bold text-gray-900">Tipo de documento</p>
                    <p className="text-gray-600 mt-1">{usuario.documento}</p>
                  </div>

                  <div className="border-b border-gray-200 pb-5 mb-5">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">Celular</p>
                        <p className="text-gray-600 mt-1">{usuario.celular}</p>
                      </div>

                      <button className="text-sm font-bold underline">
                        Editar
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-gray-900">Correo</p>
                    <p className="text-gray-600 mt-1">{usuario.correo}</p>
                  </div>
                </div>
              </div>
            )}

            {seccionActiva === "direcciones" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Direcciones
                  </h2>

                  <Button
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => setModalDireccion(true)}
                    className="!h-12 !rounded-2xl !font-bold"
                  >
                    Agregar dirección
                  </Button>
                </div>

                <div className="space-y-5">
                  {direcciones.map((item) => (
                    <article
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-gray-900">
                            {item.direccion}
                          </h3>

                          {item.principal && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                              Principal
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mt-1">{item.comuna}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {!item.principal && (
                          <button
                            onClick={() => guardarComoPrincipal(item.id)}
                            className="text-sm font-bold underline"
                          >
                            Guardar como principal
                          </button>
                        )}

                        <button
                          onClick={() => eliminarDireccion(item.id)}
                          className="text-sm font-bold text-red-600 underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {seccionActiva === "pedidos" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Mis pedidos
                </h2>

                <div className="space-y-5">
                  {pedidosUsuario.map((pedido) => (
                    <article
                      key={pedido.id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <ShoppingOutlined className="text-2xl text-gray-900" />

                            <div>
                              <h3 className="text-xl font-black text-gray-900">
                                Pedido {pedido.numero}
                              </h3>

                              <p className="text-sm text-gray-500">
                                Realizado el {pedido.fecha}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 mt-4">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                              {pedido.estado}
                            </span>

                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                              {pedido.productos} productos
                            </span>
                          </div>
                        </div>

                        <div className="md:text-right">
                          <p className="text-sm text-gray-500">Total</p>

                          <p className="text-2xl font-black text-gray-950">
                            {formatearPrecio(pedido.total)}
                          </p>

                          <Link to="/seguimiento-compra">
                            <Button
                              size="large"
                              className="!mt-4 !rounded-xl !font-bold"
                            >
                              Ver seguimiento
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {seccionActiva === "pagos" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Medios de pago
                </h2>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                  <CreditCardOutlined className="text-4xl text-gray-400 mb-4" />

                  <h3 className="text-xl font-black text-gray-900">
                    No tienes medios de pago guardados
                  </h3>

                  <p className="text-gray-600 mt-2">
                    Más adelante podrás guardar tarjetas o métodos de pago para
                    comprar más rápido.
                  </p>
                </div>
              </div>
            )}

            {seccionActiva === "listas" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Mis listas
                  </h2>

                  <Button
                    size="large"
                    className="!h-12 !rounded-2xl !font-bold"
                  >
                    Crear lista
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 max-w-xl">
                  <div className="h-52 bg-gray-100 rounded-xl flex items-center justify-center">
                    <HeartOutlined className="text-6xl text-gray-300" />
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-gray-900">
                        Mis favoritos
                      </h3>

                      <p className="text-gray-600">
                        Agrega productos para comenzar.
                      </p>
                    </div>

                    <RightOutlined />
                  </div>
                </div>
              </div>
            )}

            {seccionActiva === "configuracion" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Configurar mi cuenta
                </h2>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-7 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                    <div>
                      <h3 className="font-black text-gray-900">
                        Cambiar contraseña
                      </h3>

                      <p className="text-gray-600 text-sm mt-1">
                        Actualiza tu contraseña de acceso.
                      </p>
                    </div>

                    <button className="text-sm font-bold underline">
                      Editar
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-gray-900">
                        Preferencias de comunicación
                      </h3>

                      <p className="text-gray-600 text-sm mt-1">
                        Administra promociones, novedades y notificaciones.
                      </p>
                    </div>

                    <button className="text-sm font-bold underline">
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      <Modal
        open={modalDireccion}
        onCancel={() => setModalDireccion(false)}
        footer={null}
        centered
        title="Agregar dirección"
      >
        <div className="space-y-4 pt-3">
          <Input
            size="large"
            placeholder="Dirección"
            value={nuevaDireccion.direccion}
            onChange={(e) =>
              setNuevaDireccion((prev) => ({
                ...prev,
                direccion: e.target.value,
              }))
            }
          />

          <Input
            size="large"
            placeholder="Comuna / Región"
            value={nuevaDireccion.comuna}
            onChange={(e) =>
              setNuevaDireccion((prev) => ({
                ...prev,
                comuna: e.target.value,
              }))
            }
          />

          <Button
            block
            size="large"
            type="primary"
            onClick={agregarDireccion}
            className="!bg-gray-950 !border-gray-950 !font-bold hover:!bg-black"
          >
            Guardar dirección
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default MiCuenta;
