import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
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
import { Stethoscope, ArrowLeft, Mail } from "lucide-react";
import orthopedicBackground from "@/assets/orthopedic-background.jpg";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5901/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Email enviado",
          description: "Verifique sua caixa de entrada para instruções de recuperação.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.detail || "Erro ao enviar email de recuperação",
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

  if (emailSent) {
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
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-medical-hero bg-clip-text text-transparent">
                Email Enviado
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 font-medium">
                Verifique sua caixa de entrada
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Enviamos um link de recuperação para <strong>{form.getValues('email')}</strong>.
              Clique no link para redefinir sua senha.
            </p>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
              </p>
              
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="w-full"
              >
                Tentar Novamente
              </Button>
            </div>
            
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
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-medical-hero bg-clip-text text-transparent">
              Recuperar Senha
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 font-medium">
              Digite seu email para receber instruções
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
                    <FormLabel className="text-foreground font-semibold">Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        placeholder="Digite seu email"
                        autoComplete="email"
                        className="h-11 border-2 transition-all duration-200 focus:border-medical-primary focus:shadow-medical"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-medical-primary text-white font-semibold hover:shadow-medical-hover transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Enviar Link de Recuperação
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