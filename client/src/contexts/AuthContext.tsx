import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, AuthContextType, LoginCredentials } from "@shared/auth";
import { apiRequest } from "@/lib/queryClient";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "Dr. Administrador",
    email: "admin@orthocare.com",
    userType: "Administrador" as const,
    isActive: true,
  },
  {
    id: "2", 
    username: "medico",
    password: "medico123",
    name: "Dr. José Silva",
    email: "medico@orthocare.com",
    userType: "Médico" as const,
    isActive: true,
    doctorId: "doctor-id-1",
  },
  {
    id: "3",
    username: "atendente", 
    password: "atendente123",
    name: "Maria Santos",
    email: "atendente@orthocare.com",
    userType: "Atendente" as const,
    isActive: true,
  },
  {
    id: "4",
    username: "controlador",
    password: "controlador123", 
    name: "João Pereira",
    email: "controlador@orthocare.com",
    userType: "Controlador" as const,
    isActive: true,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe usuário logado no localStorage
    const savedUser = localStorage.getItem("orthocare_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("orthocare_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Simular autenticação com usuários demo
      const foundUser = DEMO_USERS.find(
        u => u.username === credentials.username && u.password === credentials.password
      );

      if (foundUser && foundUser.isActive) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("orthocare_user", JSON.stringify(userWithoutPassword));
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
    localStorage.removeItem("orthocare_user");
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