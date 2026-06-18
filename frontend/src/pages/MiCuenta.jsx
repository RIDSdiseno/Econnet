import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Modal,
  Input,
  Select,
  Checkbox,
  Pagination,
  message,
} from "antd";
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
  CustomerServiceOutlined,
  MessageOutlined,
  ReloadOutlined,
  SendOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  obtenerDirecciones,
  crearDireccion,
  marcarDireccionPrincipal,
  eliminarDireccionUsuario,
  obtenerFavoritos,
  eliminarFavoritoUsuario,
  obtenerPedidos,
  cambiarPasswordUsuario,
  obtenerMediosPago,
  iniciarInscripcionMedioPago,
  eliminarMedioPago,
  obtenerMisSolicitudes,
  obtenerMiSolicitudPorId,
  responderMiSolicitud,
} from "../services/api";
import { opcionesRegiones } from "../data/regionesComunasChile";

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatearEstadoPedido(estado) {
  const estados = {
    pendiente: "Pedido recibido",
    confirmado: "Confirmado",
    preparando: "Preparando",
    empaquetando: "Empaquetando",
    en_despacho: "En camino",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  return estados[estado] || estado || "Sin estado";
}

function formatearEstadoPago(estadoPago) {
  const estados = {
    pendiente: "Pago pendiente",
    aprobado: "Pago aprobado",
    rechazado: "Pago rechazado",
    cancelado: "Pago cancelado",
  };

  return estados[estadoPago] || "Pago pendiente";
}

function claseEstadoPedido(estado) {
  if (estado === "cancelado") {
    return "text-red-700 bg-red-100";
  }

  if (estado === "entregado") {
    return "text-emerald-700 bg-emerald-100";
  }

  return "text-blue-700 bg-blue-100";
}

function claseEstadoPago(estadoPago) {
  if (estadoPago === "aprobado") {
    return "text-emerald-700 bg-emerald-100";
  }

  if (estadoPago === "rechazado" || estadoPago === "cancelado") {
    return "text-red-700 bg-red-100";
  }

  return "text-orange-700 bg-orange-100";
}

function formatearEstadoSoporte(estado) {
  const estados = {
    nuevo: "Nuevo",
    en_revision: "En revisión",
    respondido: "Respondido",
    cerrado: "Cerrado",
  };

  return estados[estado] || estado || "Sin estado";
}

function claseEstadoSoporte(estado) {
  const clases = {
    nuevo: "text-blue-700 bg-blue-100",
    en_revision: "text-orange-700 bg-orange-100",
    respondido: "text-emerald-700 bg-emerald-100",
    cerrado: "text-gray-700 bg-gray-200",
  };

  return clases[estado] || "text-gray-700 bg-gray-100";
}

function formatearCategoriaSoporte(categoria) {
  const categorias = {
    despacho: "Despacho y seguimiento",
    pagos: "Pagos",
    documentos: "Boletas y facturas",
    garantias: "Garantías",
    devoluciones: "Devoluciones",
    reembolsos: "Reembolsos",
    compras_empresas: "Compras para empresas",
    soporte_tecnico: "Soporte técnico",
    otro: "Otro",
  };

  return categorias[categoria] || categoria || "Sin categoría";
}

function formatearFechaSoporte(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Date(fecha).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
    key: "solicitudes",
    label: "Mis solicitudes",
    icon: <CustomerServiceOutlined />,
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
  const [searchParams] = useSearchParams();
  const {
    usuario,
    token,
    cargandoAuth,
    estaLogueado,
    actualizarUsuario,
    logout,
  } = useAuth();

  const [seccionActiva, setSeccionActiva] = useState("datos");
  const [modalDireccion, setModalDireccion] = useState(false);
  const [modalCelular, setModalCelular] = useState(false);
  const [celularEditar, setCelularEditar] = useState("");
  const [cargandoCelular, setCargandoCelular] = useState(false);

  const [modalPassword, setModalPassword] = useState(false);
  const [cargandoPassword, setCargandoPassword] = useState(false);

  const [formPassword, setFormPassword] = useState({
    passwordActual: "",
    nuevaPassword: "",
    confirmarPassword: "",
  });

  const [direcciones, setDirecciones] = useState([]);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(false);

  const [favoritos, setFavoritos] = useState([]);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [mediosPago, setMediosPago] = useState([]);
  const [cargandoMediosPago, setCargandoMediosPago] = useState(false);
  const [agregandoMedioPago, setAgregandoMedioPago] = useState(false);

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false);
  const [paginaSolicitudes, setPaginaSolicitudes] = useState(1);
  const [recargarSolicitudes, setRecargarSolicitudes] = useState(0);

  const [paginacionSolicitudes, setPaginacionSolicitudes] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 1,
  });

  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [cargandoDetalleSolicitud, setCargandoDetalleSolicitud] =
    useState(false);
  const [respuestaSolicitud, setRespuestaSolicitud] = useState("");
  const [enviandoRespuestaSolicitud, setEnviandoRespuestaSolicitud] =
    useState(false);

  const [nuevaDireccion, setNuevaDireccion] = useState({
    region: "",
    comuna: "",
    calle: "",
    numero: "",
    departamento: "",
    principal: false,
  });

  useEffect(() => {
    if (!cargandoAuth && !estaLogueado) {
      message.warning("Debes iniciar sesión para acceder a tu cuenta");
      navigate("/login");
    }
  }, [cargandoAuth, estaLogueado, navigate]);

  useEffect(() => {
    const cargarDirecciones = async () => {
      if (!token || !estaLogueado) return;

      try {
        setCargandoDirecciones(true);

        const data = await obtenerDirecciones(token);
        setDirecciones(data);
      } catch (error) {
        message.error(error.message || "No se pudieron cargar las direcciones");
      } finally {
        setCargandoDirecciones(false);
      }
    };

    cargarDirecciones();
  }, [token, estaLogueado]);

  useEffect(() => {
    const cargarFavoritos = async () => {
      if (!token || !estaLogueado) return;

      try {
        setCargandoFavoritos(true);

        const data = await obtenerFavoritos(token);
        setFavoritos(data);
      } catch (error) {
        message.error(error.message || "No se pudieron cargar los favoritos");
      } finally {
        setCargandoFavoritos(false);
      }
    };

    cargarFavoritos();
  }, [token, estaLogueado]);

  useEffect(() => {
    const cargarPedidos = async () => {
      if (!token || !estaLogueado) return;

      try {
        setCargandoPedidos(true);

        const data = await obtenerPedidos(token);
        setPedidos(data);
      } catch (error) {
        message.error(error.message || "No se pudieron cargar los pedidos");
      } finally {
        setCargandoPedidos(false);
      }
    };

    cargarPedidos();
  }, [token, estaLogueado]);

  useEffect(() => {
    const cargarMediosPago = async () => {
      if (!token || !estaLogueado) return;

      try {
        setCargandoMediosPago(true);

        const data = await obtenerMediosPago(token);
        setMediosPago(data);
      } catch (error) {
        message.error(
          error.message || "No se pudieron cargar los medios de pago",
        );
      } finally {
        setCargandoMediosPago(false);
      }
    };

    cargarMediosPago();
  }, [token, estaLogueado]);

  useEffect(() => {
    const seccion = searchParams.get("seccion");
    const ok = searchParams.get("ok");
    const error = searchParams.get("error");

    if (seccion === "medios-pago" || seccion === "pagos") {
      setSeccionActiva("pagos");
    }
    if (seccion === "solicitudes") {
      setSeccionActiva("solicitudes");
    }
    if (ok === "medio_pago_guardado") {
      message.success("Medio de pago guardado correctamente");
    }

    if (error) {
      const mensajes = {
        sin_token: "No se recibió el token de inscripción",
        inscripcion_no_encontrada:
          "No se encontró la inscripción del medio de pago",
        inscripcion_ya_procesada: "Esta inscripción ya fue procesada",
        inscripcion_rechazada: "La inscripción de la tarjeta fue rechazada",
        inscripcion_error: "Ocurrió un error al guardar el medio de pago",
        inscripcion_cancelada: "La inscripción de la tarjeta fue cancelada",
      };

      message.error(mensajes[error] || "No se pudo guardar el medio de pago");
    }
  }, [searchParams]);

  useEffect(() => {
    const cargarSolicitudesUsuario = async () => {
      if (!token || !estaLogueado || seccionActiva !== "solicitudes") {
        return;
      }

      try {
        setCargandoSolicitudes(true);

        const data = await obtenerMisSolicitudes(token, paginaSolicitudes, 10);

        setSolicitudes(data.solicitudes || []);

        setPaginacionSolicitudes(
          data.paginacion || {
            pagina: paginaSolicitudes,
            limite: 10,
            total: 0,
            totalPaginas: 1,
          },
        );
      } catch (error) {
        message.error(error.message || "No se pudieron cargar tus solicitudes");
      } finally {
        setCargandoSolicitudes(false);
      }
    };

    cargarSolicitudesUsuario();
  }, [
    token,
    estaLogueado,
    seccionActiva,
    paginaSolicitudes,
    recargarSolicitudes,
  ]);

  const abrirDetalleSolicitud = async (id) => {
    try {
      setModalSolicitud(true);
      setSolicitudSeleccionada(null);
      setRespuestaSolicitud("");
      setCargandoDetalleSolicitud(true);

      const solicitud = await obtenerMiSolicitudPorId(token, id);

      setSolicitudSeleccionada(solicitud);
    } catch (error) {
      message.error(error.message || "No se pudo abrir la solicitud");

      setModalSolicitud(false);
    } finally {
      setCargandoDetalleSolicitud(false);
    }
  };

  const cerrarDetalleSolicitud = () => {
    setModalSolicitud(false);
    setSolicitudSeleccionada(null);
    setRespuestaSolicitud("");
  };

  const enviarRespuestaSolicitud = async () => {
    const mensajeLimpio = respuestaSolicitud.trim();

    if (!solicitudSeleccionada) {
      return;
    }

    if (!mensajeLimpio) {
      message.warning("Escribe una respuesta");
      return;
    }

    if (mensajeLimpio.length > 5000) {
      message.warning("La respuesta no puede superar los 5000 caracteres");
      return;
    }

    try {
      setEnviandoRespuestaSolicitud(true);

      const data = await responderMiSolicitud(
        token,
        solicitudSeleccionada.id,
        mensajeLimpio,
      );

      message.success(data.mensaje || "Respuesta enviada correctamente");

      setRespuestaSolicitud("");

      const solicitudActualizada = await obtenerMiSolicitudPorId(
        token,
        solicitudSeleccionada.id,
      );

      setSolicitudSeleccionada(solicitudActualizada);

      setRecargarSolicitudes((prev) => prev + 1);
    } catch (error) {
      message.error(error.message || "No se pudo enviar la respuesta");
    } finally {
      setEnviandoRespuestaSolicitud(false);
    }
  };

  const cerrarSesion = () => {
    logout();
    message.success("Sesión cerrada");
    navigate("/");
  };

  const abrirModalCelular = () => {
    const celularActual = usuario.telefono
      ? usuario.telefono.replace("+56", "")
      : "";

    setCelularEditar(celularActual);
    setModalCelular(true);
  };

  const guardarCelular = async () => {
    const celularLimpio = celularEditar.trim().replace(/\s+/g, "");

    if (!/^9\d{8}$/.test(celularLimpio)) {
      message.warning("Ingresa un celular válido. Ejemplo: 912345678");
      return;
    }

    try {
      setCargandoCelular(true);

      await actualizarUsuario({
        telefono: celularLimpio,
      });

      message.success("Celular actualizado correctamente");
      setModalCelular(false);
    } catch (error) {
      message.error(error.message || "No se pudo actualizar el celular");
    } finally {
      setCargandoCelular(false);
    }
  };

  const abrirModalPassword = () => {
    setFormPassword({
      passwordActual: "",
      nuevaPassword: "",
      confirmarPassword: "",
    });

    setModalPassword(true);
  };

  const guardarPassword = async () => {
    if (
      !formPassword.passwordActual.trim() ||
      !formPassword.nuevaPassword.trim() ||
      !formPassword.confirmarPassword.trim()
    ) {
      message.warning("Completa todos los campos");
      return;
    }

    if (formPassword.nuevaPassword.length < 6) {
      message.warning("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (formPassword.nuevaPassword !== formPassword.confirmarPassword) {
      message.warning("Las contraseñas nuevas no coinciden");
      return;
    }

    try {
      setCargandoPassword(true);

      await cambiarPasswordUsuario(token, formPassword);

      message.success("Contraseña actualizada correctamente");
      setModalPassword(false);

      setFormPassword({
        passwordActual: "",
        nuevaPassword: "",
        confirmarPassword: "",
      });
    } catch (error) {
      message.error(error.message || "No se pudo cambiar la contraseña");
    } finally {
      setCargandoPassword(false);
    }
  };

  const agregarDireccion = async () => {
    if (
      !nuevaDireccion.region.trim() ||
      !nuevaDireccion.comuna.trim() ||
      !nuevaDireccion.calle.trim() ||
      !nuevaDireccion.numero.trim()
    ) {
      message.warning("Completa región, comuna, calle y número");
      return;
    }
    if (nuevaDireccion.comuna.trim().length < 3) {
      message.warning("La comuna debe tener al menos 3 caracteres");
      return;
    }

    if (nuevaDireccion.calle.trim().length < 3) {
      message.warning("La calle debe tener al menos 3 caracteres");
      return;
    }

    if (!/^[0-9]+[a-zA-Z0-9-]*$/.test(nuevaDireccion.numero.trim())) {
      message.warning("Ingresa un número de dirección válido");
      return;
    }

    try {
      const direccionCreada = await crearDireccion(token, {
        nombre: "Dirección",
        region: nuevaDireccion.region,
        comuna: nuevaDireccion.comuna,
        calle: nuevaDireccion.calle.trim(),
        numero: nuevaDireccion.numero.trim(),
        departamento: nuevaDireccion.departamento.trim(),
        telefono: usuario.telefono || "",
        principal: nuevaDireccion.principal || direcciones.length === 0,
      });

      setDirecciones((prev) => {
        if (direccionCreada.principal) {
          return [
            direccionCreada,
            ...prev.map((item) => ({
              ...item,
              principal: false,
            })),
          ];
        }

        return [direccionCreada, ...prev];
      });

      setNuevaDireccion({
        region: "",
        comuna: "",
        calle: "",
        numero: "",
        departamento: "",
        principal: false,
      });

      setModalDireccion(false);
      message.success("Dirección agregada");
    } catch (error) {
      message.error(error.message || "No se pudo agregar la dirección");
    }
  };

  const eliminarDireccion = async (id) => {
    try {
      await eliminarDireccionUsuario(token, id);

      setDirecciones((prev) => prev.filter((item) => item.id !== id));
      message.success("Dirección eliminada");
    } catch (error) {
      message.error(error.message || "No se pudo eliminar la dirección");
    }
  };

  const guardarComoPrincipal = async (id) => {
    try {
      const direccionActualizada = await marcarDireccionPrincipal(token, id);

      setDirecciones((prev) =>
        prev.map((item) => ({
          ...item,
          principal: item.id === direccionActualizada.id,
        })),
      );

      message.success("Dirección principal actualizada");
    } catch (error) {
      message.error(
        error.message || "No se pudo actualizar la dirección principal",
      );
    }
  };

  const quitarFavorito = async (productoId) => {
    try {
      await eliminarFavoritoUsuario(token, productoId);

      setFavoritos((prev) =>
        prev.filter((favorito) => favorito.productoId !== productoId),
      );

      message.success("Producto eliminado de favoritos");
    } catch (error) {
      message.error(error.message || "No se pudo eliminar el favorito");
    }
  };

  const redirigirAOneclick = ({ urlWebpay, token }) => {
    const form = document.createElement("form");

    form.method = "POST";
    form.action = urlWebpay;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "TBK_TOKEN";
    input.value = token;

    form.appendChild(input);
    document.body.appendChild(form);

    form.submit();
  };

  const agregarMedioPago = async () => {
    try {
      setAgregandoMedioPago(true);

      const data = await iniciarInscripcionMedioPago(token);

      redirigirAOneclick({
        urlWebpay: data.urlWebpay,
        token: data.token,
      });
    } catch (error) {
      message.error(error.message || "No se pudo iniciar la inscripción");
    } finally {
      setAgregandoMedioPago(false);
    }
  };

  const quitarMedioPago = async (id) => {
    try {
      await eliminarMedioPago(token, id);

      setMediosPago((prev) => prev.filter((item) => item.id !== id));
      message.success("Medio de pago eliminado");
    } catch (error) {
      message.error(error.message || "No se pudo eliminar el medio de pago");
    }
  };

  if (cargandoAuth) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Cargando tu cuenta...
          </h1>

          <p className="text-gray-600 mt-2">Estamos validando tu sesión.</p>
        </main>

        <Footer />
      </div>
    );
  }

  if (!estaLogueado || !usuario) {
    return null;
  }

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
                    <p className="font-bold text-gray-900">
                      Nombre y apellidos
                    </p>

                    <p className="text-gray-600 mt-1">{usuario.nombre}</p>
                  </div>

                  <div className="border-b border-gray-200 pb-5 mb-5">
                    <p className="font-bold text-gray-900">RUN/RUT</p>
                    <p className="text-gray-600 mt-1">
                      {usuario.rut || "No registrado"}
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-5 mb-5">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">Celular</p>
                        <p className="text-gray-600 mt-1">
                          {usuario.telefono || "No registrado"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={abrirModalCelular}
                        className="text-sm font-bold underline"
                      >
                        Editar
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-gray-900">Correo</p>
                    <p className="text-gray-600 mt-1">{usuario.email}</p>
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
                  {cargandoDirecciones && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-gray-600">
                      Cargando direcciones...
                    </div>
                  )}

                  {!cargandoDirecciones && direcciones.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
                      <h3 className="text-xl font-black text-gray-900">
                        No tienes direcciones guardadas
                      </h3>

                      <p className="text-gray-600 mt-2">
                        Agrega una dirección para usarla después en el checkout.
                      </p>
                    </div>
                  )}

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

                {cargandoPedidos && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center text-gray-600">
                    Cargando pedidos...
                  </div>
                )}

                {!cargandoPedidos && pedidos.length === 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                    <ShoppingOutlined className="text-4xl text-gray-400 mb-4" />

                    <h3 className="text-xl font-black text-gray-900">
                      No tienes pedidos realizados
                    </h3>

                    <p className="text-gray-600 mt-2">
                      Cuando finalices una compra, aparecerá aquí el historial
                      de tus pedidos.
                    </p>

                    <Link to="/productos">
                      <Button
                        size="large"
                        className="!mt-5 !rounded-xl !font-bold"
                      >
                        Ver productos
                      </Button>
                    </Link>
                  </div>
                )}

                {!cargandoPedidos && pedidos.length > 0 && (
                  <div className="space-y-5">
                    {pedidos.map((pedido) => {
                      const fechaPedido = new Date(
                        pedido.createdAt,
                      ).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });

                      return (
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
                                    Realizado el {fechaPedido}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3 mt-4">
                                <span
                                  className={`text-xs font-bold px-3 py-1 rounded-full ${claseEstadoPedido(
                                    pedido.estado,
                                  )}`}
                                >
                                  {formatearEstadoPedido(pedido.estado)}
                                </span>

                                <span
                                  className={`text-xs font-bold px-3 py-1 rounded-full ${claseEstadoPago(
                                    pedido.estadoPago,
                                  )}`}
                                >
                                  {formatearEstadoPago(pedido.estadoPago)}
                                </span>

                                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                  {pedido.items?.length || 0} producto
                                  {(pedido.items?.length || 0) !== 1 ? "s" : ""}
                                </span>

                                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                  {pedido.tipoEntrega === "despacho"
                                    ? "Despacho a domicilio"
                                    : "Retiro en tienda"}
                                </span>
                              </div>
                            </div>

                            <div className="md:text-right">
                              <p className="text-sm text-gray-500">Total</p>

                              <p className="text-2xl font-black text-gray-950">
                                {formatearPrecio(pedido.total)}
                              </p>

                              <Link
                                to={`/seguimiento-compra?pedidoId=${pedido.id}`}
                              >
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
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {seccionActiva === "solicitudes" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Mis solicitudes
                    </h2>

                    <p className="text-gray-600 mt-1">
                      Revisa tus consultas y las respuestas del equipo de
                      soporte.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="large"
                      icon={<ReloadOutlined />}
                      loading={cargandoSolicitudes}
                      onClick={() => setRecargarSolicitudes((prev) => prev + 1)}
                      className="!h-12 !rounded-2xl !font-bold"
                    >
                      Actualizar
                    </Button>

                    <Link to="/contacto">
                      <Button
                        size="large"
                        type="primary"
                        icon={<PlusOutlined />}
                        className="!h-12 !rounded-2xl !bg-gray-950 !border-gray-950 !font-bold hover:!bg-black"
                      >
                        Nueva solicitud
                      </Button>
                    </Link>
                  </div>
                </div>

                {cargandoSolicitudes && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center text-gray-600">
                    Cargando solicitudes...
                  </div>
                )}

                {!cargandoSolicitudes && solicitudes.length === 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                    <CustomerServiceOutlined className="text-4xl text-gray-400 mb-4" />

                    <h3 className="text-xl font-black text-gray-900">
                      No tienes solicitudes asociadas
                    </h3>

                    <p className="text-gray-600 mt-2 max-w-xl">
                      Las consultas que envíes mientras tengas tu sesión
                      iniciada aparecerán en esta sección.
                    </p>

                    <Link to="/contacto">
                      <Button
                        size="large"
                        className="!mt-5 !rounded-xl !font-bold"
                      >
                        Contactar a soporte
                      </Button>
                    </Link>
                  </div>
                )}

                {!cargandoSolicitudes && solicitudes.length > 0 && (
                  <>
                    <div className="space-y-5">
                      {solicitudes.map((solicitud) => (
                        <article
                          key={solicitud.id}
                          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <CustomerServiceOutlined className="text-2xl text-gray-900" />

                                <p className="font-black text-gray-900 break-all">
                                  {solicitud.codigo}
                                </p>

                                <span
                                  className={`text-xs font-bold px-3 py-1 rounded-full ${claseEstadoSoporte(
                                    solicitud.estado,
                                  )}`}
                                >
                                  {formatearEstadoSoporte(solicitud.estado)}
                                </span>
                              </div>

                              <h3 className="text-xl font-black text-gray-900 mt-4">
                                {solicitud.asunto}
                              </h3>

                              <div className="flex flex-wrap gap-3 mt-3">
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                  {formatearCategoriaSoporte(
                                    solicitud.categoria,
                                  )}
                                </span>

                                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                  <MessageOutlined className="mr-1" />
                                  {solicitud.cantidadRespuestas || 0} respuesta
                                  {(solicitud.cantidadRespuestas || 0) !== 1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>

                              <p className="text-sm text-gray-500 mt-4">
                                <ClockCircleOutlined className="mr-2" />
                                Creada el{" "}
                                {formatearFechaSoporte(solicitud.createdAt)}
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Última actualización:{" "}
                                {formatearFechaSoporte(solicitud.updatedAt)}
                              </p>
                            </div>

                            <Button
                              size="large"
                              onClick={() =>
                                abrirDetalleSolicitud(solicitud.id)
                              }
                              className="!rounded-xl !font-bold"
                            >
                              Ver solicitud
                            </Button>
                          </div>
                        </article>
                      ))}
                    </div>

                    {paginacionSolicitudes.total > 10 && (
                      <div className="flex justify-center mt-8">
                        <Pagination
                          current={paginaSolicitudes}
                          pageSize={10}
                          total={paginacionSolicitudes.total}
                          showSizeChanger={false}
                          onChange={(pagina) => setPaginaSolicitudes(pagina)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {seccionActiva === "pagos" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Medios de pago
                    </h2>

                    <p className="text-gray-600 mt-1">
                      Guarda tarjetas de forma segura mediante Transbank
                      Oneclick.
                    </p>
                  </div>

                  <Button
                    size="large"
                    icon={<PlusOutlined />}
                    loading={agregandoMedioPago}
                    onClick={agregarMedioPago}
                    className="!h-12 !rounded-2xl !font-bold"
                  >
                    Agregar tarjeta
                  </Button>
                </div>

                {cargandoMediosPago && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center text-gray-600">
                    Cargando medios de pago...
                  </div>
                )}

                {!cargandoMediosPago && mediosPago.length === 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                    <CreditCardOutlined className="text-4xl text-gray-400 mb-4" />

                    <h3 className="text-xl font-black text-gray-900">
                      No tienes medios de pago guardados
                    </h3>

                    <p className="text-gray-600 mt-2">
                      Agrega una tarjeta de forma segura. Econnet no almacena el
                      número completo ni el CVV de tu tarjeta.
                    </p>

                    <Button
                      size="large"
                      icon={<PlusOutlined />}
                      loading={agregandoMedioPago}
                      onClick={agregarMedioPago}
                      className="!mt-5 !h-12 !rounded-2xl !font-bold"
                    >
                      Agregar tarjeta
                    </Button>
                  </div>
                )}

                {!cargandoMediosPago && mediosPago.length > 0 && (
                  <div className="space-y-5">
                    {mediosPago.map((medio) => (
                      <article
                        key={medio.id}
                        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <CreditCardOutlined className="text-2xl text-gray-700" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-black text-gray-900">
                                {medio.tipoTarjeta || "Tarjeta"}
                                {medio.ultimos4
                                  ? ` terminada en ${medio.ultimos4}`
                                  : ""}
                              </h3>

                              {medio.principal && (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                                  Principal
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                              Guardada con Transbank Oneclick
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => quitarMedioPago(medio.id)}
                          className="text-sm font-bold text-red-600 underline"
                        >
                          Eliminar
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {seccionActiva === "listas" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Mis listas
                  </h2>

                  <Link to="/productos">
                    <Button
                      size="large"
                      className="!h-12 !rounded-2xl !font-bold"
                    >
                      Explorar productos
                    </Button>
                  </Link>
                </div>

                {cargandoFavoritos && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center text-gray-600">
                    Cargando favoritos...
                  </div>
                )}

                {!cargandoFavoritos && favoritos.length === 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 max-w-xl">
                    <div className="h-52 bg-gray-100 rounded-xl flex items-center justify-center">
                      <HeartOutlined className="text-6xl text-gray-300" />
                    </div>

                    <div className="mt-5">
                      <h3 className="text-xl font-black text-gray-900">
                        Mis favoritos
                      </h3>

                      <p className="text-gray-600 mt-2">
                        Aún no tienes productos guardados. Explora el catálogo y
                        agrega productos a tu lista.
                      </p>

                      <Link to="/productos">
                        <Button
                          size="large"
                          className="!mt-5 !rounded-xl !font-bold"
                        >
                          Ver productos
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {!cargandoFavoritos && favoritos.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {favoritos.map((favorito) => {
                      const producto = favorito.producto;

                      if (!producto) {
                        return null;
                      }

                      const imagenPrincipal =
                        producto.imagenes?.find(
                          (imagen) => imagen.esPrincipal,
                        ) ||
                        producto.imagenes?.find(
                          (imagen) => imagen.tipo !== "oferta_wide",
                        ) ||
                        producto.imagenes?.[0];

                      const precioProducto = producto.precio || 0;

                      return (
                        <article
                          key={favorito.id}
                          className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                        >
                          <Link to={`/producto/${producto.id}`}>
                            <div className="h-48 bg-gray-100 flex items-center justify-center p-5">
                              <img
                                src={
                                  imagenPrincipal?.url ||
                                  "/img/productos/producto.png"
                                }
                                alt={producto.nombre || "Producto favorito"}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/img/productos/producto.png";
                                }}
                              />
                            </div>
                          </Link>

                          <div className="p-5">
                            <p className="text-xs font-bold text-emerald-600 uppercase">
                              {producto.marca?.nombre || "Econnet"}
                            </p>

                            <Link to={`/producto/${producto.id}`}>
                              <h3 className="text-lg font-black text-gray-900 mt-1 hover:underline">
                                {producto.nombre || "Producto sin nombre"}
                              </h3>
                            </Link>

                            <p className="text-sm text-gray-500 mt-1">
                              {producto.categoria?.nombre || "Sin categoría"}
                            </p>

                            <p className="text-2xl font-black text-gray-950 mt-4">
                              {formatearPrecio(precioProducto)}
                            </p>

                            <div className="flex gap-3 mt-5">
                              <Link
                                to={`/producto/${producto.id}`}
                                className="flex-1"
                              >
                                <Button
                                  block
                                  size="large"
                                  className="!rounded-xl !font-bold"
                                >
                                  Ver producto
                                </Button>
                              </Link>

                              <Button
                                size="large"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => quitarFavorito(producto.id)}
                                className="!rounded-xl !font-bold"
                              />
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
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

                    <button
                      type="button"
                      onClick={abrirModalPassword}
                      className="text-sm font-bold underline"
                    >
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
        open={modalSolicitud}
        onCancel={cerrarDetalleSolicitud}
        footer={null}
        width={850}
        centered
        destroyOnHidden
        title="Detalle de la solicitud"
      >
        {cargandoDetalleSolicitud && (
          <div className="py-12 text-center text-gray-600">
            Cargando solicitud...
          </div>
        )}

        {!cargandoDetalleSolicitud && solicitudSeleccionada && (
          <div className="space-y-6 pt-3">
            {solicitudSeleccionada.pedido && (
              <div className="border border-blue-200 bg-blue-50 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <ShoppingOutlined className="text-2xl text-blue-700" />

                      <div>
                        <p className="text-sm font-bold text-blue-700">
                          Pedido relacionado
                        </p>

                        <h3 className="text-lg font-black text-gray-900">
                          {solicitudSeleccionada.pedido.numero}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${claseEstadoPedido(
                          solicitudSeleccionada.pedido.estado,
                        )}`}
                      >
                        {formatearEstadoPedido(
                          solicitudSeleccionada.pedido.estado,
                        )}
                      </span>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${claseEstadoPago(
                          solicitudSeleccionada.pedido.estadoPago,
                        )}`}
                      >
                        {formatearEstadoPago(
                          solicitudSeleccionada.pedido.estadoPago,
                        )}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                      Compra realizada el{" "}
                      {formatearFechaSoporte(
                        solicitudSeleccionada.pedido.createdAt,
                      )}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <p className="text-sm text-gray-500">Total</p>

                    <p className="text-2xl font-black text-gray-950">
                      {formatearPrecio(solicitudSeleccionada.pedido.total)}
                    </p>

                    <Button
                      size="large"
                      onClick={() => {
                        const pedidoId = solicitudSeleccionada.pedido.id;

                        cerrarDetalleSolicitud();

                        navigate(`/seguimiento-compra?pedidoId=${pedidoId}`);
                      }}
                      className="!mt-4 !rounded-xl !font-bold"
                    >
                      Ver seguimiento del pedido
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-black text-gray-900 mb-3">
                Consulta original
              </h3>

              <div className="border border-gray-200 bg-gray-50 rounded-2xl p-5 whitespace-pre-wrap break-words">
                {solicitudSeleccionada.mensaje}
              </div>
            </div>

            <div>
              <h3 className="font-black text-gray-900 mb-3">
                Historial de respuestas
              </h3>

              {solicitudSeleccionada.respuestas?.length === 0 && (
                <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center text-gray-500">
                  Esta solicitud todavía no tiene respuestas.
                </div>
              )}

              <div className="space-y-4">
                {solicitudSeleccionada.respuestas?.map((respuesta) => {
                  const esCliente = respuesta.tipoAutor === "cliente";

                  return (
                    <div
                      key={respuesta.id}
                      className={`rounded-2xl border p-5 ${
                        esCliente
                          ? "border-gray-300 bg-gray-50"
                          : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-white">
                            {esCliente ? "Tú" : "Soporte Econnet"}
                          </span>

                          <span className="text-sm font-bold text-gray-800">
                            {respuesta.autor?.nombre ||
                              (esCliente ? usuario.nombre : "Administrador")}
                          </span>
                        </div>

                        <span className="text-xs text-gray-500">
                          {formatearFechaSoporte(respuesta.createdAt)}
                        </span>
                      </div>

                      <p className="text-gray-800 mt-4 whitespace-pre-wrap break-words">
                        {respuesta.mensaje}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {solicitudSeleccionada.estado === "cerrado" ? (
              <div className="rounded-2xl border border-gray-300 bg-gray-100 p-5">
                <p className="font-black text-gray-900">
                  Esta solicitud está cerrada
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  No puedes agregar nuevas respuestas mientras permanezca
                  cerrada.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-black text-gray-900 mb-3">
                  Agregar respuesta
                </h3>

                <Input.TextArea
                  rows={5}
                  maxLength={5000}
                  showCount
                  placeholder="Escribe aquí tu respuesta..."
                  value={respuestaSolicitud}
                  onChange={(e) => setRespuestaSolicitud(e.target.value)}
                  className="!rounded-xl"
                />

                <div className="flex justify-end gap-3 mt-5">
                  <Button
                    size="large"
                    onClick={cerrarDetalleSolicitud}
                    className="!rounded-xl !font-bold"
                  >
                    Cerrar
                  </Button>

                  <Button
                    size="large"
                    type="primary"
                    icon={<SendOutlined />}
                    loading={enviandoRespuestaSolicitud}
                    disabled={enviandoRespuestaSolicitud}
                    onClick={enviarRespuestaSolicitud}
                    className="!bg-gray-950 !border-gray-950 !font-bold hover:!bg-black !rounded-xl"
                  >
                    Enviar respuesta
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={modalDireccion}
        onCancel={() => setModalDireccion(false)}
        footer={null}
        centered
        title="Agregar dirección"
      >
        <div className="space-y-4 pt-3">
          <div>
            <label className="text-sm font-bold text-gray-800">Región</label>

            <Select
              size="large"
              placeholder="Selecciona una región..."
              value={nuevaDireccion.region || undefined}
              options={opcionesRegiones}
              onChange={(value) =>
                setNuevaDireccion((prev) => ({
                  ...prev,
                  region: value,
                  comuna: "",
                }))
              }
              className="!mt-2 w-full"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800">Comuna</label>

            <Input
              size="large"
              placeholder={
                nuevaDireccion.region
                  ? "Ej: Ñuñoa, Viña del Mar, Coyhaique..."
                  : "Primero selecciona una región"
              }
              value={nuevaDireccion.comuna}
              disabled={!nuevaDireccion.region}
              onChange={(e) =>
                setNuevaDireccion((prev) => ({
                  ...prev,
                  comuna: e.target.value,
                }))
              }
              className="!mt-2 !rounded-xl"
            />

            <p className="text-xs text-gray-500 mt-1">
              Escribe la comuna tal como corresponde a tu dirección.
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800">Calle</label>

            <Input
              size="large"
              placeholder="Ej: Calle Cardenal Fresno"
              value={nuevaDireccion.calle}
              onChange={(e) =>
                setNuevaDireccion((prev) => ({
                  ...prev,
                  calle: e.target.value,
                }))
              }
              className="!mt-2 !rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800">Número</label>

            <Input
              size="large"
              placeholder="Ej: 1632"
              value={nuevaDireccion.numero}
              onChange={(e) =>
                setNuevaDireccion((prev) => ({
                  ...prev,
                  numero: e.target.value,
                }))
              }
              className="!mt-2 !rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800">
              Departamento, casa u oficina
            </label>

            <Input
              size="large"
              placeholder="Ej: Depto. 101, casa 3"
              value={nuevaDireccion.departamento}
              onChange={(e) =>
                setNuevaDireccion((prev) => ({
                  ...prev,
                  departamento: e.target.value,
                }))
              }
              className="!mt-2 !rounded-xl"
            />

            <p className="text-xs text-gray-500 mt-1">Opcional</p>
          </div>

          <Checkbox
            checked={nuevaDireccion.principal}
            onChange={(e) =>
              setNuevaDireccion((prev) => ({
                ...prev,
                principal: e.target.checked,
              }))
            }
          >
            Guardar como dirección principal
          </Checkbox>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              size="large"
              onClick={() => setModalDireccion(false)}
              className="!rounded-xl !font-bold"
            >
              Cancelar
            </Button>

            <Button
              size="large"
              type="primary"
              onClick={agregarDireccion}
              className="!bg-gray-950 !border-gray-950 !font-bold hover:!bg-black !rounded-xl"
            >
              Guardar dirección
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={modalCelular}
        onCancel={() => setModalCelular(false)}
        footer={null}
        centered
        title="Editar celular"
      >
        <div className="space-y-4 pt-3">
          <div>
            <label className="text-sm font-bold text-gray-800">
              Nuevo celular
            </label>

            <Input
              size="large"
              addonBefore="+56"
              placeholder="912345678"
              value={celularEditar}
              onChange={(e) => setCelularEditar(e.target.value)}
              className="!mt-2 !rounded-xl"
            />

            <p className="text-xs text-gray-500 mt-2">
              Ingresa tu número sin espacios y sin +56.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              size="large"
              onClick={() => setModalCelular(false)}
              className="!rounded-xl !font-bold"
            >
              Cancelar
            </Button>

            <Button
              size="large"
              type="primary"
              loading={cargandoCelular}
              onClick={guardarCelular}
              className="!bg-gray-950 !border-gray-950 !font-bold hover:!bg-black !rounded-xl"
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={modalPassword}
        onCancel={() => setModalPassword(false)}
        footer={null}
        centered
        title="Cambiar contraseña"
      >
        <div className="space-y-4 pt-3">
          <div>
            <label className="text-sm font-bold text-gray-800">
              Contraseña actual
            </label>

            <Input.Password
              size="large"
              placeholder="Ingresa tu contraseña actual"
              value={formPassword.passwordActual}
              onChange={(e) =>
                setFormPassword((prev) => ({
                  ...prev,
                  passwordActual: e.target.value,
                }))
              }
              className="!mt-2 !rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800">
              Nueva contraseña
            </label>

            <Input.Password
              size="large"
              placeholder="Ingresa tu nueva contraseña"
              value={formPassword.nuevaPassword}
              onChange={(e) =>
                setFormPassword((prev) => ({
                  ...prev,
                  nuevaPassword: e.target.value,
                }))
              }
              className="!mt-2 !rounded-xl"
            />

            <p className="text-xs text-gray-500 mt-2">
              Debe tener al menos 6 caracteres.
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800">
              Confirmar nueva contraseña
            </label>

            <Input.Password
              size="large"
              placeholder="Repite tu nueva contraseña"
              value={formPassword.confirmarPassword}
              onChange={(e) =>
                setFormPassword((prev) => ({
                  ...prev,
                  confirmarPassword: e.target.value,
                }))
              }
              className="!mt-2 !rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              size="large"
              onClick={() => setModalPassword(false)}
              className="!rounded-xl !font-bold"
            >
              Cancelar
            </Button>

            <Button
              size="large"
              type="primary"
              loading={cargandoPassword}
              onClick={guardarPassword}
              className="!bg-gray-950 !border-gray-950 !font-bold hover:!bg-black !rounded-xl"
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MiCuenta;
