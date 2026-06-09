import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerUsuariosAdmin,
  actualizarUsuarioAdmin,
} from "../../services/adminApi";

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [form] = Form.useForm();

  const { token, usuario } = useAuth();
  const tokenActual = token || localStorage.getItem("token");

  const cargarUsuarios = async () => {
    try {
      setCargando(true);

      const data = await obtenerUsuariosAdmin(tokenActual);

      setUsuarios(data.usuarios || []);
    } catch (error) {
      message.error(error.message || "No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalEditar = (usuarioItem) => {
    setUsuarioSeleccionado(usuarioItem);

    form.setFieldsValue({
      rol: usuarioItem.rol || "cliente",
      activo: usuarioItem.activo,
    });

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    form.resetFields();
  };

  const guardarUsuario = async () => {
    try {
      const valores = await form.validateFields();

      setGuardando(true);

      await actualizarUsuarioAdmin(tokenActual, usuarioSeleccionado.id, {
        rol: valores.rol,
        activo: valores.activo,
      });

      message.success("Usuario actualizado correctamente");

      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      if (error.errorFields) return;

      message.error(error.message || "No se pudo actualizar el usuario");
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const columnas = [
    {
      title: "Usuario",
      key: "usuario",
      render: (_, item) => (
        <div>
          <p className="font-bold m-0">{item.nombre || "Sin nombre"}</p>
          <p className="text-xs text-gray-500 m-0">{item.email}</p>
        </div>
      ),
    },
    {
      title: "RUT",
      dataIndex: "rut",
      key: "rut",
      render: (rut) => rut || "Sin RUT",
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
      render: (telefono) => telefono || "Sin teléfono",
    },
    {
      title: "Rol",
      dataIndex: "rol",
      key: "rol",
      render: (rol) => (
        <Tag color={rol === "admin" ? "purple" : "blue"}>
          {rol === "admin" ? "Admin" : "Cliente"}
        </Tag>
      ),
    },
    {
      title: "Pedidos",
      key: "pedidos",
      render: (_, item) => item._count?.pedidos || 0,
    },
    {
      title: "Direcciones",
      key: "direcciones",
      render: (_, item) => item._count?.direcciones || 0,
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      render: (activo) => (
        <Tag color={activo ? "green" : "red"}>
          {activo ? "Activo" : "Inactivo"}
        </Tag>
      ),
    },
    {
      title: "Registro",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (fecha) => formatearFecha(fecha),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, item) => (
        <Button icon={<EditOutlined />} onClick={() => abrirModalEditar(item)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Usuarios</h1>
          <p className="text-gray-500">
            Administra cuentas registradas, roles y estado de acceso.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={cargarUsuarios}
          loading={cargando}
        >
          Actualizar
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <Table
          rowKey="id"
          columns={columnas}
          dataSource={usuarios}
          loading={cargando}
          pagination={{
            pageSize: 8,
          }}
          scroll={{
            x: 1100,
          }}
        />
      </Card>

      <Modal
        title="Editar usuario"
        open={modalAbierto}
        onCancel={cerrarModal}
        onOk={guardarUsuario}
        confirmLoading={guardando}
        okText="Guardar cambios"
        cancelText="Cancelar"
      >
        {usuarioSeleccionado && (
          <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p className="font-bold mb-1">
              {usuarioSeleccionado.nombre || "Sin nombre"}
            </p>
            <p className="text-sm text-gray-500 mb-0">
              {usuarioSeleccionado.email}
            </p>
          </div>
        )}

        <Form layout="vertical" form={form}>
          <Form.Item
            label="Rol"
            name="rol"
            rules={[{ required: true, message: "El rol es obligatorio" }]}
          >
            <Select
              options={[
                { value: "cliente", label: "Cliente" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Usuario activo" name="activo" valuePropName="checked">
            <Switch
              checkedChildren="Activo"
              unCheckedChildren="Inactivo"
              disabled={usuarioSeleccionado?.id === usuario?.id}
            />
          </Form.Item>

          {usuarioSeleccionado?.id === usuario?.id && (
            <p className="text-xs text-gray-500">
              No puedes desactivar tu propio usuario administrador.
            </p>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default AdminUsuarios;