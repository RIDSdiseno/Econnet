import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Image,
  Input,
  Row,
  Select,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  ClearOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerFiltrosProductosVendidosAdmin,
  obtenerProductosVendidosAdmin,
  obtenerResumenProductosVendidosAdmin,
} from "../../services/adminApi";

const { RangePicker } = DatePicker;

const estadosPedido = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "preparando", label: "Preparando" },
  { value: "empaquetando", label: "Empaquetando" },
  { value: "en_despacho", label: "En despacho" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

const estadosPago = [
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "cancelado", label: "Cancelado" },
];

const opcionesOrdenResumen = [
  { value: "unidades", label: "Más unidades vendidas" },
  { value: "ingresos", label: "Más ingresos" },
  { value: "ultimaVenta", label: "Venta más reciente" },
  { value: "producto", label: "Nombre del producto" },
];

const coloresEstadoVenta = {
  aprobada: "green",
  pendiente: "orange",
  cancelada: "red",
};

const coloresEstadoPedido = {
  pendiente: "orange",
  confirmado: "blue",
  preparando: "purple",
  empaquetando: "cyan",
  en_despacho: "geekblue",
  entregado: "green",
  cancelado: "red",
};

const coloresEstadoPago = {
  pendiente: "orange",
  aprobado: "green",
  rechazado: "red",
  cancelado: "volcano",
};

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatearEstado(valor) {
  if (!valor) {
    return "SIN ESTADO";
  }

  return valor.replaceAll("_", " ").toUpperCase();
}

function acortarNumero(numero) {
  if (!numero) {
    return "Sin número";
  }

  if (numero.length <= 16) {
    return numero;
  }

  return `${numero.slice(0, 8)}...${numero.slice(-5)}`;
}

const filtrosIniciales = {
  busqueda: "",
  estadoPedido: "",
  estadoPago: "",
  categoriaId: null,
  marcaId: null,
  fechaDesde: "",
  fechaHasta: "",
  ordenarPor: "unidades",
};

