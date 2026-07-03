import { ConfidentialClientApplication } from "@azure/msal-node";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/jwt.js";

const {
    MICROSOFT_CLIENT_ID,
    MICROSOFT_TENANT_ID,
    MICROSOFT_CLIENT_SECRET,
    MICROSOFT_REDIRECT_URI,
    FRONTEND_URL,
} = process.env;

function validarVariablesMicrosoft() {
    const faltantes = [];

    if (!MICROSOFT_CLIENT_ID) faltantes.push("MICROSOFT_CLIENT_ID");
    if (!MICROSOFT_TENANT_ID) faltantes.push("MICROSOFT_TENANT_ID");
    if (!MICROSOFT_CLIENT_SECRET) faltantes.push("MICROSOFT_CLIENT_SECRET");
    if (!MICROSOFT_REDIRECT_URI) faltantes.push("MICROSOFT_REDIRECT_URI");
    if (faltantes.length > 0) {
        throw new Error(`Faltan variables de entorno: ${faltantes.join(", ")}`);
    }
}

function crearMsalClient() {
    return new ConfidentialClientApplication({
        auth: {
            clientId: MICROSOFT_CLIENT_ID,
            authority: "https://login.microsoftonline.com/common",
            clientSecret: MICROSOFT_CLIENT_SECRET,
        },
    });
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
            expiresIn: JWT_EXPIRES_IN,
        }
    );
}

export async function iniciarMicrosoft(req, res) {
    try {
        validarVariablesMicrosoft();

        const msalClient = crearMsalClient();

        const state = jwt.sign(
            {
                provider: "microsoft",
                nonce: crypto.randomUUID(),
            },
            JWT_SECRET,
            {
                expiresIn: "10m",
            }
        );

        const authUrl = await msalClient.getAuthCodeUrl({
            scopes: ["openid", "profile", "email"],
            redirectUri: MICROSOFT_REDIRECT_URI,
            state,
            prompt: "select_account",
        });

        return res.redirect(authUrl);
    } catch (error) {
        console.error("Error iniciando sesión con Microsoft:", error.message);

        return res.redirect(
            `${FRONTEND_URL || "http://localhost:5173"}/login?error=microsoft_config`
        );
    }
}

export async function callbackMicrosoft(req, res) {
    try {
        validarVariablesMicrosoft();

        const { code, state, error, error_description } = req.query;

        if (error) {
            throw new Error(error_description || error);
        }

        if (!code || !state) {
            throw new Error("Microsoft no devolvió code o state.");
        }

        jwt.verify(state, JWT_SECRET);

        const msalClient = crearMsalClient();

        const tokenResponse = await msalClient.acquireTokenByCode({
            code,
            scopes: ["openid", "profile", "email"],
            redirectUri: MICROSOFT_REDIRECT_URI,
        });

        const claims = tokenResponse.idTokenClaims || {};

        const email =
            claims.email ||
            claims.preferred_username ||
            tokenResponse.account?.username;

        const nombre =
            claims.name ||
            tokenResponse.account?.name ||
            email?.split("@")[0] ||
            "Usuario Microsoft";

        if (!email) {
            throw new Error("Microsoft no entregó un correo válido.");
        }

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
        console.error("Error en callback Microsoft completo:");
        console.error("Mensaje:", error.message);
        console.error("Código:", error.errorCode || error.code);
        console.error("Detalle:", error.errorMessage || error.response?.data);

        const mensajeSeguro =
            error.message || "No se pudo iniciar sesión con Microsoft";

        const params = new URLSearchParams({
            error: mensajeSeguro,
        });

        return res.redirect(
            `${FRONTEND_URL || "http://localhost:5173"}/login?${params.toString()}`
        );
    }
}
