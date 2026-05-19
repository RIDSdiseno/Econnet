import { Button, Card, Input, Badge } from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import BannerCarousel from "./components/BannerCarousel";

const productos = [
  {
    id: 1,
    nombre: "Notebook Lenovo IdeaPad",
    categoria: "Notebook",
    precio: "$599.990",
    imagen: "https://placehold.co/600x400?text=Notebook",
  },
  {
    id: 2,
    nombre: "Mouse Logitech Inalámbrico",
    categoria: "Accesorios",
    precio: "$29.990",
    imagen: "https://placehold.co/600x400?text=Mouse",
  },
  {
    id: 3,
    nombre: 'Monitor Samsung 27"',
    categoria: "Monitor",
    precio: "$189.990",
    imagen: "https://placehold.co/600x400?text=Monitor",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <BannerCarousel />
      <main className="px-8 py-10">
        <section className="bg-white rounded-2xl shadow-sm p-8 mb-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
              Nueva experiencia ecommerce
            </p>

            <h2 className="text-4xl font-bold mb-4">
              Productos tecnológicos con diseño moderno
            </h2>

            <p className="text-gray-600 mb-6">
              Explora notebooks, monitores, periféricos.
            </p>

            <Button type="primary" size="large">
              Ver productos
            </Button>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-semibold mb-2">Oferta destacada</h3>

            <p className="text-gray-300 mb-6">
              Descuentos especiales en accesorios seleccionados.
            </p>

            <Button>Revisar oferta</Button>
          </div>
        </section>

        <section className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Productos destacados</h2>
            <p className="text-gray-500">
              Primer diseño base para comenzar el frontend.
            </p>
          </div>

          <Input
            size="large"
            placeholder="Buscar productos..."
            prefix={<SearchOutlined />}
            className="md:max-w-sm"
          />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {productos.map((producto) => (
            <Card
              key={producto.id}
              hoverable
              className="rounded-xl overflow-hidden"
              styles={{
                body: {
                  padding: "14px",
                },
              }}
              cover={
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="h-40 w-full object-contain bg-gray-100 p-4"
                />
              }
            >
              <p className="text-[11px] uppercase text-gray-500 mb-1">
                {producto.categoria}
              </p>

              <h3 className="text-sm font-semibold mb-2 line-clamp-2 min-h-[40px]">
                {producto.nombre}
              </h3>

              <p className="text-lg font-bold mb-3">{producto.precio}</p>

              <Button type="primary" size="middle" block>
                Agregar
              </Button>
            </Card>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
