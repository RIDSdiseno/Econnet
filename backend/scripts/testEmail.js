import "dotenv/config";
import logger, { serializeError } from "../src/config/logger.js";
import { transporter, emailFrom, emailEnabled } from "../src/config/email.js";

async function main() {
  if (!emailEnabled) {
    logger.info("EMAIL_ENABLED está en false. Cambia a true para probar.");
    return;
  }

  await transporter.verify();

  await transporter.sendMail({
    from: emailFrom,
    to: process.env.SMTP_USER,
    subject: "Prueba correo Econnet",
    html: `
      <h2>Correo de prueba Econnet</h2>
      <p>El envío de correos está funcionando correctamente.</p>
    `,
  });

  logger.info("Correo de prueba enviado correctamente");
}

main().catch((error) => {
  logger.error("Error enviando correo de prueba", serializeError(error));
  process.exit(1);
});
