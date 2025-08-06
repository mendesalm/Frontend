const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getFileUrl = (path) => {
  if (!path) {
    return "#";
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
};
