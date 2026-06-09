import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  Image,
  Upload,
  message,
} from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../context/AuthContext";

import {
  obtenerAnunciosAdmin,
  crearAnuncioAdmin,
  actualizarAnuncioAdmin,
  desactivarAnuncioAdmin,
  reactivarAnuncioAdmin,
  subirImagenAnuncioAdmin,
} from "../../services/adminApi";

const opcionesUbicacion = [
  {
    value: "banner_home",
    label: "Banner principal Home",
  },
  {
    value: "promo_horizontal",
    label: "Promo horizontal",
  },
];

function obtenerNombreUbicacion(ubicacion) {
  const opcion = opcionesUbicacion.find((item) => item.value === ubicacion);
  return opcion?.label || ubicacion;
}

function AdminAnuncios() {
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [anuncioSeleccionado, setAnuncioSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const [form] = Form.useForm();

  const { token } = useAuth();
  const tokenActual = token || localStorage.getItem("token");

  const cargarAnuncios = async () => {
    try {
      setCargando(true);

      const data = await obtenerAnunciosAdmin(tokenActual);

      setAnuncios(data.anuncios || []);
    } catch (error) {
      message.error(error.message || "No se pudieron cargar los anuncios");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    setAnuncioSeleccionado(null);

    form.setFieldsValue({
      titulo: "",
      subtitulo: "",
      imagenUrl: "",
      publicId: "",
      enlace: "/productos",
      ubicacion: "promo_horizontal",
      activo: true,
      orden: 1,
    });

    setModalAbierto(true);
  };

  const abrirModalEditar = (anuncio) => {
    setAnuncioSeleccionado(anuncio);

    form.setFieldsValue({
      titulo: anuncio.titulo || "",
      subtitulo: anuncio.subtitulo || "",
      imagenUrl: anuncio.imagenUrl || "",
      publicId: anuncio.publicId || "",
      enlace: anuncio.enlace || "/productos",
      ubicacion: anuncio.ubicacion || "promo_horizontal",
      activo: anuncio.activo,
      orden: anuncio.orden || 0,
    });

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAnuncioSeleccionado(null);
    form.resetFields();
  };

  const subirImagen = async (archivo) => {
    try {
      setSubiendoImagen(true);

      const data = await subirImagenAnuncioAdmin(tokenActual, archivo);

      form.setFieldsValue({
        imagenUrl: data.imagen.url,
        publicId: data.imagen.publicId,
      });

      message.success("Imagen subida correctamente");
    } catch (error) {
      message.error(error.message || "No se pudo subir la imagen");
    } finally {
      setSubiendoImagen(false);
    }

    return false;
  };

  const guardarAnuncio = async () => {
    try {
      const valores = await form.validateFields();

      setGuardando(true);

      const payload = {
        titulo: valores.titulo || "",
        subtitulo: valores.subtitulo || "",
        imagenUrl: valores.imagenUrl,
        publicId: valores.publicId || "",
        enlace: valores.enlace || "/productos",
        ubicacion: valores.ubicacion,
        activo: valores.activo,
        orden: valores.orden || 0,
      };

      if (anuncioSeleccionado) {
        await actualizarAnuncioAdmin(tokenActual, anuncioSeleccionado.id, payload);
        message.success("Anuncio actualizado correctamente");
      } else {
        await crearAnuncioAdmin(tokenActual, payload);
        message.success("Anuncio creado correctamente");
      }

      cerrarModal();
      cargarAnuncios();
    } catch (error) {
      if (error.errorFields) return;

      message.error(error.message || "No se pudo guardar el anuncio");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (anuncio) => {
    try {
      if (anuncio.activo) {
        await desactivarAnuncioAdmin(tokenActual, anuncio.id);
        message.success("Anuncio desactivado");
      } else {
        await reactivarAnuncioAdmin(tokenActual, anuncio.id);
        message.success("Anuncio activado");
      }

      cargarAnuncios();
    } catch (error) {
      message.error(error.message || "No se pudo cambiar el estado");
    }
  };

  useEffect(() => {
    cargarAnuncios();
  }, []);

  const columnas = [
    {
      title: "Imagen",
      key: "imagen",
      width: 120,
      render: (_, anuncio) =>
        anuncio.imagenUrl ? (
          <Image
            src={anuncio.imagenUrl}
            alt={anuncio.titulo || "Anuncio"}
            width={90}
            height={50}
            className="object-cover rounded-lg border border-gray-200"
          />
        ) : (
          <div className="w-[90px] h-[50px] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
            Sin imagen
          </div>
        ),
    },
    {
      title: "Título",
      key: "titulo",
      render: (_, anuncio) => (
        <div>
          <p className="font-bold m-0">{anuncio.titulo || "Sin título"}</p>
          <p className="text-xs text-gray-500 m-0">
            {anuncio.subtitulo || "Sin subtítulo"}
          </p>
        </div>
      ),
    },
    {
      title: "Ubicación",
      dataIndex: "ubicacion",
      key: "ubicacion",
      render: (ubicacion) => (
        <Tag color="blue">{obtenerNombreUbicacion(ubicacion)}</Tag>
      ),
    },
    {
      title: "Enlace",
      dataIndex: "enlace",
      key: "enlace",
      render: (enlace) => <span className="text-sm">{enlace}</span>,
    },
    {
      title: "Orden",
      dataIndex: "orden",
      key: "orden",
      width: 80,
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
      title: "Acciones",
      key: "acciones",
      width: 230,
      render: (_, anuncio) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => abrirModalEditar(anuncio)}
          >
            Editar
          </Button>

          <Button
            size="small"
            danger={anuncio.activo}
            icon={anuncio.activo ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => cambiarEstado(anuncio)}
          >
            {anuncio.activo ? "Desactivar" : "Activar"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Anuncios</h1>
          <p className="text-gray-500">
            Administra banners, promociones e imágenes del Home.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={cargarAnuncios}
            loading={cargando}
          >
            Actualizar
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={abrirModalCrear}
          >
            Nuevo anuncio
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <Table
          rowKey="id"
          columns={columnas}
          dataSource={anuncios}
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
        title={anuncioSeleccionado ? "Editar anuncio" : "Nuevo anuncio"}
        open={modalAbierto}
        onCancel={cerrarModal}
        onOk={guardarAnuncio}
        confirmLoading={guardando}
        okText={anuncioSeleccionado ? "Guardar cambios" : "Crear anuncio"}
        cancelText="Cancelar"
        width={720}
      >
        <Form layout="vertical" form={form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Título" name="titulo">
              <Input placeholder="Ej: Especial tecnología" />
            </Form.Item>

            <Form.Item label="Subtítulo" name="subtitulo">
              <Input placeholder="Ej: Equipa tu setup con Econnet" />
            </Form.Item>
          </div>

          <Form.Item
            label="Imagen"
            name="imagenUrl"
            rules={[
              {
                required: true,
                message: "La imagen es obligatoria",
              },
            ]}
          >
            <Input placeholder="URL de imagen" />
          </Form.Item>

          <Form.Item label="Public ID" name="publicId">
            <Input placeholder="Public ID de Cloudinary" />
          </Form.Item>

          <div className="mb-5 border border-gray-200 rounded-2xl p-4 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="font-semibold mb-1">Subir imagen</p>
                <p className="text-xs text-gray-500">
                  Sube una imagen para usarla en el anuncio.
                </p>
              </div>

              <Upload
                beforeUpload={subirImagen}
                showUploadList={false}
                accept="image/png,image/jpeg,image/webp"
              >
                <Button icon={<UploadOutlined />} loading={subiendoImagen}>
                  Subir imagen
                </Button>
              </Upload>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Enlace"
              name="enlace"
              rules={[
                {
                  required: true,
                  message: "El enlace es obligatorio",
                },
              ]}
            >
              <Input placeholder="/productos" />
            </Form.Item>

            <Form.Item
              label="Ubicación"
              name="ubicacion"
              rules={[
                {
                  required: true,
                  message: "La ubicación es obligatoria",
                },
              ]}
            >
              <Select options={opcionesUbicacion} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Orden" name="orden">
              <InputNumber min={0} className="w-full" />
            </Form.Item>

            <Form.Item label="Activo" name="activo" valuePropName="checked">
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminAnuncios;