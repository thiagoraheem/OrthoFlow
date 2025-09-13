import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
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
import { Stethoscope, ArrowLeft, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import orthopedicBackground from "@/assets/orthopedic-background.jpg";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Extrair token da URL
    const urlParts = location.split('/');
    const tokenFromUrl = urlParts[urlParts.length - 1];
    
    if (tokenFromUrl && tokenFromUrl !== 'reset-password') {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      setTokenValid(false);
    }
  }, [location]);

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch('http://localhost:5901/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToValidate }),
      });

      if (response.ok) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        const error = await response.json();
        toast({
          title: "Token inválido",
          description: error.detail || "O link de recuperação é inválido ou expirou.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTokenValid(false);
      toast({
        title: "Erro",
        description: "Erro ao validar token. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5901/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: data.password,
        }),
      });

      if (response.ok) {
        setResetSuccess(true);
        toast({
          title: "Senha redefinida",
          description: "Sua senha foi alterada com sucesso!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.detail || "Erro ao redefinir senha",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
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
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        
        <Card className="w-full max-w-md shadow-medical border-0 bg-gradient-medical-card relative z-10 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-green-500 shadow-medical">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Senha Redefinida!
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 font-medium">
                Sua senha foi alterada com sucesso
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Agora você pode fazer login com sua nova senha.
            </p>
            
            <Link href="/">
              <Button className="w-full h-12 bg-gradient-medical-primary text-white font-semibold hover:shadow-medical-hover transition-all duration-200 transform hover:scale-[1.02]">
                <Shield className="h-4 w-4 mr-2" />
                Ir para Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
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
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        
        <Card className="w-full max-w-md shadow-medical border-0 bg-gradient-medical-card relative z-10 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-red-500 shadow-medical">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Link Inválido
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 font-medium">
                O link de recuperação é inválido ou expirou
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Solicite um novo link de recuperação de senha.
            </p>
            
            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full h-12 bg-gradient-medical-primary text-white font-semibold hover:shadow-medical-hover transition-all duration-200 transform hover:scale-[1.02]">
                  Solicitar Novo Link
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form
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
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-md shadow-medical border-0 bg-gradient-medical-card relative z-10 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-gradient-medical-primary shadow-medical">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-medical-hero bg-clip-text text-transparent">
              Nova Senha
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 font-medium">
              Digite sua nova senha
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          {...field} 
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua nova senha"
                          autoComplete="new-password"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Confirmar Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          {...field} 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua nova senha"
                          autoComplete="new-password"
                          className="h-11 border-2 pr-12 transition-all duration-200 focus:border-medical-primary focus:shadow-medical"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-medical-primary transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
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

              <div className="text-xs text-muted-foreground space-y-1">
                <p>A senha deve conter:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Pelo menos 8 caracteres</li>
                  <li>Uma letra minúscula</li>
                  <li>Uma letra maiúscula</li>
                  <li>Um número</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-medical-primary text-white font-semibold hover:shadow-medical-hover transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Redefinindo...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Redefinir Senha
                  </div>
                )}
              </Button>
            </form>
          </Form>

          <Link href="/">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}