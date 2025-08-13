const normalizeBaseUrl = (url) => {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const VITE_BACKEND_URL = normalizeBaseUrl(
  import.meta.env.VITE_BACKEND_URL || ""
);
const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || "");

// Helper para remover /api do final de qualquer base URL (caso venha errado)
const removeApiSuffix = (url) => url.replace(/\/api$/, "");

export const getFileUrl = (path) => {
  if (!path) return "#";

  let processedPath = path.trim();

  // Se já é uma URL absoluta, retorna imediatamente
  if (/^https?:\/\//i.test(processedPath)) return processedPath;

  // Pode vir, por exemplo: https://meusite.com/api/uploads/arquivo.pdf
  // Queremos remover o começo que coincide com o backend_url
  if (VITE_BACKEND_URL && processedPath.startsWith(VITE_BACKEND_URL)) {
    processedPath = processedPath.slice(VITE_BACKEND_URL.length);
  }

  // Remove /api do começo caso tenha tipo /api/uploads/...
  if (processedPath.startsWith("/api/uploads/")) {
    processedPath = processedPath.replace(/^\/api/, ""); // fica só /uploads/...
  }

  // Split: caso sua base do backend termine com /api, precisamos concatenar corretamente
  let backendBaseNoApi = removeApiSuffix(VITE_BACKEND_URL);

  // Todos os uploads devem sair da base SEM /api
  if (processedPath.startsWith("/uploads/")) {
    return `${backendBaseNoApi}${processedPath}`;
  }

  // Demais casos, use API_BASE_URL (por ex, para rotas API comuns)
  return `${API_BASE_URL}${
    processedPath.startsWith("/") ? processedPath : `/${processedPath}`
  }`;
};
