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
          setCargandoAuth(false);
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

  const registrar = async (datos) => {
    const data = await registrarUsuario(datos);

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUsuario(data.usuario);

    return data;
  };

  const login = async (datos) => {
    const data = await loginUsuario(datos);

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUsuario(data.usuario);

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

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargandoAuth,
        estaLogueado,
        registrar,
        login,
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