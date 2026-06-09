import { useEffect, useState } from "react";
import { Button, Card, Form, Input, InputNumber, Modal, Switch, Table, Tag, message } from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerTarifasAdmin,
  actualizarTarifaAdmin,
} from "../../services/adminApi";

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function AdminTarifas() {
  const [tarifas, setTarifas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [form] = Form.useForm();

  const { token } = useAuth();
  const tokenActual = token || localStorage.getItem("token");

  const cargarTarifas = async () => {
    try {
      setCargando(true);

      const data = await obtenerTarifasAdmin(tokenActual);

      setTarifas(data.tarifas || []);
    } catch (error) {
      message.error(error.message || "No se pudieron cargar las tarifas");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalEditar = (tarifa) => {
    setTarifaSeleccionada(tarifa);

    form.setFieldsValue({
      nombre: tarifa.nombre,
      precio: tarifa.precio,
      activo: tarifa.activo,
    });

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTarifaSeleccionada(null);
    form.resetFields();
  };

  const guardarTarifa = async () => {
    try {
      const valores = await form.validateFields();

      setGuardando(true);

      await actualizarTarifaAdmin(tokenActual, tarifaSeleccionada.id, {
        nombre: valores.nombre,
        precio: valores.precio,
        activo: valores.activo,
      });

      message.success("Tarifa actualizada correctamente");
      cerrarModal();
      cargarTarifas();
    } catch (error) {
      if (error.errorFields) return;

      message.error(error.message || "No se pudo actualizar la tarifa");
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    cargarTarifas();
  }, []);

  const columnas = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      render: (codigo) => <strong>{codigo}</strong>,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Precio",
      dataIndex: "precio",
      key: "precio",
      render: (precio) => <strong>{formatearPrecio(precio)}</strong>,
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
      render: (_, tarifa) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => abrirModalEditar(tarifa)}
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
          <h1 className="text-2xl font-bold mb-1">Tarifas de despacho</h1>
          <p className="text-gray-500">
            Edita los precios usados para calcular el despacho en el checkout.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={cargarTarifas}
          loading={cargando}
        >
          Actualizar
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <Table
          rowKey="id"
          columns={columnas}
          dataSource={tarifas}
          loading={cargando}
          pagination={false}
          scroll={{ x: 700 }}
        />
      </Card>

      <Modal
        title="Editar tarifa de despacho"
        open={modalAbierto}
        onCancel={cerrarModal}
        onOk={guardarTarifa}
        confirmLoading={guardando}
        okText="Guardar cambios"
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Nombre" name="nombre" rules={[
            { required: true, message: "El nombre es obligatorio" },
          ]}>
            <Input placeholder="Ej: Gran Santiago" />
          </Form.Item>

          <Form.Item label="Precio" name="precio" rules={[
            { required: true, message: "El precio es obligatorio" },
          ]}>
            <InputNumber
              min={0}
              step={500}
              className="w-full"
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value.replace(/\$\s?|(\.*)/g, "")}
            />
          </Form.Item>

          <Form.Item label="Activa" name="activo" valuePropName="checked">
            <Switch checkedChildren="Sí" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminTarifas;