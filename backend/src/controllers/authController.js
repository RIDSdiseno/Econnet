import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/jwt.js";


const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
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

    const suscriptorNewsletter = await prisma.newsletterSuscriptor.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    const tieneDescuentoBienvenida =
      Boolean(suscriptorNewsletter) &&
      suscriptorNewsletter.activo === true &&
      suscriptorNewsletter.usado === false;

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: emailNormalizado,
        passwordHash,
        telefono: telefono || null,
        rut: rut || null,
        aceptaTerminos: Boolean(aceptaTerminos),
        aceptaPromociones: Boolean(aceptaPromociones) || tieneDescuentoBienvenida,
        aceptaPublicidad: Boolean(aceptaPublicidad),
        descuentoBienvenidaDisponible: tieneDescuentoBienvenida,
        descuentoBienvenidaUsado: false,
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
        descuentoBienvenidaDisponible: usuario.descuentoBienvenidaDisponible,
        descuentoBienvenidaUsado: usuario.descuentoBienvenidaUsado,
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
        descuentoBienvenidaDisponible: usuario.descuentoBienvenidaDisponible,
        descuentoBienvenidaUsado: usuario.descuentoBienvenidaUsado,
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

export const actualizarPerfil = async (req, res) => {
  try {
    const { telefono, aceptaPromociones, aceptaPublicidad } = req.body;

    const datosActualizar = {};

    if (telefono !== undefined) {
      let telefonoLimpio = String(telefono).trim().replace(/\s+/g, "");

      if (/^9\d{8}$/.test(telefonoLimpio)) {
        telefonoLimpio = `+56${telefonoLimpio}`;
      }

      if (/^569\d{8}$/.test(telefonoLimpio)) {
        telefonoLimpio = `+${telefonoLimpio}`;
      }

      if (!/^\+569\d{8}$/.test(telefonoLimpio)) {
        return res.status(400).json({
          ok: false,
          mensaje: "Ingresa un celular válido. Ejemplo: 912345678",
        });
      }

      datosActualizar.telefono = telefonoLimpio;
    }

    if (aceptaPromociones !== undefined) {
      datosActualizar.aceptaPromociones = Boolean(aceptaPromociones);
    }

    if (aceptaPublicidad !== undefined) {
      datosActualizar.aceptaPublicidad = Boolean(aceptaPublicidad);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: {
        id: req.usuario.id,
      },
      data: datosActualizar,
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rut: true,
        aceptaTerminos: true,
        aceptaPromociones: true,
        aceptaPublicidad: true,
        descuentoBienvenidaDisponible: true,
        descuentoBienvenidaUsado: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      ok: true,
      mensaje: "Perfil actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar perfil",
      error: error.message,
    });
  }
};

export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, nuevaPassword, confirmarPassword } = req.body;

    if (!passwordActual || !nuevaPassword || !confirmarPassword) {
      return res.status(400).json({
        ok: false,
        mensaje: "Todos los campos son obligatorios",
      });
    }

    if (nuevaPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    if (nuevaPassword !== confirmarPassword) {
      return res.status(400).json({
        ok: false,
        mensaje: "Las contraseñas nuevas no coinciden",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: req.usuario.id,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      passwordActual,
      usuario.passwordHash,
    );

    if (!passwordCorrecta) {
      return res.status(400).json({
        ok: false,
        mensaje: "La contraseña actual no es correcta",
      });
    }

    const nuevaPasswordHash = await bcrypt.hash(nuevaPassword, 10);

    await prisma.usuario.update({
      where: {
        id: req.usuario.id,
      },
      data: {
        passwordHash: nuevaPasswordHash,
      },
    });

    res.json({
      ok: true,
      mensaje: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al cambiar contraseña",
      error: error.message,
    });
  }
};
