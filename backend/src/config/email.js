import nodemailer from "nodemailer";

export const emailEnabled = process.env.EMAIL_ENABLED === "true";

export const emailFrom = `"${process.env.EMAIL_FROM_NAME || "Econnet"}" <${
  process.env.EMAIL_FROM || process.env.SMTP_USER
}>`;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});