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
import { Stethoscope, Eye, EyeOff, Shield } from "lucide-react";
import { Link } from "wouter";
import orthopedicBackground from "@/assets/orthopedic-background.jpg";

export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
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
      className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-medical-primary/5 to-medical-accent/10"
      style={{
        backgroundImage: `url(${orthopedicBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-md shadow-medical border-0 bg-gradient-medical-card relative z-10 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-gradient-medical-primary shadow-medical">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-medical-hero bg-clip-text text-transparent">
              OrthoFlow
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 font-medium">
              Sistema de Gestão Ortopédica
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Nome de Usuário</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Digite seu nome de usuário"
                        data-testid="input-username"
                        autoComplete="email"
                        className="h-11 border-2 transition-all duration-200 focus:border-medical-primary focus:shadow-medical"
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
                    <FormLabel className="text-foreground font-semibold">Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          {...field} 
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          data-testid="input-password"
                          autoComplete="current-password"
                          className="h-11 border-2 pr-12 transition-all duration-200 focus:border-medical-primary focus:shadow-medical"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-medical-primary transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-medical-primary text-white font-semibold hover:shadow-medical-hover transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Entrar no Sistema
                    </div>
                  )}
                </Button>
                
                <div className="text-center">
                  <Link href="/forgot-password">
                    <Button variant="link" className="text-medical-primary hover:text-medical-primary/80 font-medium">
                      Esqueci minha senha
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
              <div className="w-2 h-2 rounded-full bg-medical-secondary"></div>
              Usuários de Demonstração
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-medical-primary/5 border border-medical-primary/20">
                <div className="font-semibold text-medical-primary">Administrador</div>
                <div className="text-muted-foreground">admin / admin123</div>
              </div>
              <div className="p-2 rounded-lg bg-medical-secondary/5 border border-medical-secondary/20">
                <div className="font-semibold text-medical-secondary">Médico</div>
                <div className="text-muted-foreground">medico / medico123</div>
              </div>
              <div className="p-2 rounded-lg bg-medical-accent/5 border border-medical-accent/20">
                <div className="font-semibold text-medical-accent">Atendente</div>
                <div className="text-muted-foreground">atendente / atendente123</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="font-semibold text-purple-600">Controlador</div>
                <div className="text-muted-foreground">controlador / controlador123</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}