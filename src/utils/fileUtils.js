const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getFileUrl = (path) => {
  if (!path) {
    return "#";
  }

  // Se o caminho já for uma URL completa (http/https), retorne-o como está.
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove o prefixo /api/ se ele estiver presente, pois o backend pode retornar caminhos com ele.
  let cleanedPath = path;
  if (cleanedPath.startsWith('/api/')) {
    cleanedPath = cleanedPath.substring(4); // Remove '/api'
  }

  // Se o caminho limpo começar com 'uploads', retorne-o com uma barra inicial.
  // O proxy do Vite (em desenvolvimento) ou a configuração do servidor web (em produção)
  // deve lidar com o roteamento correto para a pasta de uploads.
  if (cleanedPath.startsWith('uploads')) {
    return `/${cleanedPath}`;
  }

  // Para todos os outros caminhos, que são considerados caminhos de API,
  // adicione o prefixo da API_BASE_URL.
  return `${API_BASE_URL}/${cleanedPath}`;
};
