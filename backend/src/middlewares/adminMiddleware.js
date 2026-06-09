export const soloAdmin = (req, res, next) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({
                ok: false,
                mensaje: "No autenticado",
            });
        }

        if (req.usuario.rol !== "admin") {
            return res.status(403).json({
                ok: false,
                mensaje: "No tienes permisos de administrador",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: "Error al validar permisos de administrador",
        });
    }
};