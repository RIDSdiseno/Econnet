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
  Popconfirm,
  message,
} from "antd";

import {
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  StarOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../context/AuthContext";

import {
  obtenerProductosAdmin,
  crearProductoAdmin,
  actualizarProductoAdmin,
  obtenerCategoriasAdmin,
  obtenerMarcasAdmin,
  subirImagenProductoAdmin,
  agregarImagenProductoAdmin,
  marcarImagenPrincipalProductoAdmin,
  eliminarImagenProductoAdmin,
  guardarEspecificacionesProductoAdmin,
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

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function calcularDescuentoOferta(precioNormal, precioFinal) {
  const normal = Number(precioNormal) || 0;
  const final = Number(precioFinal) || 0;

  if (normal <= 0 || final <= 0 || final >= normal) {
    return 0;
  }

  return Math.round(((normal - final) / normal) * 100);
}

function obtenerImagenesProducto(producto) {
  return (
    producto?.imagenes
      ?.filter((img) => img.url && img.url.trim() !== "")
      ?.sort((a, b) => {
        if (a.esPrincipal !== b.esPrincipal) {
          return a.esPrincipal ? -1 : 1;
        }

        return (a.orden || 0) - (b.orden || 0);
      }) || []
  );
}

function obtenerImagenPrincipal(producto) {
  const imagenes = obtenerImagenesProducto(producto);
  const principal = imagenes.find((img) => img.esPrincipal);

  return principal?.url || imagenes[0]?.url || null;
}

function obtenerEspecificacionesProducto(producto) {
  return (
    producto?.especificaciones
      ?.filter((esp) => esp.nombre && esp.valor)
      ?.sort((a, b) => (a.orden || 0) - (b.orden || 0)) || []
  );
}

function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const [especificacionesEditables, setEspecificacionesEditables] = useState(
    [],
  );

  const [form] = Form.useForm();
  const enOfertaActiva = Form.useWatch("enOferta", form);
  const precioFormulario = Form.useWatch("precio", form);
  const precioNormalFormulario = Form.useWatch("precioNormal", form);

  const { token } = useAuth();
  const tokenActual = token || localStorage.getItem("token");

  useEffect(() => {
    if (!modalAbierto) return;

    if (!enOfertaActiva) {
      form.setFieldValue("descuento", 0);
      return;
    }

    const descuentoCalculado = calcularDescuentoOferta(
      precioNormalFormulario,
      precioFormulario,
    );

    form.setFieldValue("descuento", descuentoCalculado);
  }, [
    modalAbierto,
    enOfertaActiva,
    precioFormulario,
    precioNormalFormulario,
    form,
  ]);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [productosData, categoriasData, marcasData] = await Promise.all([
        obtenerProductosAdmin(tokenActual),
        obtenerCategoriasAdmin(tokenActual),
        obtenerMarcasAdmin(tokenActual),
      ]);

      const productosRecibidos = productosData.productos || [];

      setProductos(productosRecibidos);
      setCategorias(categoriasData.categorias || []);
      setMarcas(marcasData.marcas || []);

      return productosRecibidos;
    } catch (error) {
      message.error(error.message || "No se pudieron cargar los datos");
      return [];
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    setProductoSeleccionado(null);

    form.setFieldsValue({
      activo: true,
      destacado: false,

      enOferta: false,
      precioNormal: null,
      descuento: 0,
      etiquetaOferta: "",
      etiquetaEnvio: "",
      etiquetaDisponibilidad: "",

      mostrarEnOfertas: false,
      formatoOferta: "small",
      ordenOferta: 0,
    });

    setEspecificacionesEditables([]);
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setProductoSeleccionado(producto);

    form.setFieldsValue({
      nombre: producto.nombre,
      slug: producto.slug,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      stock: producto.stock,
      sku: producto.sku || "",
      modelo: producto.modelo || "",
      garantia: producto.garantia || "",
      categoriaId: producto.categoriaId,
      marcaId: producto.marcaId,
      activo: producto.activo,
      destacado: producto.destacado,

      enOferta: producto.enOferta || false,
      precioNormal: producto.precioNormal || null,
      descuento: producto.descuento || 0,
      etiquetaOferta: producto.etiquetaOferta || "",
      etiquetaEnvio: producto.etiquetaEnvio || "",
      etiquetaDisponibilidad: producto.etiquetaDisponibilidad || "",

      mostrarEnOfertas: producto.mostrarEnOfertas || false,
      formatoOferta: producto.formatoOferta || "small",
      ordenOferta: producto.ordenOferta || 0,
    });

    setEspecificacionesEditables(
      obtenerEspecificacionesProducto(producto).map((esp) => ({
        nombre: esp.nombre,
        valor: esp.valor,
      })),
    );

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
    setEspecificacionesEditables([]);
    form.resetFields();
  };

  const refrescarProductoSeleccionado = async () => {
    const productosActualizados = await cargarDatos();

    if (!productoSeleccionado) return;

    const productoActualizado = productosActualizados.find(
      (producto) => producto.id === productoSeleccionado.id,
    );

    if (productoActualizado) {
      setProductoSeleccionado(productoActualizado);

      setEspecificacionesEditables(
        obtenerEspecificacionesProducto(productoActualizado).map((esp) => ({
          nombre: esp.nombre,
          valor: esp.valor,
        })),
      );
    }
  };

  const limpiarEspecificaciones = () => {
    return especificacionesEditables
      .map((esp) => ({
        nombre: esp.nombre?.trim() || "",
        valor: esp.valor?.trim() || "",
      }))
      .filter((esp) => esp.nombre && esp.valor);
  };

  const guardarProducto = async () => {
    try {
      const valores = await form.validateFields();
      const precioFinal = Number(valores.precio) || 0;
      const precioNormal = Number(valores.precioNormal) || 0;

      if (valores.enOferta && precioNormal <= precioFinal) {
        message.warning(
          "El precio normal debe ser mayor que el precio final para activar una oferta",
        );
        return;
      }

      const descuentoCalculado = valores.enOferta
        ? calcularDescuentoOferta(precioNormal, precioFinal)
        : 0;

      setGuardando(true);

      const payload = {
        nombre: valores.nombre,
        slug: valores.slug,
        descripcion: valores.descripcion,
        precio: valores.precio,
        stock: valores.stock,
        sku: valores.sku,
        modelo: valores.modelo,
        garantia: valores.garantia,
        categoriaId: valores.categoriaId,
        marcaId: valores.marcaId,
        activo: valores.activo,
        destacado: valores.destacado,

        enOferta: valores.enOferta || false,
        precioNormal: valores.enOferta ? valores.precioNormal || null : null,
        descuento: descuentoCalculado,
        etiquetaOferta: valores.etiquetaOferta || "",
        etiquetaEnvio: valores.etiquetaEnvio || "",
        etiquetaDisponibilidad: valores.etiquetaDisponibilidad || "",

        mostrarEnOfertas: valores.mostrarEnOfertas || false,
        formatoOferta: valores.formatoOferta || "small",
        ordenOferta: valores.ordenOferta || 0,
      };
      const especificacionesLimpias = especificacionesEditables
        .map((esp) => ({
          nombre: esp.nombre?.trim() || "",
          valor: esp.valor?.trim() || "",
        }))
        .filter((esp) => esp.nombre && esp.valor);

      let productoIdGuardado = productoSeleccionado?.id;

      if (productoSeleccionado) {
        await actualizarProductoAdmin(
          tokenActual,
          productoSeleccionado.id,
          payload,
        );

        productoIdGuardado = productoSeleccionado.id;
      } else {
        const respuestaCrear = await crearProductoAdmin(tokenActual, payload);

        productoIdGuardado =
          respuestaCrear?.producto?.id ||
          respuestaCrear?.id ||
          respuestaCrear?.productoCreado?.id;

        if (!productoIdGuardado) {
          if (import.meta.env.DEV) {
            console.log("Respuesta crear producto:", respuestaCrear);
          }
          throw new Error("El producto se creó, pero no se recibió su ID");
        }
      }

      await guardarEspecificacionesProductoAdmin(
        tokenActual,
        productoIdGuardado,
        especificacionesLimpias,
      );

      message.success(
        productoSeleccionado
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente",
      );

      cerrarModal();
      await cargarDatos();
    } catch (error) {
      if (error.errorFields) return;

      message.error(error.message || "No se pudo guardar el producto");
    } finally {
      setGuardando(false);
    }
  };

  const subirImagenPrincipal = async (archivo) => {
    if (!productoSeleccionado) {
      message.warning(
        "Primero debes guardar el producto antes de subir imágenes",
      );
      return false;
    }

    try {
      setSubiendoImagen(true);

      const dataUpload = await subirImagenProductoAdmin(tokenActual, archivo);

      await agregarImagenProductoAdmin(tokenActual, productoSeleccionado.id, {
        url: dataUpload.imagen.url,
        publicId: dataUpload.imagen.publicId,
        esPrincipal: true,
        tipo: "principal",
      });

      message.success("Imagen principal subida correctamente");

      await refrescarProductoSeleccionado();
    } catch (error) {
      message.error(error.message || "No se pudo subir la imagen");
    } finally {
      setSubiendoImagen(false);
    }

    return false;
  };

  const subirImagenGaleria = async (archivo) => {
    if (!productoSeleccionado) {
      message.warning(
        "Primero debes guardar el producto antes de subir imágenes",
      );
      return false;
    }

    try {
      setSubiendoImagen(true);

      const dataUpload = await subirImagenProductoAdmin(tokenActual, archivo);

      await agregarImagenProductoAdmin(tokenActual, productoSeleccionado.id, {
        url: dataUpload.imagen.url,
        publicId: dataUpload.imagen.publicId,
        esPrincipal: false,
        tipo: "galeria",
      });

      message.success("Imagen de galería subida correctamente");

      await refrescarProductoSeleccionado();
    } catch (error) {
      message.error(error.message || "No se pudo subir la imagen");
    } finally {
      setSubiendoImagen(false);
    }

    return false;
  };

  const subirImagenOfertaWide = async (archivo) => {
    if (!productoSeleccionado) {
      message.warning(
        "Primero debes guardar el producto antes de subir imágenes",
      );
      return false;
    }

    try {
      setSubiendoImagen(true);

      const dataUpload = await subirImagenProductoAdmin(tokenActual, archivo);

      await agregarImagenProductoAdmin(tokenActual, productoSeleccionado.id, {
        url: dataUpload.imagen.url,
        publicId: dataUpload.imagen.publicId,
        esPrincipal: false,
        tipo: "oferta_wide",
      });

      message.success("Imagen de oferta subida correctamente");

      await refrescarProductoSeleccionado();
    } catch (error) {
      message.error(error.message || "No se pudo subir la imagen de oferta");
    } finally {
      setSubiendoImagen(false);
    }

    return false;
  };

  const marcarComoPrincipal = async (imagenId) => {
    try {
      await marcarImagenPrincipalProductoAdmin(tokenActual, imagenId);

      message.success("Imagen marcada como principal");

      await refrescarProductoSeleccionado();
    } catch (error) {
      message.error(error.message || "No se pudo marcar como principal");
    }
  };

  const eliminarImagen = async (imagenId) => {
    try {
      await eliminarImagenProductoAdmin(tokenActual, imagenId);

      message.success("Imagen eliminada correctamente");

      await refrescarProductoSeleccionado();
    } catch (error) {
      message.error(error.message || "No se pudo eliminar la imagen");
    }
  };

  const agregarFilaEspecificacion = () => {
    setEspecificacionesEditables((prev) => [
      ...prev,
      {
        nombre: "",
        valor: "",
      },
    ]);
  };

  const cambiarEspecificacion = (index, campo, valor) => {
    setEspecificacionesEditables((prev) =>
      prev.map((esp, i) =>
        i === index
          ? {
              ...esp,
              [campo]: valor,
            }
          : esp,
      ),
    );
  };

  const eliminarFilaEspecificacion = (index) => {
    setEspecificacionesEditables((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const columnas = [
    {
      title: "Imagen",
      key: "imagen",
      width: 90,
      render: (_, producto) => {
        const imagen = obtenerImagenPrincipal(producto);

        return imagen ? (
          <Image
            src={imagen}
            alt={producto.nombre}
            width={54}
            height={54}
            className="object-contain bg-white border border-gray-200 rounded-lg p-1"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
            Sin imagen
          </div>
        );
      },
    },
    {
      title: "Producto",
      key: "producto",
      render: (_, producto) => (
        <div>
          <p className="font-bold m-0">{producto.nombre}</p>
          <p className="text-xs text-gray-500 m-0">
            SKU: {producto.sku || "Sin SKU"}
          </p>
        </div>
      ),
    },
    {
      title: "Categoría",
      key: "categoria",
      render: (_, producto) => producto.categoria?.nombre || "Sin categoría",
    },
    {
      title: "Marca",
      key: "marca",
      render: (_, producto) => producto.marca?.nombre || "Sin marca",
    },
    {
      title: "Precio",
      dataIndex: "precio",
      key: "precio",
      render: (precio) => <strong>{formatearPrecio(precio)}</strong>,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <Tag color={stock > 0 ? "green" : "red"}>
          {stock > 0 ? `${stock} disponibles` : "Sin stock"}
        </Tag>
      ),
    },
    {
      title: "Destacado",
      dataIndex: "destacado",
      key: "destacado",
      render: (destacado) => (
        <Tag color={destacado ? "blue" : "default"}>
          {destacado ? "Sí" : "No"}
        </Tag>
      ),
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
      render: (_, producto) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => abrirModalEditar(producto)}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Productos</h1>
          <p className="text-gray-500">
            Administra productos, precios, stock, categorías y marcas.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={cargarDatos}
            loading={cargando}
          >
            Actualizar
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={abrirModalCrear}
          >
            Nuevo producto
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <Table
          rowKey="id"
          columns={columnas}
          dataSource={productos}
          loading={cargando}
          pagination={{
            pageSize: 8,
          }}
          scroll={{
            x: 1200,
          }}
        />
      </Card>

      <Modal
        title={productoSeleccionado ? "Editar producto" : "Nuevo producto"}
        open={modalAbierto}
        onCancel={cerrarModal}
        onOk={guardarProducto}
        confirmLoading={guardando}
        okText={productoSeleccionado ? "Guardar cambios" : "Crear producto"}
        cancelText="Cancelar"
        width={760}
      >
        <Form layout="vertical" form={form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[
                {
                  required: true,
                  message: "El nombre es obligatorio",
                },
              ]}
            >
              <Input placeholder="Ej: Monitor Samsung Odyssey" />
            </Form.Item>

            <Form.Item label="Slug" name="slug">
              <Input placeholder="Ej: monitor-samsung-odyssey" />
            </Form.Item>
          </div>

          <Form.Item label="Descripción" name="descripcion">
            <Input.TextArea rows={3} placeholder="Descripción del producto" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Precio final"
              name="precio"
              rules={[
                {
                  required: true,
                  message: "El precio es obligatorio",
                },
              ]}
            >
              <InputNumber
                min={0}
                step={1000}
                className="w-full"
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value.replace(/\$\s?|(\.*)/g, "")}
              />
            </Form.Item>

            <Form.Item
              label="Stock"
              name="stock"
              rules={[
                {
                  required: true,
                  message: "El stock es obligatorio",
                },
              ]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="SKU" name="sku">
              <Input placeholder="Ej: MON-SAM-001" />
            </Form.Item>

            <Form.Item label="Modelo" name="modelo">
              <Input placeholder="Ej: Odyssey G5" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Categoría"
              name="categoriaId"
              rules={[
                {
                  required: true,
                  message: "La categoría es obligatoria",
                },
              ]}
            >
              <Select
                placeholder="Selecciona una categoría"
                options={categorias
                  .filter((cat) => cat.activo)
                  .map((cat) => ({
                    value: cat.id,
                    label: cat.nombre,
                  }))}
              />
            </Form.Item>

            <Form.Item
              label="Marca"
              name="marcaId"
              rules={[
                {
                  required: true,
                  message: "La marca es obligatoria",
                },
              ]}
            >
              <Select
                placeholder="Selecciona una marca"
                options={marcas
                  .filter((marca) => marca.activo)
                  .map((marca) => ({
                    value: marca.id,
                    label: marca.nombre,
                  }))}
              />
            </Form.Item>
          </div>

          <Form.Item label="Garantía" name="garantia">
            <Input placeholder="Ej: 12 meses" />
          </Form.Item>

          <div className="mb-5 border border-gray-200 rounded-2xl p-4 bg-gray-50">
            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-1">
                Oferta / Promoción
              </p>
              <p className="text-xs text-gray-500">
                Controla si el producto tiene oferta y si aparece en la sección
                Ofertas y Lanzamientos del Home.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Producto en oferta"
                name="enOferta"
                valuePropName="checked"
              >
                <Switch checkedChildren="Sí" unCheckedChildren="No" />
              </Form.Item>

              <Form.Item
                label="Mostrar en Ofertas y Lanzamientos"
                name="mostrarEnOfertas"
                valuePropName="checked"
              >
                <Switch checkedChildren="Sí" unCheckedChildren="No" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="Precio normal" name="precioNormal">
                <InputNumber
                  min={0}
                  step={1000}
                  className="w-full"
                  placeholder="Ej: 189000"
                  formatter={(value) =>
                    value
                      ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                      : ""
                  }
                  parser={(value) => value.replace(/\$\s?|(\.*)/g, "")}
                />
              </Form.Item>

              <Form.Item
                label="Descuento (%)"
                name="descuento"
                extra="Se calcula automáticamente según el precio normal y el precio final."
              >
                <InputNumber
                  min={0}
                  max={100}
                  disabled
                  className="w-full"
                  placeholder="Ej: 21"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item label="Etiqueta oferta" name="etiquetaOferta">
                <Input placeholder="Ej: 34% CYBER" />
              </Form.Item>

              <Form.Item label="Etiqueta envío" name="etiquetaEnvio">
                <Input placeholder="Ej: LLEGA MAÑANA" />
              </Form.Item>

              <Form.Item
                label="Etiqueta disponibilidad"
                name="etiquetaDisponibilidad"
              >
                <Input placeholder="Ej: DISPONIBLE EN TIENDA" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="Formato en ofertas" name="formatoOferta">
                <Select
                  options={[
                    { value: "small", label: "Tarjeta pequeña" },
                    { value: "wide", label: "Oferta grande" },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Orden en ofertas" name="ordenOferta">
                <InputNumber min={0} className="w-full" placeholder="Ej: 1" />
              </Form.Item>
            </div>
          </div>

          {productoSeleccionado && (
            <div className="mb-5 border border-gray-200 rounded-2xl p-4 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold mb-1">Imágenes del producto</p>
                  <p className="text-xs text-gray-500">
                    Para modificar o eliminar especificaciones, edita las filas
                    y luego presiona “Guardar producto”.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Upload
                    beforeUpload={subirImagenPrincipal}
                    showUploadList={false}
                    accept="image/png,image/jpeg,image/webp"
                  >
                    <Button icon={<UploadOutlined />} loading={subiendoImagen}>
                      Subir principal
                    </Button>
                  </Upload>

                  <Upload
                    beforeUpload={subirImagenGaleria}
                    showUploadList={false}
                    accept="image/png,image/jpeg,image/webp"
                  >
                    <Button icon={<UploadOutlined />} loading={subiendoImagen}>
                      Subir galería
                    </Button>
                  </Upload>

                  <Upload
                    beforeUpload={subirImagenOfertaWide}
                    showUploadList={false}
                    accept="image/png,image/jpeg,image/webp"
                  >
                    <Button icon={<UploadOutlined />} loading={subiendoImagen}>
                      Subir oferta wide
                    </Button>
                  </Upload>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Formatos permitidos: JPG, PNG o WEBP. Máximo 5 MB.
              </p>

              {obtenerImagenesProducto(productoSeleccionado).length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 bg-white">
                  Este producto todavía no tiene imágenes.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {obtenerImagenesProducto(productoSeleccionado).map(
                    (imagen) => (
                      <div
                        key={imagen.id}
                        className="bg-white border border-gray-200 rounded-xl p-3 flex gap-3"
                      >
                        <div className="w-24 h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                          <img
                            src={imagen.url}
                            alt="Imagen producto"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {imagen.tipo === "oferta_wide" ? (
                              <Tag color="purple">Oferta wide</Tag>
                            ) : imagen.esPrincipal ? (
                              <Tag color="blue">Principal</Tag>
                            ) : (
                              <Tag>Galería</Tag>
                            )}

                            <Tag color="default">Orden {imagen.orden}</Tag>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-4">
                            {!imagen.esPrincipal && (
                              <Button
                                size="small"
                                icon={<StarOutlined />}
                                onClick={() => marcarComoPrincipal(imagen.id)}
                              >
                                Marcar principal
                              </Button>
                            )}

                            <Popconfirm
                              title="Eliminar imagen"
                              description="¿Seguro que quieres eliminar esta imagen?"
                              okText="Sí, eliminar"
                              cancelText="Cancelar"
                              onConfirm={() => eliminarImagen(imagen.id)}
                            >
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                              >
                                Eliminar
                              </Button>
                            </Popconfirm>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-5 border border-gray-200 rounded-2xl p-4 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold mb-1">Especificaciones técnicas</p>
                <p className="text-xs text-gray-500">
                  Puedes agregar características del producto antes de
                  guardarlo.
                </p>
              </div>

              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={agregarFilaEspecificacion}
              >
                Agregar especificación
              </Button>
            </div>

            {especificacionesEditables.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 bg-white mb-4">
                Este producto todavía no tiene especificaciones.
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {especificacionesEditables.map((especificacion, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto] gap-3 bg-white border border-gray-200 rounded-xl p-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">
                        Característica
                      </p>

                      <Input
                        placeholder="Ej: Capacidad"
                        value={especificacion.nombre}
                        onChange={(e) =>
                          cambiarEspecificacion(index, "nombre", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">
                        Descripción
                      </p>

                      <Input
                        placeholder="Ej: 2TB"
                        value={especificacion.valor}
                        onChange={(e) =>
                          cambiarEspecificacion(index, "valor", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => eliminarFilaEspecificacion(index)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Las especificaciones se guardarán junto con el producto al
              presionar “Guardar producto”.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Producto activo"
              name="activo"
              valuePropName="checked"
            >
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>

            <Form.Item
              label="Producto destacado"
              name="destacado"
              valuePropName="checked"
            >
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminProductos;
