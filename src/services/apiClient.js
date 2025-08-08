import axios from "axios";

const apiBaseUrl =
  import.meta.env.MODE === "development"
    ? ""
    : `${import.meta.env.VITE_API_BASE_URL || ""}`;

console.log("API Base URL:", apiBaseUrl);

// Cria a instância base do cliente Axios
const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

// Interceptor de Requisição: Adiciona o token a cada chamada
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Função para tentar renovar o token
const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("Refresh token não disponível.");
  }

  try {
    // Usa uma instância limpa do axios para a renovação para evitar um loop de interceptores
    const response = await apiClient.post(`/auth/refresh-token`, {
      token: refreshToken,
    });
    const { token: newAuthToken } = response.data;

    localStorage.setItem("authToken", newAuthToken);
    return newAuthToken;
  } catch (error) {
    console.error("Falha ao renovar o token:", error);
    // Limpa os tokens inválidos e redireciona
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login"; // CORREÇÃO: Redireciona para a página de login correta
    throw new Error("Sessão expirada. Por favor, faça login novamente.");
  }
};

// Interceptor de Resposta: Lida com erros e tenta renovar o token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verifica se o erro é 401 e se ainda não tentámos renovar o token para esta requisição
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAuthToken = await refreshAuthToken();

        // Atualiza o header no apiClient e na requisição original
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAuthToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAuthToken}`;

        // Tenta novamente a requisição original com o novo token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Se a renovação falhar, rejeita a promessa
        return Promise.reject(refreshError);
      }
    }

    // Para todos os outros erros, apenas os propaga
    return Promise.reject(error);
  }
);

export default apiClient;