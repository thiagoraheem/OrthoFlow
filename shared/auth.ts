import { z } from "zod";

export const userTypes = ["Atendente", "Médico", "Administrador", "Controlador"] as const;

export type UserType = typeof userTypes[number];

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  userType: UserType;
  isActive: boolean;
  doctorId?: string; // Para usuários do tipo "Médico"
}

export const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}