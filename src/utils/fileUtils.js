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

  // Normaliza o caminho: remove a barra inicial para uma verificação consistente com 'startsWith'.
  const normalizedPath = processedPath.startsWith('/') ? processedPath.substring(1) : processedPath;

  // Se o caminho normalizado começar com 'uploads', retorne-o com uma barra inicial.
  // Isso garante que arquivos de upload sejam acessados diretamente da raiz do domínio.
  if (normalizedPath.startsWith('uploads')) {
    return `/${normalizedPath}`;
  }

  // Para todos os outros caminhos, que são considerados endpoints de API,
  // adicione o prefixo da API_BASE_URL.
  return `${API_BASE_URL}/${normalizedPath}`;
};
