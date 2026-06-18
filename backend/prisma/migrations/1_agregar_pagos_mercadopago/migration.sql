-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "proveedor" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "monto" INTEGER NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'CLP',
    "referenciaExterna" TEXT NOT NULL,
    "preferenciaId" TEXT,
    "pagoProveedorId" TEXT,
    "estadoProveedor" TEXT,
    "detalleEstado" TEXT,
    "urlPago" TEXT,
    "fechaAprobacion" TIMESTAMP(3),
    "respuestaProveedor" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pago_webhooks" (
    "id" SERIAL NOT NULL,
    "pagoId" INTEGER,
    "proveedor" TEXT NOT NULL,
    "eventoProveedorId" TEXT NOT NULL,
    "recursoId" TEXT,
    "requestId" TEXT,
    "tipo" TEXT,
    "accion" TEXT,
    "procesado" BOOLEAN NOT NULL DEFAULT false,
    "payload" JSONB,
    "error" TEXT,
    "procesadoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pago_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pagos_referenciaExterna_key" ON "pagos"("referenciaExterna");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_preferenciaId_key" ON "pagos"("preferenciaId");

-- CreateIndex
CREATE INDEX "pagos_pedidoId_idx" ON "pagos"("pedidoId");

-- CreateIndex
CREATE INDEX "pagos_proveedor_estado_idx" ON "pagos"("proveedor", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_proveedor_pagoProveedorId_key" ON "pagos"("proveedor", "pagoProveedorId");

-- CreateIndex
CREATE INDEX "pago_webhooks_pagoId_idx" ON "pago_webhooks"("pagoId");

-- CreateIndex
CREATE INDEX "pago_webhooks_proveedor_recursoId_idx" ON "pago_webhooks"("proveedor", "recursoId");

-- CreateIndex
CREATE UNIQUE INDEX "pago_webhooks_proveedor_eventoProveedorId_key" ON "pago_webhooks"("proveedor", "eventoProveedorId");

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago_webhooks" ADD CONSTRAINT "pago_webhooks_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "pagos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

