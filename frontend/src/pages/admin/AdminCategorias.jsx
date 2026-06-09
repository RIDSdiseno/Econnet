import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Switch,
  Table,
  Tag,
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
  obtenerCategoriasAdmin,
  crearCategoriaAdmin,
  actualizarCategoriaAdmin,
  subirImagenCategoriaAdmin,
} from "../../services/adminApi";

function generarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const [form] = Form.useForm();

  const { token } = useAuth();
  const tokenActual = token || localStorage.getItem("token");

  const cargarCategorias = async () => {
    try {
      setCargando(true);

      const data = await obtenerCategoriasAdmin(tokenActual);

      setCategorias(data.categorias || []);
    } catch (error) {
      message.error(error.message || "No se pudieron cargar las categorías");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    setCategoriaSeleccionada(null);

    form.setFieldsValue({
      nombre: "",
      slug: "",
      descripcion: "",
      imagenUrl: "",
      publicId: "",
      activo: true,
      mostrarHome: true,
      ordenHome: 0,
    });

    setModalAbierto(true);
  };

  const abrirModalEditar = (categoria) => {
    setCategoriaSeleccionada(categoria);

    form.setFieldsValue({
      nombre: categoria.nombre,
      slug: categoria.slug,
      descripcion: categoria.descripcion || "",
      imagenUrl: categoria.imagenUrl || "",
      publicId: categoria.publicId || "",
      activo: categoria.activo,
      mostrarHome: categoria.mostrarHome ?? true,
      ordenHome: categoria.ordenHome || 0,
    });

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCategoriaSeleccionada(null);
    form.resetFields();
  };

  const subirImagenCategoria = async (archivo) => {
    try {
      setSubiendoImagen(true);

      const dataUpload = await subirImagenCategoriaAdmin(tokenActual, archivo);

      form.setFieldsValue({
        imagenUrl: dataUpload.imagen.url,
        publicId: dataUpload.imagen.publicId,
      });

      message.success("Imagen de categoría subida correctamente");
    } catch (error) {
      message.error(error.message || "No se pudo subir la imagen");
    } finally {
      setSubiendoImagen(false);
    }

    return false;
  };

  const guardarCategoria = async () => {
    try {
      const valores = await form.validateFields();

      setGuardando(true);

      const payload = {
        nombre: valores.nombre,
        slug: valores.slug || generarSlug(valores.nombre),
        descripcion: valores.descripcion || "",
        imagenUrl: valores.imagenUrl || "",
        publicId: valores.publicId || "",
        activo: valores.activo,
        mostrarHome: valores.mostrarHome,
        ordenHome: valores.ordenHome || 0,
      };

      if (categoriaSeleccionada) {
        await actualizarCategoriaAdmin(
          tokenActual,
          categoriaSeleccionada.id,
          payload,
        );

        message.success("Categoría actualizada correctamente");
      } else {
        await crearCategoriaAdmin(tokenActual, payload);

        message.success("Categoría creada correctamente");
      }

      cerrarModal();
      cargarCategorias();
    } catch (error) {
      if (error.errorFields) return;

      message.error(error.message || "No se pudo guardar la categoría");
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const columnas = [
    {
      title: "Imagen",
      key: "imagen",
      width: 90,
      render: (_, categoria) =>
        categoria.imagenUrl ? (
          <Image
            src={categoria.imagenUrl}
            alt={categoria.nombre}
            width={56}
            height={56}
            className="object-cover rounded-lg border border-gray-200 bg-white"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
            Sin imagen
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
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug) => <span className="text-gray-500">{slug}</span>,
    },
    {
      title: "Home",
      dataIndex: "mostrarHome",
      key: "mostrarHome",
      render: (mostrarHome) => (
        <Tag color={mostrarHome ? "blue" : "default"}>
          {mostrarHome ? "Visible" : "Oculta"}
        </Tag>
      ),
    },
    {
      title: "Orden",
      dataIndex: "ordenHome",
      key: "ordenHome",
      render: (ordenHome) => ordenHome || 0,
    },
    {
      title: "Productos",
      key: "productos",
      render: (_, categoria) => categoria._count?.productos || 0,
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
      render: (_, categoria) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => abrirModalEditar(categoria)}
        >
          Editar
        </Button>
      ),
    },
  ];

  const imagenActual = Form.useWatch("imagenUrl", form);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Categorías</h1>
          <p className="text-gray-500">
            Administra las categorías usadas para organizar los productos.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={cargarCategorias}
            loading={cargando}
          >
            Actualizar
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={abrirModalCrear}
          >
            Nueva categoría
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <Table
          rowKey="id"
          columns={columnas}
          dataSource={categorias}
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
        title={categoriaSeleccionada ? "Editar categoría" : "Nueva categoría"}
        open={modalAbierto}
        onCancel={cerrarModal}
        onOk={guardarCategoria}
        confirmLoading={guardando}
        okText="Guardar"
        cancelText="Cancelar"
        width={680}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: "El nombre es obligatorio" }]}
          >
            <Input placeholder="Ej: Notebooks" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="Ej: notebooks" />
          </Form.Item>

          <Form.Item label="Descripción" name="descripcion">
            <Input.TextArea
              rows={3}
              placeholder="Descripción breve de la categoría"
            />
          </Form.Item>

          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-40">
                {imagenActual ? (
                  <div className="w-40 h-28 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                      src={imagenActual}
                      alt="Categoría"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-28 bg-white border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-xs text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold mb-1">Imagen de categoría</p>
                <p className="text-xs text-gray-500 mb-3">
                  Esta imagen se usará en la sección Explorar categorías del Home.
                </p>

                <Upload
                  beforeUpload={subirImagenCategoria}
                  showUploadList={false}
                  accept="image/png,image/jpeg,image/webp"
                >
                  <Button icon={<UploadOutlined />} loading={subiendoImagen}>
                    Subir imagen
                  </Button>
                </Upload>

                <Form.Item label="URL de imagen" name="imagenUrl" className="mt-4">
                  <Input placeholder="https://..." />
                </Form.Item>

                <Form.Item name="publicId" hidden>
                  <Input />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Mostrar en Home" name="mostrarHome" valuePropName="checked">
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>

            <Form.Item label="Orden en Home" name="ordenHome">
              <InputNumber min={0} className="w-full" placeholder="Ej: 1" />
            </Form.Item>
          </div>

          <Form.Item label="Activa" name="activo" valuePropName="checked">
            <Switch checkedChildren="Sí" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminCategorias;