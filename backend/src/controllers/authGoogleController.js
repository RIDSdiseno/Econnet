import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/prisma.js";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  FRONTEND_URL,
  JWT_SECRET,
} = process.env;

function validarVariablesGoogle() {
  const faltantes = [];

  if (!GOOGLE_CLIENT_ID) faltantes.push("GOOGLE_CLIENT_ID");
  if (!GOOGLE_CLIENT_SECRET) faltantes.push("GOOGLE_CLIENT_SECRET");
  if (!GOOGLE_REDIRECT_URI) faltantes.push("GOOGLE_REDIRECT_URI");
  if (!JWT_SECRET) faltantes.push("JWT_SECRET");

  if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(", ")}`);
  }
}

function crearGoogleClient() {
  return new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

function generarTokenEconnet(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function iniciarGoogle(req, res) {
  try {
    validarVariablesGoogle();

    const googleClient = crearGoogleClient();

    const state = jwt.sign(
      {
        provider: "google",
        nonce: crypto.randomUUID(),
      },
      JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    const authUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      prompt: "select_account",
      scope: ["openid", "email", "profile"],
      state,
    });

    return res.redirect(authUrl);
  } catch (error) {
    console.error("Error iniciando sesión con Google:", error.message);

    const params = new URLSearchParams({
      error: "No se pudo iniciar sesión con Google",
    });

    return res.redirect(
      `${FRONTEND_URL || "http://localhost:5173"}/login?${params.toString()}`
    );
  }
}

export async function callbackGoogle(req, res) {
  try {
    validarVariablesGoogle();

    const { code, state, error } = req.query;

    if (error) {
      throw new Error(error);
    }

    if (!code || !state) {
      throw new Error("Google no devolvió code o state.");
    }

    jwt.verify(state, JWT_SECRET);

    const googleClient = crearGoogleClient();

    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
      throw new Error("Google no devolvió id_token.");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new Error("Google no entregó un correo válido.");
    }

    if (payload.email_verified === false) {
      throw new Error("El correo de Google no está verificado.");
    }

    const email = payload.email;
    const nombre =
      payload.name ||
      payload.given_name ||
      email.split("@")[0] ||
      "Usuario Google";

    let usuario = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (!usuario) {
      const passwordTemporal = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(passwordTemporal, 10);

      usuario = await prisma.usuario.create({
        data: {
          nombre,
          email,
          passwordHash,
          rol: "cliente",
          activo: true,
          aceptaTerminos: true,
          aceptaPromociones: false,
          aceptaPublicidad: false,
        },
      });
    }

    if (!usuario.activo) {
      throw new Error("El usuario está desactivado.");
    }

    const token = generarTokenEconnet(usuario);

    const params = new URLSearchParams({
      token,
    });

    return res.redirect(
      `${FRONTEND_URL || "http://localhost:5173"}/auth/callback?${params.toString()}`
    );
  } catch (error) {
    console.error("Error en callback Google:", error.message);

    const params = new URLSearchParams({
      error: error.message || "No se pudo iniciar sesión con Google",
    });

    return res.redirect(
      `${FRONTEND_URL || "http://localhost:5173"}/login?${params.toString()}`
    );
  }
}