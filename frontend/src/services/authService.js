import { apiRequest } from "./httpClient";

export const registrarUsuario = async (datos) => {
  return apiRequest("/auth/registro", {
    method: "POST",
    body: datos,
    errorMessage: "Error al registrar usuario",
  });
};

export const loginUsuario = async (datos) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: datos,
    errorMessage: "Error al iniciar sesión",
  });
};

export const obtenerPerfil = async (token) => {
  return apiRequest("/auth/perfil", {
    method: "GET",
    token,
    errorMessage: "Error al obtener perfil",
  });
};

export const actualizarPerfil = async (token, datos) => {
  const data = await apiRequest("/auth/perfil", {
    method: "PUT",
    token,
    body: datos,
    errorMessage: "Error al actualizar perfil",
  });

  return data.usuario;
};

export const cambiarPasswordUsuario = async (token, datos) => {
  return apiRequest("/auth/password", {
    method: "PUT",
    token,
    body: datos,
    errorMessage: "Error al cambiar contraseña",
  });
};

export const obtenerDirecciones = async (token) => {
  const data = await apiRequest("/direcciones", {
    token,
    errorMessage: "Error al obtener direcciones",
  });

  return data.direcciones;
};

export const crearDireccion = async (token, datos) => {
  const data = await apiRequest("/direcciones", {
    method: "POST",
    token,
    body: datos,
    errorMessage: "Error al crear dirección",
  });

  return data.direccion;
};

export const marcarDireccionPrincipal = async (token, id) => {
  const data = await apiRequest(`/direcciones/${id}/principal`, {
    method: "PUT",
    token,
    errorMessage: "Error al marcar dirección principal",
  });

  return data.direccion;
};

export const eliminarDireccionUsuario = async (token, id) => {
  return apiRequest(`/direcciones/${id}`, {
    method: "DELETE",
    token,
    errorMessage: "Error al eliminar dirección",
  });
};
