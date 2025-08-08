const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getFileUrl = (path) => {
  if (!path) {
    return "#";
  }

  // Se o caminho já for uma URL completa, retorne-o como está.
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Normaliza o caminho para remover a barra inicial, se houver.
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;

  // Verifica se o caminho normalizado começa com 'uploads'.
  if (normalizedPath.startsWith('uploads')) {
    // Para desenvolvimento, o proxy do Vite cuidará do caminho relativo.
    // Para produção, o servidor web (nginx, etc.) deve ser configurado para servir a pasta de uploads.
    // Retornar o caminho com a barra inicial garante que ele seja relativo à raiz do domínio.
    return `/${normalizedPath}`;
  }

  // Para todos os outros caminhos de API, construa a URL completa com o prefixo da API.
  return `${API_BASE_URL}/${normalizedPath}`;
};
