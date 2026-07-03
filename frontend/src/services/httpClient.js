export const API_URL = import.meta.env.VITE_API_URL;

export const buildApiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = API_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

const isFormData = (body) =>
  typeof FormData !== "undefined" && body instanceof FormData;

const parseResponseBody = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const createApiError = (response, data, fallbackMessage) => {
  const error = new Error(
    data?.mensaje || fallbackMessage || "Ocurrió un error al comunicarse con el servidor",
  );

  error.status = response.status;
  error.errores = data?.errores || [];
  error.data = data;

  return error;
};

const buildHeaders = ({ token, headers = {}, body }) => {
  const finalHeaders = {
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  if (
    body !== undefined &&
    body !== null &&
    !isFormData(body) &&
    !finalHeaders["Content-Type"]
  ) {
    finalHeaders["Content-Type"] = "application/json";
  }

  return finalHeaders;
};

const buildBody = (body) => {
  if (body === undefined || body === null || isFormData(body)) {
    return body;
  }

  return JSON.stringify(body);
};

export const apiFetch = (path, options = {}) => {
  const { token, headers, body, ...fetchOptions } = options;

  return fetch(buildApiUrl(path), {
    ...fetchOptions,
    headers: buildHeaders({ token, headers, body }),
    body: buildBody(body),
  });
};

export const apiRequest = async (path, options = {}) => {
  const { errorMessage, ...requestOptions } = options;
  const response = await apiFetch(path, requestOptions);
  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw createApiError(response, data, errorMessage);
  }

  return data;
};
