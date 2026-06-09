import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Switch,
  Table,
  Tag,
  Image,
  Upload,
  message,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerMarcasAdmin,
  crearMarcaAdmin,
  actualizarMarcaAdmin,
  subirLogoMarcaAdmin,
} from "../../services/adminApi";

function AdminMarcas() {
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [form] = Form.useForm();

  const { token } = useAuth();
  const tokenActual = token || localStorage.getItem("token");

  const [subiendoLogo, setSubiendoLogo] = useState(false);

  const cargarMarcas = async () => {
    try {
      setCargando(true);

      const data = await obtenerMarcasAdmin(tokenActual);

      setMarcas(data.marcas || []);
    } catch (error) {
      message.error(error.message || "No se pudieron cargar las marcas");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    setMarcaSeleccionada(null);

    form.setFieldsValue({
      nombre: "",
      logoUrl: "",
      activo: true,
      mostrarHome: false,
      grupo: "",
      orden: 0,
    });

    setModalAbierto(true);
  };

  const abrirModalEditar = (marca) => {
    setMarcaSeleccionada(marca);

    form.setFieldsValue({
      nombre: marca.nombre,
      logoUrl: marca.logoUrl || "",
      activo: marca.activo,
      mostrarHome: marca.mostrarHome,
      grupo: marca.grupo || "",
      orden: marca.orden || 0,
    });

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setMarcaSeleccionada(null);
    form.resetFields();
  };

  const guardarMarca = async () => {
    try {
      const valores = await form.validateFields();

      setGuardando(true);

      const payload = {
        nombre: valores.nombre,
        logoUrl: valores.logoUrl || "",
        activo: valores.activo,
        mostrarHome: valores.mostrarHome,
        grupo: valores.grupo || "",
        orden: valores.orden || 0,
      };

      if (marcaSeleccionada) {
        await actualizarMarcaAdmin(tokenActual, marcaSeleccionada.id, payload);
        message.success("Marca actualizada correctamente");
      } else {
        await crearMarcaAdmin(tokenActual, payload);
        message.success("Marca creada correctamente");
      }

      cerrarModal();
      cargarMarcas();
    } catch (error) {
      if (error.errorFields) return;

      message.error(error.message || "No se pudo guardar la marca");
    } finally {
      setGuardando(false);
    }
  };

  const subirLogo = async (archivo) => {
    try {
      setSubiendoLogo(true);

      const data = await subirLogoMarcaAdmin(tokenActual, archivo);

      form.setFieldsValue({
        logoUrl: data.imagen.url,
      });

      message.success("Logo subido correctamente");
    } catch (error) {
      message.error(error.message || "No se pudo subir el logo");
    } finally {
      setSubiendoLogo(false);
    }

    return false;
  };

  useEffect(() => {
    cargarMarcas();
  }, []);

  const columnas = [
    {
      title: "Logo",
      dataIndex: "logoUrl",
      key: "logoUrl",
      width: 90,
      render: (logoUrl) =>
        logoUrl ? (
          <Image
            src={logoUrl}
            alt="Logo marca"
            width={48}
            height={48}
            className="object-contain bg-white border border-gray-200 rounded-lg p-1"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
            Sin logo
          </div>
        ),
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      render: (nombre) => <strong>{nombre}</strong>,
    },
    {
      title: "Grupo",
      dataIndex: "grupo",
      key: "grupo",
      render: (grupo) => grupo || "Sin grupo",
    },
    {
      title: "Orden",
      dataIndex: "orden",
      key: "orden",
      width: 90,
    },
    {
      title: "Home",
      dataIndex: "mostrarHome",
      key: "mostrarHome",
      render: (mostrarHome) => (
        <Tag color={mostrarHome ? "blue" : "default"}>
          {mostrarHome ? "Sí" : "No"}
        </Tag>
      ),
    },
    {
      title: "Productos",
      key: "productos",
      render: (_, marca) => marca._count?.productos || 0,
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      render: (activo) => (
        <Tag color={activo ? "green" : "red"}>
          {activo ? "Activa" : "Inactiva"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, marca) => (
        <Button icon={<EditOutlined />} onClick={() => abrirModalEditar(marca)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Marcas</h1>
          <p className="text-gray-500">
            Administra las marcas de productos y controla cuáles aparecen en el
            Home.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={cargarMarcas}
            loading={cargando}
          >
            Actualizar
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={abrirModalCrear}
          >
            Nueva marca
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <Table
          rowKey="id"
          columns={columnas}
          dataSource={marcas}
          loading={cargando}
          pagination={{
            pageSize: 8,
          }}
          scroll={{
            x: 1000,
          }}
        />
      </Card>

      <Modal
        title={marcaSeleccionada ? "Editar marca" : "Nueva marca"}
        open={modalAbierto}
        onCancel={cerrarModal}
        onOk={guardarMarca}
        confirmLoading={guardando}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: "El nombre es obligatorio" }]}
          >
            <Input placeholder="Ej: Samsung" />
          </Form.Item>

          <Form.Item label="Logo de la marca">
            <Upload
              beforeUpload={subirLogo}
              showUploadList={false}
              accept="image/png,image/jpeg,image/webp"
            >
              <Button icon={<UploadOutlined />} loading={subiendoLogo}>
                Subir logo
              </Button>
            </Upload>

            <p className="text-xs text-gray-500 mt-2">
              Formatos permitidos: JPG, PNG o WEBP. Máximo 5 MB.
            </p>
          </Form.Item>

          <Form.Item label="URL del logo" name="logoUrl">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item shouldUpdate>
            {() => {
              const logoUrl = form.getFieldValue("logoUrl");

              if (!logoUrl) return null;

              return (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Vista previa:</p>

                  <div className="w-32 h-24 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center p-3">
                    <img
                      src={logoUrl}
                      alt="Vista previa logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              );
            }}
          </Form.Item>

          <Form.Item label="Grupo" name="grupo">
            <Input placeholder="Ej: principales, notebooks, monitores" />
          </Form.Item>

          <Form.Item label="Orden" name="orden">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            label="Mostrar en Home"
            name="mostrarHome"
            valuePropName="checked"
          >
            <Switch checkedChildren="Sí" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item label="Activa" name="activo" valuePropName="checked">
            <Switch checkedChildren="Sí" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminMarcas;
