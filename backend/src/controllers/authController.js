import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const generarToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

export const registrarUsuario = async (req, res) => {
    try {
        const {
            nombre,
            email,
            password,
            telefono,
            rut,
            aceptaTerminos,
            aceptaPromociones,
            aceptaPublicidad,
        } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({
                ok: false,
                mensaje: "Nombre, email y contraseña son obligatorios",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                ok: false,
                mensaje: "La contraseña debe tener al menos 6 caracteres",
            });
        }

        const emailNormalizado = email.toLowerCase().trim();

        const usuarioExiste = await prisma.usuario.findUnique({
            where: {
                email: emailNormalizado,
            },
        });

        if (usuarioExiste) {
            return res.status(400).json({
                ok: false,
                mensaje: "Ya existe una cuenta con este email",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nombre: nombre.trim(),
                email: emailNormalizado,
                passwordHash,
                telefono: telefono || null,
                rut: rut || null,
                aceptaTerminos: Boolean(aceptaTerminos),
                aceptaPromociones: Boolean(aceptaPromociones),
                aceptaPublicidad: Boolean(aceptaPublicidad),
                rol: "cliente",
            },
        });

        const token = generarToken(usuario);

        res.status(201).json({
            ok: true,
            mensaje: "Usuario registrado correctamente",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                rut: usuario.rut,
                aceptaTerminos: usuario.aceptaTerminos,
                aceptaPromociones: usuario.aceptaPromociones,
                aceptaPublicidad: usuario.aceptaPublicidad,
                rol: usuario.rol,
            },
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al registrar usuario",
            error: error.message,
        });
    }
};

export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                mensaje: "Email y contraseña son obligatorios",
            });
        }

        const emailNormalizado = email.toLowerCase().trim();

        const usuario = await prisma.usuario.findUnique({
            where: {
                email: emailNormalizado,
            },
        });

        if (!usuario) {
            return res.status(401).json({
                ok: false,
                mensaje: "Credenciales inválidas",
            });
        }

        if (!usuario.activo) {
            return res.status(403).json({
                ok: false,
                mensaje: "La cuenta está desactivada",
            });
        }

        const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

        if (!passwordValida) {
            return res.status(401).json({
                ok: false,
                mensaje: "Credenciales inválidas",
            });
        }

        const token = generarToken(usuario);

        res.json({
            ok: true,
            mensaje: "Login correcto",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                rut: usuario.rut,
                aceptaTerminos: usuario.aceptaTerminos,
                aceptaPromociones: usuario.aceptaPromociones,
                aceptaPublicidad: usuario.aceptaPublicidad,
                rol: usuario.rol,
            },
        });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al iniciar sesión",
            error: error.message,
        });
    }
};

export const obtenerPerfil = async (req, res) => {
    try {
        res.json({
            ok: true,
            usuario: req.usuario,
        });
    } catch (error) {
        console.error("Error al obtener perfil:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener perfil",
            error: error.message,
        });
    }
};