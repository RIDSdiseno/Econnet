import { Input, Badge, Dropdown } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DownOutlined,
  MenuOutlined,
} from "@ant-design/icons";

const categoriasRapidas = [
  {
    key: "1",
    label: "Monitores",
  },
  {
    key: "2",
    label: "AIO",
  },
  {
    key: "3",
    label: "NoteBook",
  },
  {
    key: "4",
    label: "Cámaras de seguridad",
  },
  {
    key: "5",
    label: "Almacenamiento",
  },
];

function Navbar() {
  return (
    <header className="w-full">
      {/* Barra superior */}
      <div className="bg-gray-800 text-white text-center text-sm py-2 px-4">
        Aprovecha ofertas especiales en productos tecnológicos seleccionados
      </div>

      {/* Header principal */}
      <div className="bg-black text-white px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-8">
          {/* Logo */}
          <div className="min-w-fit flex items-center">
            <img
              src="/img/logo.png"
              alt="Logo Ecomer Rids"
              className="h-14 w-auto object-contain"
            />
          </div>

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
          <div className="hidden md:flex items-center gap-3 border-l border-gray-600 pl-6">
            <UserOutlined className="text-3xl text-white" />

            <div className="leading-tight">
              <button className="text-sm font-semibold text-white hover:text-gray-300">
                Inicia sesión
              </button>
            </div>
          </div>

          {/* Carrito */}
          <button className="relative flex items-center justify-center w-12 h-12 rounded-xl border border-gray-500 bg-white/10 hover:bg-white/20 transition">
            <Badge count={2} size="small">
              <ShoppingCartOutlined className="text-2xl !text-white" />
            </Badge>
          </button>
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

      {/* Menú de categorías */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-8 overflow-x-auto text-sm font-semibold text-gray-800">
          <a href="#" className="min-w-fit hover:text-black">
            Monitores <DownOutlined className="text-xs" />
          </a>

          <a href="#" className="min-w-fit hover:text-black">
            AIO <DownOutlined className="text-xs" />
          </a>

          <a href="#" className="min-w-fit hover:text-black">
            NoteBook <DownOutlined className="text-xs" />
          </a>

          <a href="#" className="min-w-fit hover:text-black">
            MacBook <DownOutlined className="text-xs" />
          </a>

          <a href="#" className="min-w-fit hover:text-black">
            Camaras de seguridad <DownOutlined className="text-xs" />
          </a>

          <a href="#" className="min-w-fit hover:text-black">
            Almacenamiento <DownOutlined className="text-xs" />
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
