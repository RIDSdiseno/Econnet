-- AlterTable
ALTER TABLE "newsletter_suscriptores"
ADD COLUMN "unsubscribeToken" TEXT,
ADD COLUMN "unsubscribeTokenCreatedAt" TIMESTAMP(6),
ADD COLUMN "fechaDesuscripcion" TIMESTAMP(6);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_suscriptores_unsubscribeToken_key"
ON "newsletter_suscriptores"("unsubscribeToken");
