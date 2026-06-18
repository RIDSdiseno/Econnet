import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TagsOutlined,
  TruckOutlined,
  UserOutlined,
  PictureOutlined,
  HomeOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/pedidos",
      icon: <ShoppingCartOutlined />,
      label: "Pedidos",
    },
    {
      key: "/admin/productos-vendidos",
      icon: <BarChartOutlined />,
      label: "Productos vendidos",
    },
    {
      key: "/admin/productos",
      icon: <AppstoreOutlined />,
      label: "Productos",
    },
    {
      key: "/admin/categorias",
      icon: <TagsOutlined />,
      label: "Categorías",
    },
    {
      key: "/admin/marcas",
      icon: <TagsOutlined />,
      label: "Marcas",
    },
    {
      key: "/admin/tarifas",
      icon: <TruckOutlined />,
      label: "Tarifas despacho",
    },
    {
      key: "/admin/anuncios",
      icon: <PictureOutlined />,
      label: "Anuncios",
    },
    {
      key: "/admin/usuarios",
      icon: <UserOutlined />,
      label: "Usuarios",
    },
    {
      key: "/admin/soporte",
      icon: <CustomerServiceOutlined />,
      label: "Soporte",
    },
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Volver a tienda",
    },
  ];

  const obtenerMenuSeleccionado = () => {
    if (location.pathname.startsWith("/admin/productos-vendidos")) {
      return "/admin/productos-vendidos";
    }

    if (location.pathname.startsWith("/admin/pedidos")) {
      return "/admin/pedidos";
    }

    if (location.pathname.startsWith("/admin/soporte")) {
      return "/admin/soporte";
    }

    return location.pathname;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          minHeight: "100vh",
          background: "#001529",
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-neutral-800">
          <h1 className="text-white font-bold text-lg">Econnet Admin</h1>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[obtenerMenuSeleccionado()]}
          items={menuItems}
          onClick={(item) => navigate(item.key)}
          style={{
            background: "#001529",
          }}
        />
      </Sider>

      <Layout style={{ minHeight: "100vh" }}>
        <Header className="!bg-white shadow-sm flex items-center px-6">
          <h2 className="text-xl font-bold text-gray-900 m-0">
            Panel de administración
          </h2>
        </Header>

        <Content className="p-6 bg-gray-100">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
