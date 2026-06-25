import "dotenv/config";
import { transporter, emailFrom, emailEnabled } from "../src/config/email.js";

async function main() {
  if (!emailEnabled) {
    console.log("EMAIL_ENABLED está en false. Cambia a true para probar.");
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

  console.log("Correo de prueba enviado correctamente");
}

main().catch((error) => {
  console.error("Error enviando correo de prueba:", error);
  process.exit(1);
});