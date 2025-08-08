import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import apiClient from "../services/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    console.log("[AuthContext] A deslogar o utilizador.");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    delete apiClient.defaults.headers.common["Authorization"];
  }, []);

  const fetchFullUserProfile = useCallback(async () => {
    try {
      console.log(
        "[AuthContext] A buscar o perfil completo do utilizador via /lodgemembers/me..."
      );
      const response = await apiClient.get("lodgemembers/me");
      console.log("[AuthContext] RESPOSTA DA API (/me):", response.data); // LOG CRÍTICO 1
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("[AuthContext] FALHA ao buscar perfil completo:", error);
      logout();
      throw error;
    }
  }, [logout]);

  const checkUserStatus = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    console.log("[AuthContext] A verificar status. Token encontrado:", !!token);
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await fetchFullUserProfile();
    }
    console.log(
      "[AuthContext] Verificação de status concluída. Loading set to false."
    );
    setLoading(false);
  }, [fetchFullUserProfile]);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  const login = async (email, password) => {
    console.log("[AuthContext] Tentativa de login para:", email);
    const response = await apiClient.post("auth/login", {
      Email: email,
      password: password,
    });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("authToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    console.log(
      "[AuthContext] Login bem-sucedido, a buscar perfil completo..."
    );
    const fullUser = await fetchFullUserProfile();
    return fullUser;
  };

  const hasPermission = useCallback(
    (permissionKey) => {
      if (!user || !user.permissions) {
        return false;
      }
      return user.permissions.includes(permissionKey);
    },
    [user]
  );

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    checkUserStatus,
    hasPermission,
  };

  // LOG CRÍTICO 2: Mostra o que está a ser fornecido para a aplicação.
  console.log("[AuthContext] A fornecer para os children:", {
    user,
    loading,
    isAuthenticated: !!user,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };

export const useAuth = () => {
  return useContext(AuthContext);
};