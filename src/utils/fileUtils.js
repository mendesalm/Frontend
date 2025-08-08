const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || '/uploads';

export const getFileUrl = (path) => {
  if (!path) {
    return "#";
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Se o caminho começar com /uploads, use a variável de ambiente para uploads
  if (path.startsWith('/uploads')) {
    // Em desenvolvimento, o proxy do Vite cuidará disso, então retornamos o caminho como está.
    // Em produção, precisamos do caminho completo, mas o proxy não se aplica.
    // A lógica do proxy é para o servidor de desenvolvimento.
    // Para produção, o ideal é que o servidor web (nginx, etc.) sirva os arquivos estáticos.
    // Assumindo que o servidor está configurado para servir /uploads, o caminho relativo deve funcionar.
    return path;
  }

  // Para outros caminhos de API, construa a URL completa.
  return `${API_BASE_URL}${path}`;
};
