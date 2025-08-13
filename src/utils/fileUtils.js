const normalizeBaseUrl = (url) => {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const VITE_BACKEND_URL = normalizeBaseUrl(
  import.meta.env.VITE_BACKEND_URL || ""
);
const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || "");

export const getFileUrl = (path) => {
  if (!path) return "#";
  let processedPath = path.trim();

  // Remove a URL completa do backend se estiver incluída
  if (VITE_BACKEND_URL && processedPath.startsWith(VITE_BACKEND_URL)) {
    processedPath = processedPath.slice(VITE_BACKEND_URL.length);
  }

  // Se já for uma URL absoluta, retorna como está
  if (/^https?:\/\//i.test(processedPath)) {
    return processedPath;
  }

  // Remove prefixo /api/ caso exista
  if (processedPath.startsWith("/api/")) {
    processedPath = processedPath.slice(4);
  }

  // Se for arquivo em /uploads/, monta URL plena do backend:
  if (processedPath.startsWith("/uploads/")) {
    return `${VITE_BACKEND_URL}${processedPath}`;
  }

  // Para qualquer outro caso, considera endpoint da API
  return `${API_BASE_URL}${
    processedPath.startsWith("/") ? processedPath : `/${processedPath}`
  }`;
};
