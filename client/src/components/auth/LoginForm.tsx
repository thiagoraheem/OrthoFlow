import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginCredentials } from "@/schemas/validation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stethoscope, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const success = await login(data);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: "Nome de usuário ou senha inválidos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/src/assets/orthopedic-background.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
      
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-medical-text">
            OrthoFlow
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sistema de Gestão Ortopédica
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de Usuário</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Digite seu nome de usuário"
                        data-testid="input-username"
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          {...field} 
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          data-testid="input-password"
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 font-semibold mb-2">Usuários de Demonstração:</p>
            <div className="space-y-2 text-xs text-gray-500">
              <div><strong>Administrador:</strong> admin / admin123</div>
              <div><strong>Médico:</strong> medico / medico123</div>
              <div><strong>Atendente:</strong> atendente / atendente123</div>
              <div><strong>Controlador:</strong> controlador / controlador123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}