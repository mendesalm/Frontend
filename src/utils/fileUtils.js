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

  // Se já for uma URL absoluta, retorna como está
  if (/^https?:\/\//i.test(processedPath)) return processedPath;

  // Se vim com full URL do backend, remove isso do início
  if (VITE_BACKEND_URL && processedPath.startsWith(VITE_BACKEND_URL)) {
    processedPath = processedPath.slice(VITE_BACKEND_URL.length);
  }

  // `api/uploads` -> remove apenas o `/api` no início, para caso uploads sejam servidos assim
  if (processedPath.startsWith("/api/uploads/")) {
    processedPath = processedPath.replace(/^\/api/, "");
  }

  // Uploads sempre pelo backend
  if (processedPath.startsWith("/uploads/")) {
    return `${VITE_BACKEND_URL}${processedPath}`;
  }

  // Senao, vai para API_BASE_URL
  return `${API_BASE_URL}${
    processedPath.startsWith("/") ? processedPath : `/${processedPath}`
  }`;
};
