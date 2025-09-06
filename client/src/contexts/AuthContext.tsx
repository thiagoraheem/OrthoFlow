import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, LoginCredentials } from "@/types/api";
import { apiRequest } from "@/lib/queryClient";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL base da API FastAPI
const API_BASE_URL = "http://localhost:8000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe token no localStorage
    const token = localStorage.getItem("orthocare_token");
    if (token) {
      // Verificar se o token ainda é válido
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
         const userData = await response.json();
         setUser({
           id: userData.id,
           username: userData.email,
           name: userData.full_name,
           email: userData.email,
           userType: userData.is_superuser ? "Administrador" : "Atendente",
           isActive: userData.is_active
         });
      } else {
        localStorage.removeItem("orthocare_token");
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      localStorage.removeItem("orthocare_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        
        localStorage.setItem("orthocare_token", token);
        
        // Buscar dados do usuário
        await verifyToken(token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("orthocare_token");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}