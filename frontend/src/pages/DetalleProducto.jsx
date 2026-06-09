import { useEffect, useRef, useState } from "react";

import { Link, useParams, useNavigate } from "react-router-dom";
import { Button, Rate, Input, Carousel, message } from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  LeftOutlined,
  RightOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import {
  obtenerProductoPorId,
  obtenerProductos,
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavoritoUsuario,
  agregarProductoCarrito,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

function dividirEnGrupos(lista, cantidad) {
  const grupos = [];

  for (let i = 0; i < lista.length; i += cantidad) {
    grupos.push(lista.slice(i, i + cantidad));
  }

  return grupos;
}

function ProductosRelacionadosCarrusel({
  productoActual,
  productosRelacionados = [],
}) {
  const carouselRef = useRef(null);

  const relacionados = productosRelacionados.filter(
    (producto) => producto.id !== productoActual.id,
  );

  const grupos = dividirEnGrupos(relacionados, 4);

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Productos relacionados
          </h2>

          <div className="h-[2px] flex-1 min-w-20 max-w-40 bg-gray-900"></div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => carouselRef.current?.prev()}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
          >
            <LeftOutlined />
          </button>

          <button
            type="button"
            onClick={() => carouselRef.current?.next()}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-900 hover:text-white transition"
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      <Carousel ref={carouselRef} dots={false} autoplay autoplaySpeed={4500}>
        {grupos.map((grupo, index) => (
          <div key={index}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {grupo.map((producto) => (
                <article
                  key={producto.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group"
                >
                  <Link to={`/producto/${producto.id}`}>
                    <div className="h-40 bg-white flex items-center justify-center p-4">
                      <img
                        src={obtenerImagenPrincipalProducto(producto)}
                        alt={producto.nombre}
                        className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="p-4 pt-2">
                    <p className="text-sm font-black text-gray-900 uppercase">
                      {producto.marca?.nombre || "Sin marca"}
                    </p>

                    <Link to={`/producto/${producto.id}`}>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-[34px] hover:text-gray-900">
                        {producto.nombre}
                      </p>
                    </Link>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-cyan-100 px-2 py-1 rounded">
                        {producto.descuento}% DCTO.
                      </span>

                      <span className="text-xs text-gray-400 line-through">
                        {formatearPrecio(producto.precioNormal)}
                      </span>
                    </div>

                    <p className="text-lg font-black text-gray-950 mt-2">
                      {formatearPrecio(producto.precio)}
                    </p>

                    <Link to={`/producto/${producto.id}`}>
                      <button className="mt-4 w-full h-10 rounded-xl bg-gray-950 text-white text-sm font-bold hover:bg-black transition">
                        Ver producto
                      </button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function obtenerImagenPrincipalProducto(producto) {
  const imagenes =
    producto.imagenes
      ?.filter((img) => img.tipo !== "oferta_wide" && img.tipo !== "banner")
      ?.filter((img) => img.url && img.url.trim() !== "")
      ?.sort((a, b) => {
        if (a.esPrincipal !== b.esPrincipal) {
          return a.esPrincipal ? -1 : 1;
        }

        return (a.orden || 0) - (b.orden || 0);
      }) || [];

  return (
    imagenes.find((img) => img.esPrincipal)?.url ||
    imagenes[0]?.url ||
    "/img/productos/producto.png"
  );
}

function ValoracionesProducto({ producto }) {
  const [valoracion, setValoracion] = useState(0);
  const [comentario, setComentario] = useState("");

  return (
    <section className="mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Valoraciones</h2>

        <div className="h-[2px] flex-1 max-w-40 bg-gray-900"></div>
      </div>

      <p className="text-gray-600 mb-8">No hay valoraciones aún.</p>

      <div className="border-t border-gray-200 pt-7">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Sé el primero en valorar este producto
        </h3>

        <p className="text-sm text-gray-600 mb-5">
          Tu opinión ayuda a otros usuarios a elegir mejor.
        </p>

        <div className="mb-5">
          <p className="text-sm font-bold text-gray-800 mb-2">Tu valoración</p>

          <Rate value={valoracion} onChange={setValoracion} />
        </div>

        <div className="mb-5">
          <p className="text-sm font-bold text-gray-800 mb-2">Tu comentario</p>

          <Input.TextArea
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escribe tu opinión sobre este producto..."
            className="!rounded-xl"
          />
        </div>

        <Button
          type="primary"
          className="!bg-gray-950 !border-gray-950 !rounded-xl !font-bold hover:!bg-black"
        >
          Enviar valoración
        </Button>
      </div>
    </section>
  );
}

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, estaLogueado } = useAuth();

  const [producto, setProducto] = useState(null);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [esFavorito, setEsFavorito] = useState(false);
  const [cargandoFavorito, setCargandoFavorito] = useState(false);
  const [cargandoCarrito, setCargandoCarrito] = useState(false);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setCargando(true);

        const [productoApi, productosApi] = await Promise.all([
          obtenerProductoPorId(id),
          obtenerProductos(),
        ]);

        const imagenesValidas =
          productoApi.imagenes
            ?.filter(
              (img) => img.tipo !== "oferta_wide" && img.tipo !== "banner",
            )
            ?.filter((img) => img.url && img.url.trim() !== "")
            ?.sort((a, b) => {
              if (a.esPrincipal !== b.esPrincipal) {
                return a.esPrincipal ? -1 : 1;
              }

              return (a.orden || 0) - (b.orden || 0);
            }) || [];

        const imagenInicial =
          imagenesValidas.find((img) => img.esPrincipal) || imagenesValidas[0];

        const imagenPrincipal = imagenInicial?.url
          ? `${imagenInicial.url}?v=${imagenInicial.updatedAt || imagenInicial.id || "principal"}`
          : "/img/productos/producto.png";

        setProducto(productoApi);
        setProductosRelacionados(productosApi);
        setImagenSeleccionada(imagenPrincipal);
        setError("");
      } catch (error) {
        console.error(error);
        setError("No se pudo cargar el producto");
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [id]);

  useEffect(() => {
    const cargarFavorito = async () => {
      if (!token || !estaLogueado || !id) {
        setEsFavorito(false);
        return;
      }

      try {
        const favoritos = await obtenerFavoritos(token);

        const existe = favoritos.some(
          (favorito) => Number(favorito.productoId) === Number(id),
        );

        setEsFavorito(existe);
      } catch (error) {
        console.error("Error al cargar favorito:", error);
      }
    };

    cargarFavorito();
  }, [token, estaLogueado, id]);

  const toggleFavorito = async () => {
    if (!producto) return;

    if (!estaLogueado || !token) {
      message.info("Inicia sesión para guardar productos favoritos");
      navigate("/login");
      return;
    }

    try {
      setCargandoFavorito(true);

      if (esFavorito) {
        await eliminarFavoritoUsuario(token, producto.id);
        setEsFavorito(false);
        message.success("Producto eliminado de favoritos");
      } else {
        await agregarFavorito(token, producto.id);
        setEsFavorito(true);
        message.success("Producto agregado a favoritos");
      }
    } catch (error) {
      message.error(error.message || "No se pudo actualizar favoritos");
    } finally {
      setCargandoFavorito(false);
    }
  };

  const agregarAlCarrito = async () => {
    if (!producto) return;

    if (!estaLogueado || !token) {
      message.info("Inicia sesión para agregar productos al carrito");
      navigate("/login");
      return;
    }

    try {
      setCargandoCarrito(true);

      await agregarProductoCarrito(token, producto.id);

      message.success("Producto agregado al carrito");
    } catch (error) {
      message.error(error.message || "No se pudo agregar al carrito");
    } finally {
      setCargandoCarrito(false);
    }
  };

  const comprarAhora = async () => {
    if (!producto) return;

    if (!estaLogueado || !token) {
      message.info("Inicia sesión para comprar este producto");
      navigate("/login");
      return;
    }

    try {
      setCargandoCarrito(true);

      await agregarProductoCarrito(token, producto.id);

      message.success("Producto agregado al carrito");
      navigate("/carrito");
    } catch (error) {
      message.error(error.message || "No se pudo continuar con la compra");
    } finally {
      setCargandoCarrito(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Cargando producto...
          </h1>

          <p className="text-gray-600 mt-2">
            Estamos obteniendo el detalle desde la base de datos.
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h1 className="text-2xl font-black text-red-600">
            Producto no encontrado
          </h1>

          <p className="text-gray-600 mt-2">
            {error || "No encontramos el producto solicitado."}
          </p>

          <Link
            to="/productos"
            className="inline-block mt-6 bg-gray-950 text-white px-5 py-3 rounded-xl font-bold"
          >
            Volver a productos
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  const imagenesProducto =
    producto.imagenes
      ?.filter((img) => img.tipo !== "oferta_wide" && img.tipo !== "banner")
      ?.filter((img) => img.url && img.url.trim() !== "")
      ?.sort((a, b) => {
        if (a.esPrincipal !== b.esPrincipal) {
          return a.esPrincipal ? -1 : 1;
        }

        return (a.orden || 0) - (b.orden || 0);
      }) || [];

  const imagenesDetalleBase =
    imagenesProducto.length > 0 ? [...imagenesProducto] : [];

  while (imagenesDetalleBase.length < 4) {
    imagenesDetalleBase.push({
      id: `placeholder-${imagenesDetalleBase.length + 1}`,
      url: "/img/productos/producto.png",
      tipo: "placeholder",
      esPlaceholder: true,
      orden: imagenesDetalleBase.length + 1,
    });
  }

  const imagenesDetalle = imagenesDetalleBase;

  const categoriaNombre = producto.categoria?.nombre || "Sin categoría";
  const marcaNombre = producto.marca?.nombre || "Sin marca";
  const precioNormal = producto.precioNormal || producto.precio;
  const descuento = producto.descuento || 0;
  const otrosMedios = producto.otrosMedios || producto.precio;
  const stockOnline =
    producto.stock > 0 ? `${producto.stock} unidades` : "No disponible";
  const stockTienda = "Consultar disponibilidad";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>

          <span className="mx-2">/</span>

          <Link to="/productos" className="text-blue-600 hover:underline">
            Productos
          </Link>

          <span className="mx-2">/</span>

          <span>{categoriaNombre}</span>
        </div>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[90px_1fr_380px] gap-8">
            <div className="flex lg:flex-col gap-3 order-2 lg:order-1">
              {imagenesDetalle.map((imagen, index) => {
                const urlImagen = imagen.url
                  ? `${imagen.url}?v=${imagen.updatedAt || imagen.id || index}`
                  : "/img/productos/producto.png";

                return (
                  <button
                    key={imagen.id || index}
                    type="button"
                    disabled={imagen.esPlaceholder}
                    onClick={() => {
                      if (imagen.esPlaceholder) return;

                      const nuevaImagen = imagen.url
                        ? `${imagen.url}?v=${imagen.updatedAt || imagen.id || index}`
                        : "/img/productos/producto.png";

                      setImagenSeleccionada(nuevaImagen);
                    }}
                    className={`w-20 h-20 rounded-xl border flex items-center justify-center p-2 bg-white transition ${
                      imagen.esPlaceholder
                        ? "border-gray-200 opacity-40 cursor-not-allowed"
                        : imagenSeleccionada ===
                            `${imagen.url}?v=${imagen.updatedAt || imagen.id || index}`
                          ? "border-gray-900 shadow-sm"
                          : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {imagen.esPlaceholder ? (
                      <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-100 border border-dashed border-gray-300">
                        <span className="text-[10px] font-bold text-gray-400 text-center">
                          Sin imagen
                        </span>
                      </div>
                    ) : (
                      <img
                        src={urlImagen}
                        alt={`${producto.nombre} ${index + 1}`}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/img/productos/producto.png";
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="order-1 lg:order-2 flex flex-col items-center justify-center">
              <div className="w-full min-h-[420px] flex items-center justify-center">
                <img
                  key={imagenSeleccionada}
                  src={imagenSeleccionada || "/img/productos/producto.png"}
                  alt={producto.nombre}
                  referrerPolicy="no-referrer"
                  className="max-h-[430px] max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/img/productos/producto.png";
                  }}
                />
              </div>

              <p className="text-xs text-gray-400 italic mt-4">
                Imágenes referenciales
              </p>
            </div>

            <aside className="order-3">
              <h1 className="text-2xl font-bold text-gray-950 leading-tight">
                {producto.nombre}
              </h1>

              <p className="text-xs text-gray-500 mt-4">
                SKU: {producto.sku || "Sin SKU"}
              </p>

              <p className="text-sm text-gray-800 mt-4 font-semibold">
                Marca: {marcaNombre}
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio normal</span>
                  <span className="text-gray-400 line-through">
                    {formatearPrecio(precioNormal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento</span>
                  <span className="text-blue-700 bg-cyan-100 px-2 py-1 rounded text-xs font-black">
                    {descuento}% DCTO.
                  </span>
                </div>

                <div className="flex justify-between items-end gap-4 border-t border-gray-200 pt-4">
                  <span className="text-sm font-bold text-gray-900">
                    Pago transferencia
                  </span>

                  <span className="text-2xl font-black text-gray-950">
                    {formatearPrecio(producto.precio)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Otros medios</span>
                  <span>{formatearPrecio(otrosMedios)}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <Button
                  block
                  size="large"
                  loading={cargandoCarrito}
                  onClick={agregarAlCarrito}
                  className="!h-12 !rounded-xl !border-gray-900 !text-gray-900 !font-bold hover:!border-black hover:!text-black"
                >
                  Agregar al carro
                </Button>

                <Button
                  block
                  size="large"
                  type="primary"
                  loading={cargandoCarrito}
                  onClick={comprarAhora}
                  className="!h-12 !rounded-xl !bg-gray-950 !font-bold hover:!bg-black"
                >
                  Comprar ahora
                </Button>

                <Button
                  block
                  size="large"
                  loading={cargandoFavorito}
                  icon={esFavorito ? <HeartFilled /> : <HeartOutlined />}
                  onClick={toggleFavorito}
                  className={`!h-12 !rounded-xl !font-bold ${
                    esFavorito
                      ? "!border-red-200 !text-red-500 hover:!border-red-300 hover:!text-red-600"
                      : "!border-gray-300 !text-gray-800 hover:!border-red-300 hover:!text-red-500"
                  }`}
                >
                  {esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
                </Button>
              </div>

              <div className="mt-6 border-t border-b border-gray-200 divide-y divide-gray-200">
                <div className="py-4 flex justify-between gap-4">
                  <span className="text-sm font-bold text-gray-900">
                    Stock online
                  </span>

                  <span className="text-xs font-bold text-emerald-600">
                    {stockOnline}
                  </span>
                </div>

                <div className="py-4 flex justify-between gap-4">
                  <span className="text-sm font-bold text-gray-900">
                    Stock tienda
                  </span>

                  <span className="text-xs font-bold text-gray-500">
                    {stockTienda}
                  </span>
                </div>

                <div className="py-4 flex justify-between gap-4">
                  <span className="text-sm font-bold text-gray-900">
                    Garantía
                  </span>

                  <span className="text-xs font-bold text-gray-500">
                    {producto.garantia || "Sin información"}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 mt-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Especificaciones
            </h2>

            <div className="h-[3px] bg-gray-900 w-full mb-4"></div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-900 text-white px-5 py-4 font-black">
                Generalidades
              </div>

              {producto.especificaciones?.length > 0 ? (
                producto.especificaciones.map((especificacion, index) => (
                  <div
                    key={especificacion.id || index}
                    className={`grid grid-cols-2 px-5 py-4 text-sm ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <span className="font-bold text-gray-900">
                      {especificacion.nombre}
                    </span>

                    <span className="text-gray-700">
                      {especificacion.valor}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-4 text-sm text-gray-600">
                  Sin especificaciones registradas.
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Descripción
            </h2>

            <div className="h-[3px] bg-gray-900 w-full mb-4"></div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">
                {producto.nombre}
              </h3>

              <p className="text-gray-700 leading-relaxed">
                {producto.descripcion || "Sin descripción disponible."}
              </p>
            </div>
          </div>
        </section>

        <ProductosRelacionadosCarrusel
          productoActual={producto}
          productosRelacionados={productosRelacionados}
        />

        <ValoracionesProducto producto={producto} />
      </main>

      <Footer />
    </div>
  );
}

export default DetalleProducto;
