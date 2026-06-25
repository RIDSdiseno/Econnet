-- CreateTable
CREATE TABLE "envios_pedido" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "courier" TEXT NOT NULL DEFAULT 'blue_express',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "servicio" TEXT,
    "ordenServicio" TEXT,
    "numeroSeguimiento" TEXT,
    "urlSeguimiento" TEXT,
    "etiquetaUrl" TEXT,
    "costo" INTEGER,
    "pesoGramos" INTEGER,
    "altoCm" INTEGER,
    "anchoCm" INTEGER,
    "largoCm" INTEGER,
    "origenNombre" TEXT,
    "origenDireccion" TEXT,
    "origenComuna" TEXT,
    "origenRegion" TEXT,
    "destinoNombre" TEXT,
    "destinoEmail" TEXT,
    "destinoTelefono" TEXT,
    "destinoDireccion" TEXT,
    "destinoComuna" TEXT,
    "destinoRegion" TEXT,
    "respuestaCourier" JSONB,
    "errorCourier" TEXT,
    "fechaGeneracion" TIMESTAMP(3),
    "fechaUltimaConsulta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envios_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "envios_pedido_pedidoId_idx" ON "envios_pedido"("pedidoId");

-- CreateIndex
CREATE INDEX "envios_pedido_courier_idx" ON "envios_pedido"("courier");

-- CreateIndex
CREATE INDEX "envios_pedido_estado_idx" ON "envios_pedido"("estado");

-- CreateIndex
CREATE INDEX "envios_pedido_numeroSeguimiento_idx" ON "envios_pedido"("numeroSeguimiento");

-- AddForeignKey
ALTER TABLE "envios_pedido" ADD CONSTRAINT "envios_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
