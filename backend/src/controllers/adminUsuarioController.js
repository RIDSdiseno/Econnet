import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";

const convertirBooleano = (valor, defecto = false) => {
    if (valor === undefined || valor === null || valor === "") {
        return defecto;
    }

    return valor === true || valor === "true";
};

const limpiarUsuario = (usuario) => {
    const {
        password,
        contrasena,
        contraseña,
        passwordHash,
        token,
        resetToken,
        ...usuarioLimpio
    } = usuario;

    return usuarioLimpio;
};

export const obtenerUsuariosAdmin = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            orderBy: {
                id: "desc",
            },
        });

        return res.json({
            ok: true,
            usuarios: usuarios.map(limpiarUsuario),
        });
    } catch (error) {
        logger.error("Error al obtener usuarios admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener usuarios",
            detalle: error.message,
        });
    }
};

export const actualizarUsuarioAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol, activo } = req.body;

        const usuarioExiste = await prisma.usuario.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!usuarioExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "Usuario no encontrado",
            });
        }

        const rolesPermitidos = ["cliente", "admin"];

        if (rol !== undefined && !rolesPermitidos.includes(rol)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Rol no válido",
            });
        }

        if (Number(id) === req.usuario.id && activo === false) {
            return res.status(400).json({
                ok: false,
                mensaje: "No puedes desactivar tu propio usuario",
            });
        }

        const usuarioActualizado = await prisma.usuario.update({
            where: {
                id: Number(id),
            },
            data: {
                rol: rol !== undefined ? rol : undefined,
                activo:
                    activo !== undefined
                        ? convertirBooleano(activo, usuarioExiste.activo)
                        : undefined,
            },
        });

        return res.json({
            ok: true,
            mensaje: "Usuario actualizado correctamente",
            usuario: limpiarUsuario(usuarioActualizado),
        });
    } catch (error) {
        logger.error("Error al actualizar usuario admin:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar usuario",
            detalle: error.message,
        });
    }
};