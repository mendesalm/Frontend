const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getFileUrl = (path) => {
  if (!path) {
    return "#";
  }

  let processedPath = path;

  // Se o caminho começar com a VITE_BACKEND_URL, remova-a.
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
  if (VITE_BACKEND_URL && processedPath.startsWith(VITE_BACKEND_URL)) {
    processedPath = processedPath.substring(VITE_BACKEND_URL.length);
  }

  // Se o caminho já for uma URL completa (http/https) após a remoção do VITE_BACKEND_URL, retorne-o como está.
  if (processedPath.startsWith('http://') || processedPath.startsWith('https://')) {
    return processedPath;
  }

  // Remove o prefixo /api/ se ele estiver presente (do backend, por exemplo).
  if (processedPath.startsWith('/api/')) {
    processedPath = processedPath.substring(4); // Remove '/api'
  }

  // Se o caminho já começar com '/uploads/', retorne-o diretamente.
  if (processedPath.startsWith('/uploads/')) {
    return processedPath;
  }

  // Para todos os outros caminhos, que são considerados endpoints de API,
  // adicione o prefixo da API_BASE_URL.
  // Certifique-se de que não haja barras duplas.
  return `${API_BASE_URL}${processedPath.startsWith('/') ? processedPath : '/' + processedPath}`;
};
