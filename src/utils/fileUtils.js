export const getFileUrl = (path, isApi = false) => {
  if (!path) return "#";
  // Não remove /api/ se for uma requisição de API
  const sanitizedPath = isApi
    ? path
    : path.startsWith("/api/")
    ? path.substring(5)
    : path;
  return `${window.location.origin}${
    sanitizedPath.startsWith("/") ? "" : "/"
  }${sanitizedPath}`;
};
