import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUsuario,
  obtenerPerfil,
  registrarUsuario,
  actualizarPerfil,
} from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        if (!token) {
          setUsuario(null);
          return;
        }

        const data = await obtenerPerfil(token);

        setUsuario(data.usuario);
      } catch (error) {
        console.error("Error al cargar perfil:", error);

        localStorage.removeItem("token");
        setToken(null);
        setUsuario(null);
      } finally {
        setCargandoAuth(false);
      }
    };

    cargarPerfil();
  }, [token]);

  const guardarSesion = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUsuario(data.usuario);
  };

  const registrar = async (datos) => {
    const data = await registrarUsuario(datos);

    guardarSesion(data);

    return data;
  };

  /*
   * Login de clientes.
   * No permite acceder a una cuenta administrativa
   * desde la pantalla pública de clientes.
   */
  const login = async (datos) => {
    const data = await loginUsuario(datos);

    if (data?.usuario?.rol === "admin") {
      throw new Error(
        "Esta cuenta debe ingresar desde el acceso administrativo",
      );
    }

    guardarSesion(data);

    return data;
  };

  /*
   * Login exclusivo para administradores.
   */
  const loginAdmin = async (datos) => {
    const data = await loginUsuario(datos);

    if (data?.usuario?.rol !== "admin") {
      throw new Error(
        "Las credenciales ingresadas no tienen permisos administrativos",
      );
    }

    guardarSesion(data);

    return data;
  };

  const actualizarUsuario = async (datos) => {
    if (!token) {
      throw new Error("No hay sesión activa");
    }

    const usuarioActualizado = await actualizarPerfil(token, datos);

    setUsuario(usuarioActualizado);

    return usuarioActualizado;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUsuario(null);
  };

  const estaLogueado = Boolean(usuario && token);
  const esAdmin = usuario?.rol === "admin";

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargandoAuth,
        estaLogueado,
        esAdmin,
        registrar,
        login,
        loginAdmin,
        actualizarUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}