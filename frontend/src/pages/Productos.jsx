import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Checkbox, Select, Button, Pagination, message } from "antd";
import {
  ShoppingCartOutlined,
  FilterOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  obtenerProductos,
  obtenerCategorias,
  obtenerMarcas,
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavoritoUsuario,
  agregarProductoCarrito,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { agregarItemCarritoInvitado } from "../utils/carritoInvitado";

const rangosPrecio = [
  {
    label: "$0 - $100.000",
    min: 0,
    max: 100000,
  },
  {
    label: "$100.001 - $200.000",
    min: 100001,
    max: 200000,
  },
  {
    label: "$200.001 - $400.000",
    min: 200001,
    max: 400000,
  },
  {
    label: "$400.001 - $700.000",
    min: 400001,
    max: 700000,
  },
  {
    label: "$700.001 - $1.000.000",
    min: 700001,
    max: 1000000,
  },
  {
    label: "Más de $1.000.000",
    min: 1000001,
    max: Infinity,
  },
];

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function normalizarTexto(texto = "") {
  return texto
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function crearSlugFiltro(texto = "") {
  return normalizarTexto(texto)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
function buscarValorPorSlug(lista = [], valorUrl = "") {
  if (!valorUrl) return null;

  return (
    lista.find((item) => crearSlugFiltro(item) === crearSlugFiltro(valorUrl)) ||
    null
  );
}
function coincideFiltroTexto(valorProducto, valorFiltro) {
  return crearSlugFiltro(valorProducto) === crearSlugFiltro(valorFiltro);
}

function SidebarFiltros({
  categorias = [],
  marcas = [],
  categoriasSeleccionadas,
  setCategoriasSeleccionadas,
  marcasSeleccionadas,
  setMarcasSeleccionadas,
  preciosSeleccionados,
  setPreciosSeleccionados,
  soloDisponibles,
  setSoloDisponibles,
  soloOfertas,
  setSoloOfertas,
  limpiarFiltros,
}) {
  const marcasPrincipales = marcas
    .filter((marca) => marca.grupo === "principal")
    .map((marca) => marca.nombre);

  const otrasMarcas = marcas
    .filter((marca) => marca.grupo !== "principal")
    .map((marca) => marca.nombre);

  return (
    <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 h-fit">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-black text-gray-900">Filtros</h2>

        <FilterOutlined className="text-gray-500" />
      </div>

      <div className="border-t border-gray-200 py-5">
        <h3 className="font-bold text-gray-900 mb-3">Categoría</h3>

        <Checkbox.Group
          value={categoriasSeleccionadas}
          onChange={setCategoriasSeleccionadas}
          className="flex flex-col gap-3"
        >
          {categorias.map((categoria) => (
            <Checkbox key={categoria} value={categoria}>
              {categoria}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <div className="border-t border-gray-200 py-5">
        <h3 className="font-bold text-gray-900 mb-3">Marca</h3>

        <Checkbox.Group
          value={marcasSeleccionadas}
          onChange={setMarcasSeleccionadas}
          className="flex flex-col gap-3"
        >
          {marcasPrincipales.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide">
                Marcas principales
              </p>

              {marcasPrincipales.map((marca) => (
                <Checkbox key={marca} value={marca}>
                  {marca}
                </Checkbox>
              ))}
            </div>
          )}

          {otrasMarcas.length > 0 && (
            <div className="flex flex-col gap-3 mt-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide">
                Otras marcas
              </p>

              {otrasMarcas.map((marca) => (
                <Checkbox key={marca} value={marca}>
                  {marca}
                </Checkbox>
              ))}
            </div>
          )}
        </Checkbox.Group>
      </div>

      <div className="border-t border-gray-200 py-5">
        <h3 className="font-bold text-gray-900 mb-3">Precio</h3>

        <Checkbox.Group
          value={preciosSeleccionados}
          onChange={setPreciosSeleccionados}
          className="flex flex-col gap-3"
        >
          {rangosPrecio.map((rango, index) => (
            <Checkbox key={index} value={index}>
              {rango.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <div className="border-t border-gray-200 py-5">
        <h3 className="font-bold text-gray-900 mb-3">Disponibilidad</h3>

        <div className="flex flex-col gap-3">
          <Checkbox
            checked={soloDisponibles}
            onChange={(e) => setSoloDisponibles(e.target.checked)}
          >
            Solo disponibles
          </Checkbox>

          <Checkbox
            checked={soloOfertas}
            onChange={(e) => setSoloOfertas(e.target.checked)}
          >
            Solo ofertas
          </Checkbox>
        </div>
      </div>

      <Button
        block
        onClick={limpiarFiltros}
        className="!h-11 !rounded-xl !font-bold"
      >
        Limpiar filtros
      </Button>
    </aside>
  );
}

function ProductoCard({
  producto,
  esFavorito,
  cargandoFavorito,
  onToggleFavorito,
  cargandoCarrito,
  onAgregarCarrito,
}) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group h-full">
      <div className="relative">
        <Link to={`/producto/${producto.id}`}>
          <div className="h-44 bg-white flex items-center justify-center p-4">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/img/productos/producto.png";
              }}
            />
          </div>
        </Link>

        <button
          type="button"
          disabled={cargandoFavorito}
          onClick={() => onToggleFavorito(producto)}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border transition ${
            esFavorito
              ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
              : "bg-white border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
          }`}
          title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {esFavorito ? (
            <HeartFilled className="text-lg" />
          ) : (
            <HeartOutlined className="text-lg" />
          )}
        </button>
      </div>

      <div className="p-4 pt-2">
        <div className="flex justify-end min-h-[24px]">
          {producto.disponible && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
              DISPONIBLE
            </span>
          )}
        </div>

        <h3 className="text-sm font-black text-gray-900 uppercase mt-2">
          {producto.marca}
        </h3>

        <Link to={`/producto/${producto.id}`}>
          <p className="text-sm text-gray-600 mt-1 line-clamp-3 min-h-[60px] hover:text-gray-900">
            {producto.nombre}
          </p>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          {producto.descuento > 0 && (
            <span className="text-[10px] font-bold text-blue-700 bg-cyan-100 px-2 py-1 rounded">
              {producto.descuento}% DCTO.
            </span>
          )}

          {producto.precioNormal && producto.precioNormal > producto.precio && (
            <span className="text-xs text-gray-400 line-through">
              {formatearPrecio(producto.precioNormal)}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-black text-gray-950">
              {formatearPrecio(producto.precio)}
            </p>

            <p className="text-xs text-gray-500">Precio transferencia</p>
          </div>

          <button
            type="button"
            disabled={cargandoCarrito || !producto.disponible}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAgregarCarrito(producto);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-sm border disabled:opacity-50 ${
              producto.disponible
                ? "bg-emerald-400 text-gray-950 hover:bg-emerald-300 border-emerald-500"
                : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
            }`}
            title={
              producto.disponible ? "Agregar al carrito" : "Producto sin stock"
            }
          >
            <ShoppingCartOutlined className="text-lg" />
          </button>
        </div>
      </div>
    </article>
  );
}

function Productos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, estaLogueado } = useAuth();
  const categoriaUrl = searchParams.get("categoria");
  const marcaUrl = searchParams.get("marca");
  const busquedaUrl = searchParams.get("buscar") || "";
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState([]);
  const [preciosSeleccionados, setPreciosSeleccionados] = useState([]);
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [orden, setOrden] = useState("relevancia");
  const [favoritosIds, setFavoritosIds] = useState([]);
  const [cargandoFavoritoId, setCargandoFavoritoId] = useState(null);
  const [cargandoCarritoId, setCargandoCarritoId] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 6;
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        const [productosApi, categoriasApi, marcasApi] = await Promise.all([
          obtenerProductos({ limit: 100 }),
          obtenerCategorias(),
          obtenerMarcas(),
        ]);

        const productosAdaptados = productosApi.map((producto) => {
          const imagenPrincipal =
            producto.imagenes?.find((img) => img.esPrincipal)?.url ||
            producto.imagenes?.[0]?.url ||
            "/img/productos/producto.png";

          const precioFinal = Number(producto.precio || 0);
          const precioNormal = Number(producto.precioNormal || 0);
          const descuento = Number(producto.descuento || 0);

          const tieneOferta =
            producto.enOferta === true ||
            descuento > 0 ||
            (precioNormal > 0 && precioNormal > precioFinal);

          return {
            ...producto,
            categoria: producto.categoria?.nombre || "",
            marca: producto.marca?.nombre || "Sin marca",
            imagen: imagenPrincipal,
            disponible: producto.stock > 0,
            oferta: tieneOferta,
            precio: precioFinal,
            precioNormal: precioNormal > precioFinal ? precioNormal : null,
            descuento,
          };
        });

        setProductos(productosAdaptados);
        setCategorias(categoriasApi.map((categoria) => categoria.nombre));
        setMarcas(marcasApi.sort((a, b) => a.orden - b.orden));
        setError("");
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(error);
        }
        setError("No se pudieron cargar los productos");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    const cargarFavoritos = async () => {
      if (!token || !estaLogueado) {
        setFavoritosIds([]);
        return;
      }

      try {
        const favoritos = await obtenerFavoritos(token);

        setFavoritosIds(
          favoritos.map((favorito) => favorito.productoId).filter(Boolean),
        );
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error al cargar favoritos:", error);
        }
      }
    };

    cargarFavoritos();
  }, [token, estaLogueado]);

  useEffect(() => {
    if (categoriaUrl) {
      const categoriaReal = buscarValorPorSlug(categorias, categoriaUrl);

      setCategoriasSeleccionadas([categoriaReal || categoriaUrl]);
    } else {
      setCategoriasSeleccionadas([]);
    }

    if (marcaUrl) {
      const nombresMarcas = marcas.map((marca) => marca.nombre);
      const marcaReal = buscarValorPorSlug(nombresMarcas, marcaUrl);

      setMarcasSeleccionadas([marcaReal || marcaUrl]);
    } else {
      setMarcasSeleccionadas([]);
    }
  }, [categoriaUrl, marcaUrl, categorias, marcas]);

  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];
    const busqueda = normalizarTexto(busquedaUrl);

    if (busqueda) {
      resultado = resultado.filter((producto) => {
        const nombre = normalizarTexto(producto.nombre);
        const descripcion = normalizarTexto(producto.descripcion);
        const marca = normalizarTexto(producto.marca);
        const categoria = normalizarTexto(producto.categoria);

        return (
          nombre.includes(busqueda) ||
          descripcion.includes(busqueda) ||
          marca.includes(busqueda) ||
          categoria.includes(busqueda)
        );
      });
    }
    if (categoriasSeleccionadas.length > 0) {
      resultado = resultado.filter((producto) =>
        categoriasSeleccionadas.some((categoriaFiltro) =>
          coincideFiltroTexto(producto.categoria, categoriaFiltro),
        ),
      );
    }

    if (marcasSeleccionadas.length > 0) {
      resultado = resultado.filter((producto) =>
        marcasSeleccionadas.some((marcaFiltro) =>
          coincideFiltroTexto(producto.marca, marcaFiltro),
        ),
      );
    }

    if (preciosSeleccionados.length > 0) {
      resultado = resultado.filter((producto) =>
        preciosSeleccionados.some((index) => {
          const rango = rangosPrecio[index];
          return producto.precio >= rango.min && producto.precio <= rango.max;
        }),
      );
    }

    if (soloDisponibles) {
      resultado = resultado.filter((producto) => producto.disponible);
    }

    if (soloOfertas) {
      resultado = resultado.filter((producto) => producto.oferta);
    }

    if (orden === "menor-precio") {
      resultado.sort((a, b) => a.precio - b.precio);
    }

    if (orden === "mayor-precio") {
      resultado.sort((a, b) => b.precio - a.precio);
    }

    if (orden === "mayor-descuento") {
      resultado.sort((a, b) => b.descuento - a.descuento);
    }

    return resultado;
  }, [
    productos,
    busquedaUrl,
    categoriasSeleccionadas,
    marcasSeleccionadas,
    preciosSeleccionados,
    soloDisponibles,
    soloOfertas,
    orden,
  ]);

  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;

    return productosFiltrados.slice(inicio, fin);
  }, [productosFiltrados, paginaActual]);

  useEffect(() => {
    setPaginaActual(1);
  }, [
    busquedaUrl,
    categoriasSeleccionadas,
    marcasSeleccionadas,
    preciosSeleccionados,
    soloDisponibles,
    soloOfertas,
    orden,
  ]);

  const toggleFavorito = async (producto) => {
    if (!estaLogueado || !token) {
      message.info("Inicia sesión para guardar productos favoritos");
      navigate("/login");
      return;
    }

    const yaEsFavorito = favoritosIds.includes(producto.id);

    try {
      setCargandoFavoritoId(producto.id);

      if (yaEsFavorito) {
        await eliminarFavoritoUsuario(token, producto.id);

        setFavoritosIds((prev) => prev.filter((id) => id !== producto.id));
        message.success("Producto eliminado de favoritos");
      } else {
        await agregarFavorito(token, producto.id);

        setFavoritosIds((prev) => [...prev, producto.id]);
        message.success("Producto agregado a favoritos");
      }
    } catch (error) {
      message.error(error.message || "No se pudo actualizar favoritos");
    } finally {
      setCargandoFavoritoId(null);
    }
  };

  const agregarAlCarrito = async (producto) => {
    if (!producto.disponible) {
      message.warning("Este producto no tiene stock disponible");
      return;
    }

    if (!estaLogueado || !token) {
      try {
        setCargandoCarritoId(producto.id);

        agregarItemCarritoInvitado(producto.id, 1);

        message.success("Producto agregado al carrito");
      } catch (error) {
        message.error(error.message || "No se pudo agregar al carrito");
      } finally {
        setCargandoCarritoId(null);
      }

      return;
    }

    try {
      setCargandoCarritoId(producto.id);

      await agregarProductoCarrito(token, producto.id);

      message.success("Producto agregado al carrito");

      window.dispatchEvent(new Event("carritoActualizado"));
    } catch (error) {
      message.error(error.message || "No se pudo agregar al carrito");
    } finally {
      setCargandoCarritoId(null);
    }
  };

  const limpiarFiltros = () => {
    setCategoriasSeleccionadas([]);
    setMarcasSeleccionadas([]);
    setPreciosSeleccionados([]);
    setSoloDisponibles(false);
    setSoloOfertas(false);
    setOrden("relevancia");
    navigate("/productos");
  };
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Cargando productos...
          </h1>

          <p className="text-gray-600 mt-2">
            Estamos obteniendo los productos desde la base de datos.
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h1 className="text-2xl font-black text-red-600">
            Error al cargar productos
          </h1>

          <p className="text-gray-600 mt-2">{error}</p>
        </main>

        <Footer />
      </div>
    );
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
          <span>Productos</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Productos</h1>

            {busquedaUrl && (
              <p className="text-sm text-gray-500 mt-1">
                Resultados para:{" "}
                <span className="font-bold text-gray-900">{busquedaUrl}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">
              Ordenar por:
            </span>

            <Select
              value={orden}
              onChange={setOrden}
              className="w-48"
              options={[
                {
                  value: "relevancia",
                  label: "Relevancia",
                },
                {
                  value: "menor-precio",
                  label: "Menor precio",
                },
                {
                  value: "mayor-precio",
                  label: "Mayor precio",
                },
                {
                  value: "mayor-descuento",
                  label: "Mayor descuento",
                },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <SidebarFiltros
            categorias={categorias}
            marcas={marcas}
            categoriasSeleccionadas={categoriasSeleccionadas}
            setCategoriasSeleccionadas={setCategoriasSeleccionadas}
            marcasSeleccionadas={marcasSeleccionadas}
            setMarcasSeleccionadas={setMarcasSeleccionadas}
            preciosSeleccionados={preciosSeleccionados}
            setPreciosSeleccionados={setPreciosSeleccionados}
            soloDisponibles={soloDisponibles}
            setSoloDisponibles={setSoloDisponibles}
            soloOfertas={soloOfertas}
            setSoloOfertas={setSoloOfertas}
            limpiarFiltros={limpiarFiltros}
          />

          <section>
            {productosFiltrados.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {productosPaginados.map((producto) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                      esFavorito={favoritosIds.includes(producto.id)}
                      cargandoFavorito={cargandoFavoritoId === producto.id}
                      onToggleFavorito={toggleFavorito}
                      cargandoCarrito={cargandoCarritoId === producto.id}
                      onAgregarCarrito={agregarAlCarrito}
                    />
                  ))}
                </div>

                <div className="flex justify-center mt-10">
                  <Pagination
                    current={paginaActual}
                    pageSize={productosPorPagina}
                    total={productosFiltrados.length}
                    onChange={(page) => setPaginaActual(page)}
                    showSizeChanger={false}
                    hideOnSinglePage={false}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
                <h2 className="text-xl font-black text-gray-900">
                  No encontramos productos
                </h2>

                <p className="text-gray-600 mt-2">
                  Prueba quitando algunos filtros para ver más resultados.
                </p>

                <Button
                  onClick={limpiarFiltros}
                  className="!mt-5 !h-11 !rounded-xl !font-bold"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Productos;