function AdminProductosVendidos() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const tokenActual = token || localStorage.getItem("token");

  const [pestanaActiva, setPestanaActiva] = useState("detalle");

  const [ventas, setVentas] = useState([]);
  const [resumen, setResumen] = useState([]);

  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cargandoResumen, setCargandoResumen] = useState(false);

  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);

  const categoriasDisponibles = useMemo(() => {
    if (!filtros.marcaId) {
      return categorias;
    }

    const marcaSeleccionada = marcas.find(
      (marca) => Number(marca.id) === Number(filtros.marcaId),
    );

    if (!marcaSeleccionada) {
      return categorias;
    }

    return categorias.filter((categoria) =>
      marcaSeleccionada.categoriaIds?.includes(Number(categoria.id)),
    );
  }, [categorias, marcas, filtros.marcaId]);

  const marcasDisponibles = useMemo(() => {
    if (!filtros.categoriaId) {
      return marcas;
    }

    const categoriaSeleccionada = categorias.find(
      (categoria) => Number(categoria.id) === Number(filtros.categoriaId),
    );

    if (!categoriaSeleccionada) {
      return marcas;
    }

    return marcas.filter((marca) =>
      categoriaSeleccionada.marcaIds?.includes(Number(marca.id)),
    );
  }, [categorias, marcas, filtros.categoriaId]);
  ;

  const [paginaDetalle, setPaginaDetalle] = useState(1);
  const [paginaResumen, setPaginaResumen] = useState(1);

  const [metricas, setMetricas] = useState({
    totalRegistros: 0,
    productosDistintos: 0,
    unidadesAprobadas: 0,
    unidadesPendientes: 0,
    unidadesCanceladas: 0,
    ingresosAprobados: 0,
  });

  const [paginacionDetalle, setPaginacionDetalle] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
  });

  const [paginacionResumen, setPaginacionResumen] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
  });

  const cargarOpciones = async () => {
    try {
      const data = await obtenerFiltrosProductosVendidosAdmin(tokenActual);

      setCategorias(data.categorias || []);
      setMarcas(data.marcas || []);
    } catch (error) {
      message.error(error.message || "No se pudieron cargar los filtros");
    }
  };

  const cargarDetalle = async () => {
    try {
      setCargandoDetalle(true);

      const data = await obtenerProductosVendidosAdmin(tokenActual, {
        ...filtrosAplicados,
        pagina: paginaDetalle,
        limite: 10,
      });

      setVentas(data.ventas || []);
      setMetricas(data.metricas || {});
      setPaginacionDetalle(data.paginacion || {});
    } catch (error) {
      message.error(
        error.message || "No se pudieron cargar los productos vendidos",
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cargarResumen = async () => {
    try {
      setCargandoResumen(true);

      const data = await obtenerResumenProductosVendidosAdmin(tokenActual, {
        ...filtrosAplicados,
        pagina: paginaResumen,
        limite: 10,
        ordenarPor: filtrosAplicados.ordenarPor,
      });

      setResumen(data.resumen || []);
      setPaginacionResumen(data.paginacion || {});
    } catch (error) {
      message.error(
        error.message || "No se pudo cargar el resumen de productos",
      );
    } finally {
      setCargandoResumen(false);
    }
  };

  useEffect(() => {
    if (!tokenActual) {
      return;
    }

    cargarOpciones();
  }, [tokenActual]);

  useEffect(() => {
    if (!tokenActual) {
      return;
    }

    cargarDetalle();
  }, [tokenActual, paginaDetalle, filtrosAplicados]);

  useEffect(() => {
    if (!tokenActual || pestanaActiva !== "resumen") {
      return;
    }

    cargarResumen();
  }, [tokenActual, pestanaActiva, paginaResumen, filtrosAplicados]);

  const actualizarFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const cambiarCategoria = (valor) => {
    const categoriaId = valor || null;

    setFiltros((prev) => {
      let marcaId = prev.marcaId;

      if (categoriaId && marcaId) {
        const categoriaSeleccionada = categorias.find(
          (categoria) => Number(categoria.id) === Number(categoriaId),
        );

        const esCompatible = categoriaSeleccionada?.marcaIds?.includes(
          Number(marcaId),
        );

        if (!esCompatible) {
          marcaId = null;
        }
      }

      return {
        ...prev,
        categoriaId,
        marcaId,
      };
    });
  };

  const cambiarMarca = (valor) => {
    const marcaId = valor || null;

    setFiltros((prev) => {
      let categoriaId = prev.categoriaId;

      if (marcaId && categoriaId) {
        const marcaSeleccionada = marcas.find(
          (marca) => Number(marca.id) === Number(marcaId),
        );

        const esCompatible = marcaSeleccionada?.categoriaIds?.includes(
          Number(categoriaId),
        );

        if (!esCompatible) {
          categoriaId = null;
        }
      }

      return {
        ...prev,
        marcaId,
        categoriaId,
      };
    });
  };

  const aplicarFiltros = () => {
    setPaginaDetalle(1);
    setPaginaResumen(1);
    setFiltrosAplicados({
      ...filtros,
    });
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
    setFiltrosAplicados(filtrosIniciales);
    setPaginaDetalle(1);
    setPaginaResumen(1);
  };

  const actualizarDatos = () => {
    if (pestanaActiva === "detalle") {
      cargarDetalle();
      return;
    }

    cargarResumen();
  };

  const cambiarFechas = (fechas) => {
    if (!fechas || fechas.length !== 2) {
      setFiltros((prev) => ({
        ...prev,
        fechaDesde: "",
        fechaHasta: "",
      }));

      return;
    }

    setFiltros((prev) => ({
      ...prev,
      fechaDesde: fechas[0].format("YYYY-MM-DD"),
      fechaHasta: fechas[1].format("YYYY-MM-DD"),
    }));
  };

  const renderDetalleProductos = (venta) => (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="font-black text-gray-900 m-0">Productos del pedido</h3>

          <p className="text-sm text-gray-500 m-0 mt-1">
            {venta.cantidadProductos} producto
            {venta.cantidadProductos !== 1 ? "s" : ""} · {venta.unidadesTotales}{" "}
            unidad
            {venta.unidadesTotales !== 1 ? "es" : ""}
          </p>
        </div>

        <p className="font-black text-lg text-gray-950 m-0">
          Subtotal productos: {formatearPrecio(venta.subtotalProductos)}
        </p>
      </div>

      <div className="space-y-3">
        {venta.productos.map((producto) => (
          <div
            key={producto.id}
            className="grid grid-cols-1 md:grid-cols-[64px_minmax(220px,1fr)_110px_130px_100px] gap-4 items-center bg-white border border-gray-200 rounded-xl p-4"
          >
            <Image
              width={58}
              height={58}
              preview={false}
              src={producto.imagenUrl || "/img/productos/producto.png"}
              fallback="/img/productos/producto.png"
              className="object-contain rounded-lg bg-gray-50"
            />

            <div className="min-w-0">
              <Tooltip title={producto.nombre}>
                <p className="font-black text-gray-950 m-0 truncate">
                  {producto.nombre}
                </p>
              </Tooltip>

              <p className="text-xs text-gray-500 m-0 mt-1">
                SKU: {producto.sku || "Sin SKU"}
              </p>

              <p className="text-xs text-gray-500 m-0">
                {producto.marca} · {producto.categoria}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 m-0">Cantidad</p>

              <p className="font-bold m-0 mt-1">
                {producto.cantidad} unidad
                {producto.cantidad !== 1 ? "es" : ""}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 m-0">Precio unitario</p>

              <p className="font-bold m-0 mt-1">
                {formatearPrecio(producto.precioUnitario)}
              </p>
            </div>

            <div className="md:text-right">
              <p className="font-black text-gray-950 m-0">
                {formatearPrecio(producto.subtotal)}
              </p>

              <Tag
                color={
                  producto.stockActual <= 5
                    ? "red"
                    : producto.stockActual <= 10
                      ? "orange"
                      : "green"
                }
                className="!mt-2"
              >
                Stock: {producto.stockActual}
              </Tag>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const columnasDetalle = [
    {
      title: "Pedido",
      key: "pedido",
      width: 170,
      render: (_, venta) => (
        <div>
          <Tooltip title={venta.pedido.numero}>
            <button
              type="button"
              onClick={() => navigate(`/admin/pedidos/${venta.pedido.id}`)}
              className="font-black text-gray-950 hover:text-blue-600 hover:underline"
            >
              {acortarNumero(venta.pedido.numero)}
            </button>
          </Tooltip>

          <p className="text-xs text-gray-500 m-0 mt-1">
            {formatearFecha(venta.pedido.createdAt)}
          </p>
        </div>
      ),
    },
    {
      title: "Cliente",
      key: "cliente",
      width: 210,
      render: (_, venta) => (
        <div>
          <p className="font-semibold m-0">{venta.cliente.nombre}</p>

          <p className="text-xs text-gray-500 m-0">{venta.cliente.email}</p>
        </div>
      ),
    },
    {
      title: "Productos",
      key: "productos",
      width: 310,
      render: (_, venta) => {
        const primerosProductos = venta.productos?.slice(0, 2) || [];

        const productosRestantes =
          (venta.productos?.length || 0) - primerosProductos.length;

        return (
          <div>
            <div className="flex items-center gap-2">
              {venta.productos?.slice(0, 3).map((producto) => (
                <Image
                  key={producto.id}
                  width={38}
                  height={38}
                  preview={false}
                  src={producto.imagenUrl || "/img/productos/producto.png"}
                  fallback="/img/productos/producto.png"
                  className="object-contain rounded-lg bg-gray-50 border border-gray-200"
                />
              ))}
            </div>

            <p className="font-bold text-gray-900 m-0 mt-2">
              {venta.cantidadProductos} producto
              {venta.cantidadProductos !== 1 ? "s" : ""}
            </p>

            <Tooltip
              title={venta.productos
                ?.map((producto) => producto.nombre)
                .join(", ")}
            >
              <p className="text-xs text-gray-500 m-0 truncate max-w-[270px]">
                {primerosProductos
                  .map((producto) => producto.nombre)
                  .join(", ")}

                {productosRestantes > 0 ? ` y ${productosRestantes} más` : ""}
              </p>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Unidades",
      dataIndex: "unidadesTotales",
      key: "unidadesTotales",
      width: 95,
      align: "center",
      render: (cantidad) => <strong>{cantidad}</strong>,
    },
    {
      title: "Total",
      key: "total",
      width: 130,
      render: (_, venta) => (
        <strong>{formatearPrecio(venta.pedido.total)}</strong>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "estadoVenta",
      key: "estadoVenta",
      width: 130,
      render: (estado) => (
        <Tag color={coloresEstadoVenta[estado] || "default"}>
          {formatearEstado(estado)}
        </Tag>
      ),
    },
    {
      title: "Estado pedido",
      key: "estadoPedido",
      width: 145,
      render: (_, venta) => (
        <Tag color={coloresEstadoPedido[venta.pedido.estado] || "default"}>
          {formatearEstado(venta.pedido.estado)}
        </Tag>
      ),
    },
    {
      title: "Estado pago",
      key: "estadoPago",
      width: 130,
      render: (_, venta) => (
        <Tag color={coloresEstadoPago[venta.pedido.estadoPago] || "default"}>
          {formatearEstado(venta.pedido.estadoPago)}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 105,
      render: (_, venta) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/pedidos/${venta.pedido.id}`)}
        >
          Ver
        </Button>
      ),
    },
  ];
  const columnasResumen = [
    {
      title: "Producto",
      key: "producto",
      width: 330,
      fixed: "left",
      render: (_, producto) => (
        <div className="flex items-center gap-3">
          <Image
            width={54}
            height={54}
            preview={false}
            src={producto.imagenUrl || "/img/productos/producto.png"}
            fallback="/img/productos/producto.png"
            className="object-contain rounded-lg bg-gray-50"
          />

          <div className="min-w-0">
            <Tooltip title={producto.nombre}>
              <p className="font-bold text-gray-950 m-0 max-w-[220px] truncate">
                {producto.nombre}
              </p>
            </Tooltip>

            <p className="text-xs text-gray-500 m-0">
              SKU: {producto.sku || "Sin SKU"}
            </p>

            <p className="text-xs text-gray-500 m-0">
              {producto.marca} · {producto.categoria}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Stock actual",
      dataIndex: "stockActual",
      key: "stockActual",
      width: 110,
      align: "center",
      render: (stock) => (
        <Tag color={stock <= 5 ? "red" : stock <= 10 ? "orange" : "green"}>
          {stock}
        </Tag>
      ),
    },
    {
      title: "Vendidas",
      dataIndex: "unidadesAprobadas",
      key: "unidadesAprobadas",
      width: 100,
      align: "center",
      render: (valor) => <strong className="text-green-700">{valor}</strong>,
    },
    {
      title: "Pendientes",
      dataIndex: "unidadesPendientes",
      key: "unidadesPendientes",
      width: 110,
      align: "center",
      render: (valor) => <strong className="text-orange-700">{valor}</strong>,
    },
    {
      title: "Canceladas",
      dataIndex: "unidadesCanceladas",
      key: "unidadesCanceladas",
      width: 110,
      align: "center",
      render: (valor) => <strong className="text-red-700">{valor}</strong>,
    },
    {
      title: "Pedidos",
      dataIndex: "cantidadPedidos",
      key: "cantidadPedidos",
      width: 90,
      align: "center",
    },
    {
      title: "Ingresos aprobados",
      dataIndex: "ingresosAprobados",
      key: "ingresosAprobados",
      width: 170,
      render: (valor) => <strong>{formatearPrecio(valor)}</strong>,
    },
    {
      title: "Última venta",
      dataIndex: "ultimaVenta",
      key: "ultimaVenta",
      width: 120,
      render: formatearFecha,
    },
  ];

  const contenidoDetalle = (
    <Card className="!rounded-2xl shadow-sm">
      <Table
        rowKey="id"
        columns={columnasDetalle}
        dataSource={ventas}
        loading={cargandoDetalle}
        pagination={{
          current: paginaDetalle,
          pageSize: 10,
          total: paginacionDetalle.total || 0,
          showSizeChanger: false,
          onChange: setPaginaDetalle,
        }}
        expandable={{
          expandedRowRender: renderDetalleProductos,
          rowExpandable: (venta) =>
            Array.isArray(venta.productos) && venta.productos.length > 0,
          columnWidth: 48,
        }}
        scroll={{
          x: 1350,
        }}
      />
    </Card>
  );

  const contenidoResumen = (
    <Card className="!rounded-2xl shadow-sm">
      <Table
        rowKey="productoId"
        columns={columnasResumen}
        dataSource={resumen}
        loading={cargandoResumen}
        pagination={{
          current: paginaResumen,
          pageSize: 10,
          total: paginacionResumen.total || 0,
          showSizeChanger: false,
          onChange: setPaginaResumen,
        }}
        scroll={{
          x: 1150,
        }}
      />
    </Card>
  );

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Productos vendidos</h1>

          <p className="text-gray-500 m-0">
            Revisa las unidades vendidas, ingresos, pedidos y stock actual.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={actualizarDatos}
          loading={
            pestanaActiva === "detalle" ? cargandoDetalle : cargandoResumen
          }
        >
          Actualizar
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} xl={4}>
          <Card className="!rounded-2xl h-full">
            <Statistic title="Pedidos" value={metricas.totalRegistros || 0} />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={4}>
          <Card className="!rounded-2xl h-full">
            <Statistic
              title="Productos distintos"
              value={metricas.productosDistintos || 0}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={4}>
          <Card className="!rounded-2xl h-full">
            <Statistic
              title="Unidades aprobadas"
              value={metricas.unidadesAprobadas || 0}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={4}>
          <Card className="!rounded-2xl h-full">
            <Statistic
              title="Unidades pendientes"
              value={metricas.unidadesPendientes || 0}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={4}>
          <Card className="!rounded-2xl h-full">
            <Statistic
              title="Canceladas"
              value={metricas.unidadesCanceladas || 0}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={4}>
          <Card className="!rounded-2xl h-full">
            <Statistic
              title="Ingresos aprobados"
              value={metricas.ingresosAprobados || 0}
              formatter={(valor) => formatearPrecio(valor)}
            />
          </Card>
        </Col>
      </Row>

      <Card className="!rounded-2xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Input
            allowClear
            value={filtros.busqueda}
            prefix={<SearchOutlined />}
            placeholder="Producto, SKU, pedido o cliente"
            onChange={(event) =>
              actualizarFiltro("busqueda", event.target.value)
            }
            onPressEnter={aplicarFiltros}
          />

          <Select
            allowClear
            value={filtros.estadoPedido || undefined}
            placeholder="Estado del pedido"
            options={estadosPedido}
            onChange={(valor) => actualizarFiltro("estadoPedido", valor || "")}
            className="w-full"
          />

          <Select
            allowClear
            value={filtros.estadoPago || undefined}
            placeholder="Estado del pago"
            options={estadosPago}
            onChange={(valor) => actualizarFiltro("estadoPago", valor || "")}
            className="w-full"
          />

          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            value={filtros.categoriaId || undefined}
            placeholder="Categoría"
            options={categoriasDisponibles.map((categoria) => ({
              value: categoria.id,
              label: categoria.nombre,
            }))}
            notFoundContent="No hay categorías compatibles"
            onChange={cambiarCategoria}
            className="w-full"
          />

          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            value={filtros.marcaId || undefined}
            placeholder="Marca"
            options={marcasDisponibles.map((marca) => ({
              value: marca.id,
              label: marca.nombre,
            }))}
            notFoundContent="No hay marcas compatibles"
            onChange={cambiarMarca}
            className="w-full"
          />
          <RangePicker
            className="w-full"
            format="DD/MM/YYYY"
            onChange={cambiarFechas}
          />

          {pestanaActiva === "resumen" && (
            <Select
              value={filtros.ordenarPor}
              options={opcionesOrdenResumen}
              onChange={(valor) => actualizarFiltro("ordenarPor", valor)}
              className="w-full"
            />
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={aplicarFiltros}
              className="!font-bold"
            >
              Buscar
            </Button>

            <Button icon={<ClearOutlined />} onClick={limpiarFiltros}>
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      <Tabs
        activeKey={pestanaActiva}
        onChange={(key) => setPestanaActiva(key)}
        items={[
          {
            key: "detalle",
            label: (
              <span>
                <ShoppingCartOutlined /> Ventas por pedido
              </span>
            ),
            children: contenidoDetalle,
          },
          {
            key: "resumen",
            label: "Resumen por producto",
            children: contenidoResumen,
          },
        ]}
      />
    </div>
  );
}

export default AdminProductosVendidos;
