const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getFileUrl = (path) => {
  if (!path) {
    return "#";
  }

  // Se o caminho já for uma URL completa (http/https), retorne-o como está.
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Se o caminho começar com '/uploads' ou 'uploads', retorne-o com uma barra inicial.
  // O proxy do Vite (em desenvolvimento) ou a configuração do servidor web (em produção)
  // deve lidar com o roteamento correto para a pasta de uploads.
  if (path.startsWith('/uploads') || path.startsWith('uploads')) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  // Para todos os outros caminhos, que são considerados caminhos de API,
  // adicione o prefixo da API_BASE_URL.
  return `${API_BASE_URL}${path}`;
};
