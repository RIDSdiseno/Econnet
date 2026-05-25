import { useRef } from "react";
import { Carousel } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const productosDestacados = [
  {
    id: 1,
    marca: "ASUS",
    nombre: "Notebook ASUS ExpertBook P3 Ryzen AI 7, 16GB RAM, 512GB SSD",
    precio: "$1.407.037",
    precioNormal: "$1.607.037",
    descuento: "12%",
    imagen: "/img/destacados/camara.png",
  },
  {
    id: 2,
    marca: "GIGABYTE",
    nombre: 'Monitor Gamer 27" QHD, 240Hz, 0.03ms, Panel OLED',
    precio: "$549.990",
    precioNormal: "$649.990",
    descuento: "15%",
    imagen: "/img/destacados/prueba1.png",
  },
  {
    id: 3,
    marca: "ASUS",
    nombre: "Mouse Gamer inalámbrico ASUS ROG Harpe Ace Aim Lab Edition",
    precio: "$89.990",
    precioNormal: "$109.990",
    descuento: "18%",
    imagen: "/img/destacados/prueba2.png",
  },
  {
    id: 4,
    marca: "KINGSTON",
    nombre: "SSD Kingston NVMe 1TB alta velocidad para notebook y PC",
    precio: "$69.990",
    precioNormal: "$89.990",
    descuento: "22%",
    imagen: "/img/destacados/camara.png",
  },
  {
    id: 5,
    marca: "REDRAGON",
    nombre: "Teclado mecánico RGB switches red para gaming",
    precio: "$44.990",
    precioNormal: "$59.990",
    descuento: "25%",
    imagen: "/img/destacados/prueba.png",
  },
  {
    id: 6,
    marca: "LOGITECH",
    nombre: "Webcam Full HD con micrófono integrado para videollamadas",
    precio: "$39.990",
    precioNormal: "$49.990",
    descuento: "20%",
    imagen: "/img/destacados/prueba3.png",
  },
];

function dividirEnGrupos(lista, cantidad) {
  const grupos = [];

  for (let i = 0; i < lista.length; i += cantidad) {
    grupos.push(lista.slice(i, i + cantidad));
  }

  return grupos;
}

function ProductoCard({ producto }) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden h-full group">
      <Link to={`/producto/${producto.id}`}>
        <div className="h-44 bg-white flex items-center justify-center p-4">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-4 pt-2">
        <h3 className="text-sm font-bold text-gray-900 uppercase line-clamp-1">
          {producto.marca}
        </h3>

        <Link to={`/producto/${producto.id}`}>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-[34px] hover:text-gray-950 transition">
            {producto.nombre}
          </p>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-700 bg-cyan-100 px-2 py-1 rounded">
            {producto.descuento} DCTO.
          </span>

          <span className="text-xs text-gray-400 line-through">
            {producto.precioNormal}
          </span>
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-bold text-gray-950">{producto.precio}</p>

            <p className="text-xs text-gray-500">Precio transferencia</p>
          </div>

          <button className="w-10 h-10 rounded-xl bg-emerald-400 text-gray-950 flex items-center justify-center hover:bg-emerald-300 transition shadow-sm border border-emerald-500">
            <ShoppingCartOutlined className="text-lg" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductosDestacados() {
  const carouselRef = useRef(null);
  const grupos = dividirEnGrupos(productosDestacados, 4);

  return (
    <section className="bg-gray-100 px-8 pt-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Productos destacados
            </h2>

            <div className="h-[2px] flex-1 min-w-20 max-w-40 bg-gray-900"></div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => carouselRef.current?.prev()}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
            >
              <LeftOutlined />
            </button>

            <button
              onClick={() => carouselRef.current?.next()}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
            >
              <RightOutlined />
            </button>
          </div>
        </div>

        <Carousel ref={carouselRef} dots={false} autoplay autoplaySpeed={5000}>
          {grupos.map((grupo, index) => (
            <div key={index}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {grupo.map((producto) => (
                  <ProductoCard key={producto.id} producto={producto} />
                ))}
              </div>
            </div>
          ))}
        </Carousel>

        <div className="relative z-10 flex justify-center mt-8 pb-2">
          <Link to="/productos">
            <button className="bg-black !text-white px-10 py-4 rounded-2xl font-bold text-base hover:bg-gray-800 transition shadow-lg border border-gray-700">
              Ver más productos
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProductosDestacados;
