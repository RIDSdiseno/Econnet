import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Select,
  Table,
  Tag,
  message,
} from "antd";
import {
  CustomerServiceOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../context/AuthContext";
import { obtenerTicketsSoporteAdmin } from "../../services/adminApi";

const categorias = [
  {
    value: "despacho",
    label: "Despacho y seguimiento",
  },
  {
    value: "pagos",
    label: "Pagos",
  },
  {
    value: "documentos",
    label: "Boletas y facturas",
  },
  {
    value: "garantias",
    label: "Garantías",
  },
  {
    value: "devoluciones",
    label: "Devoluciones",
  },
  {
    value: "reembolsos",
    label: "Reembolsos",
  },
  {
    value: "compras_empresas",
    label: "Compras para empresas",
  },
  {
    value: "soporte_tecnico",
    label: "Soporte técnico",
  },
  {
    value: "otro",
    label: "Otro",
  },
];

const estados = [
  {
    value: "nuevo",
    label: "Nuevo",
  },
  {
    value: "en_revision",
    label: "En revisión",
  },
  {
    value: "respondido",
    label: "Respondido",
  },
  {
    value: "cerrado",
    label: "Cerrado",
  },
];

const coloresEstado = {
  nuevo: "blue",
  en_revision: "orange",
  respondido: "green",
  cerrado: "default",
};

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Date(fecha).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obtenerNombreCategoria(categoria) {
  const categoriaEncontrada = categorias.find(
    (item) => item.value === categoria,
  );

  return categoriaEncontrada?.label || categoria || "Sin categoría";
}

function obtenerNombreEstado(estado) {
  const estadoEncontrado = estados.find(
    (item) => item.value === estado,
  );

  return estadoEncontrado?.label || estado || "Sin estado";
}

function AdminSoporte() {
  const navigate = useNavigate();

  const { token } = useAuth();
  const tokenActual =
    token || localStorage.getItem("token");

  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] =
    useState("");

  const [estado, setEstado] = useState("");
  const [categoria, setCategoria] = useState("");

  const [pagina, setPagina] = useState(1);
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 1,
  });

  const cargarTickets = async () => {
    try {
      setCargando(true);

      const data = await obtenerTicketsSoporteAdmin(
        tokenActual,
        {
          pagina,
          limite: 10,
          estado,
          categoria,
          busqueda: busquedaAplicada,
        },
      );

      setTickets(data.tickets || []);

      setPaginacion(
        data.paginacion || {
          pagina: 1,
          limite: 10,
          total: 0,
          totalPaginas: 1,
        },
      );
    } catch (error) {
      console.error(
        "Error cargando solicitudes de soporte:",
        error,
      );

      message.error(
        error.message ||
          "No se pudieron cargar las solicitudes",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!tokenActual) {
      return;
    }

    cargarTickets();
  }, [
    tokenActual,
    pagina,
    estado,
    categoria,
    busquedaAplicada,
  ]);

  const buscar = () => {
    setPagina(1);
    setBusquedaAplicada(busqueda.trim());
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setBusquedaAplicada("");
    setEstado("");
    setCategoria("");
    setPagina(1);
  };

  const columnas = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      width: 190,
      render: (codigo) => (
        <span className="font-bold text-gray-900">
          {codigo}
        </span>
      ),
    },
    {
      title: "Cliente",
      key: "cliente",
      width: 220,
      render: (_, ticket) => (
        <div>
          <p className="font-bold text-gray-900">
            {ticket.nombre}
          </p>

          <p className="text-xs text-gray-500">
            {ticket.email}
          </p>
        </div>
      ),
    },
    {
      title: "Categoría",
      dataIndex: "categoria",
      key: "categoria",
      width: 190,
      render: (valor) => (
        <Tag color="geekblue">
          {obtenerNombreCategoria(valor)}
        </Tag>
      ),
    },
    {
      title: "Asunto",
      dataIndex: "asunto",
      key: "asunto",
      width: 280,
      ellipsis: true,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 130,
      render: (valor) => (
        <Tag color={coloresEstado[valor] || "default"}>
          {obtenerNombreEstado(valor)}
        </Tag>
      ),
    },
    {
      title: "Respuestas",
      key: "respuestas",
      align: "center",
      width: 110,
      render: (_, ticket) =>
        ticket._count?.respuestas || 0,
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: formatearFecha,
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      width: 110,
      render: (_, ticket) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(`/admin/soporte/${ticket.id}`)
          }
        >
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <CustomerServiceOutlined className="text-3xl text-blue-600" />

            <h1 className="text-3xl font-black text-gray-900 m-0">
              Solicitudes de soporte
            </h1>
          </div>

          <p className="text-gray-500 mt-2">
            Revisa y administra los mensajes enviados desde
            el formulario de contacto.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          loading={cargando}
          onClick={cargarTickets}
          className="!h-11 !rounded-xl !font-bold"
        >
          Actualizar
        </Button>
      </div>

      <Card className="!rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_220px_240px_auto] gap-4">
          <Input
            allowClear
            size="large"
            value={busqueda}
            placeholder="Buscar por código, nombre, correo o asunto"
            prefix={<SearchOutlined />}
            onChange={(event) =>
              setBusqueda(event.target.value)
            }
            onPressEnter={buscar}
          />

          <Select
            allowClear
            size="large"
            value={estado || undefined}
            placeholder="Todos los estados"
            options={estados}
            onChange={(valor) => {
              setEstado(valor || "");
              setPagina(1);
            }}
          />

          <Select
            allowClear
            size="large"
            value={categoria || undefined}
            placeholder="Todas las categorías"
            options={categorias}
            onChange={(valor) => {
              setCategoria(valor || "");
              setPagina(1);
            }}
          />

          <div className="flex gap-2">
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              onClick={buscar}
              className="!font-bold"
            >
              Buscar
            </Button>

            <Button
              size="large"
              onClick={limpiarFiltros}
            >
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="!rounded-2xl">
        <Table
          rowKey="id"
          loading={cargando}
          columns={columnas}
          dataSource={tickets}
          scroll={{
            x: 1450,
          }}
          locale={{
            emptyText:
              "No hay solicitudes de soporte para mostrar",
          }}
          pagination={{
            current: paginacion.pagina,
            pageSize: paginacion.limite,
            total: paginacion.total,
            showSizeChanger: false,
            showTotal: (total) =>
              `${total} solicitud${
                total === 1 ? "" : "es"
              }`,
            onChange: (nuevaPagina) => {
              setPagina(nuevaPagina);
            },
          }}
        />
      </Card>
    </div>
  );
}

export default AdminSoporte;