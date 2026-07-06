import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "antd";

const obtenerMensajeError = (error, mensajePorDefecto) =>
  error?.errores?.[0]?.mensaje ||
  error?.data?.errores?.[0]?.mensaje ||
  error?.mensaje ||
  error?.message ||
  mensajePorDefecto ||
  "Ocurrió un error";

export function useApi(apiFunction, options = {}) {
  const {
    initialData = null,
    onSuccess,
    onError,
    errorMessage,
    showErrorMessage = true,
    rethrow = false,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const resultado = await apiFunction(...args);

        if (mountedRef.current) {
          setData(resultado);
          onSuccess?.(resultado, ...args);
        }

        return resultado;
      } catch (errorCapturado) {
        const mensajeError = obtenerMensajeError(errorCapturado, errorMessage);

        if (mountedRef.current) {
          setError(errorCapturado);
          onError?.(errorCapturado, ...args);

          if (showErrorMessage) {
            message.error(mensajeError);
          }
        }

        if (rethrow) {
          throw errorCapturado;
        }

        return undefined;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [
      apiFunction,
      errorMessage,
      onError,
      onSuccess,
      rethrow,
      showErrorMessage,
    ],
  );

  const reset = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
}

export default useApi;
