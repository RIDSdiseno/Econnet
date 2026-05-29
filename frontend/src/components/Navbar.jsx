import { Input, Badge, Dropdown } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const categoriasRapidas = [
  {
    key: "1",
    label: (
      <Link to={`/productos?categoria=${encodeURIComponent("Monitores")}`}>
        Monitores
      </Link>
    ),
  },
  {
    key: "2",
    label: (
      <Link to={`/productos?categoria=${encodeURIComponent("AIO")}`}>AIO</Link>
    ),
  },
  {
    key: "3",
    label: (
      <Link to={`/productos?categoria=${encodeURIComponent("Notebook")}`}>
        Notebook
      </Link>
    ),
  },
  {
    key: "4",
    label: (
      <Link
        to={`/productos?categoria=${encodeURIComponent(
          "Cámara de seguridad"
        )}`}
      >
        Cámaras de seguridad
      </Link>
    ),
  },
  {
    key: "5",
    label: (
      <Link to={`/productos?categoria=${encodeURIComponent("Almacenamiento")}`}>
        Almacenamiento
      </Link>
    ),
  },
];

function Navbar() {
  const navigate = useNavigate();
  const { usuario, estaLogueado, logout, cargandoAuth } = useAuth();

  const primerNombre = usuario?.nombre?.split(" ")[0] || "Usuario";

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  const menuUsuario = [
    {
      key: "mi-cuenta",
      label: <Link to="/mi-cuenta">Mi cuenta</Link>,
    },
    {
      key: "pedidos",
      label: <Link to="/mi-cuenta">Mis pedidos</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      danger: true,
      label: (
        <button
          type="button"
          onClick={cerrarSesion}
          className="w-full text-left flex items-center gap-2"
        >
          <LogoutOutlined />
          Cerrar sesión
        </button>
      ),
    },
  ];

  return (
    <header className="w-full">
      {/* Barra superior */}
      <Link
        to="/productos"
        className="block bg-gray-800 text-white text-center text-sm py-2 px-4 hover:bg-gray-700 transition"
      >
        Aprovecha ofertas especiales en productos tecnológicos seleccionados
      </Link>

      {/* Header principal */}
      <div className="bg-black text-white px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="min-w-fit flex items-center">
            <img
              src="/img/logo.png"
              alt="Logo Econnet"
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Buscador */}
          <div className="flex-1 hidden md:block">
            <Input
              size="large"
              placeholder="Buscar productos, marcas y categorías..."
              prefix={<SearchOutlined className="text-gray-500" />}
              className="!h-12 !rounded-xl"
            />
          </div>

          {/* Menú rápido */}
          <Dropdown
            menu={{ items: categoriasRapidas }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl border border-gray-500 bg-white/10 hover:bg-white/20 transition">
              <MenuOutlined className="text-xl text-white" />
            </button>
          </Dropdown>

          {/* Usuario */}
          {cargandoAuth ? (
            <div className="hidden md:flex items-center gap-3 border-l border-gray-600 pl-6">
              <UserOutlined className="text-3xl text-white" />

              <div className="leading-tight">
                <span className="text-sm font-semibold text-white">
                  Cargando...
                </span>
              </div>
            </div>
          ) : estaLogueado ? (
            <Dropdown
              menu={{ items: menuUsuario }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button className="hidden md:flex items-center gap-3 border-l border-gray-600 pl-6 hover:text-gray-300 transition">
                <UserOutlined className="text-3xl text-white" />

                <div className="leading-tight text-left">
                  <span className="block text-xs text-gray-300">Hola,</span>
                  <span className="text-sm font-semibold text-white">
                    {primerNombre}
                  </span>
                </div>
              </button>
            </Dropdown>
          ) : (
            <div className="hidden md:flex items-center gap-3 border-l border-gray-600 pl-6">
              <UserOutlined className="text-3xl text-white" />

              <div className="leading-tight">
                <Link
                  to="/login"
                  className="block text-sm font-semibold text-white hover:text-gray-300"
                >
                  Inicia sesión
                </Link>

                <Link
                  to="/registro"
                  className="block text-xs text-emerald-300 hover:text-emerald-200"
                >
                  Regístrate
                </Link>
              </div>
            </div>
          )}

          {/* Carrito */}
          <Link
            to="/carrito"
            className="relative flex items-center justify-center w-12 h-12 rounded-xl border border-gray-500 bg-white/10 hover:bg-white/20 transition"
          >
            <Badge count={2} size="small">
              <ShoppingCartOutlined className="text-2xl !text-white" />
            </Badge>
          </Link>
        </div>

        {/* Buscador móvil */}
        <div className="md:hidden mt-5">
          <Input
            size="large"
            placeholder="Buscar productos..."
            prefix={<SearchOutlined className="text-gray-500" />}
            className="!h-12 !rounded-xl"
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;