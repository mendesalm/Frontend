const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getFileUrl = (path) => {
  if (!path) {
    return "#";
  }

  // Se o caminho já for uma URL completa (http/https), retorne-o como está.
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove o prefixo /api/ se ele estiver presente (do backend, por exemplo).
  let processedPath = path;
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
