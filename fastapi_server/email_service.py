import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from jinja2 import Template

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("SMTP_FROM_EMAIL")
        self.from_name = os.getenv("SMTP_FROM_NAME", "OrthoFlow")
    
    def _create_smtp_connection(self):
        """Cria conexão SMTP."""
        try:
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            return server
        except Exception as e:
            print(f"Erro ao conectar com SMTP: {e}")
            return None
    
    def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str, 
        text_content: Optional[str] = None
    ) -> bool:
        """Envia email."""
        try:
            # Verificar se as configurações estão definidas
            if not all([self.smtp_username, self.smtp_password, self.from_email]):
                print("Configurações de email não definidas")
                return False
            
            # Criar mensagem
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Adicionar conteúdo texto se fornecido
            if text_content:
                text_part = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(text_part)
            
            # Adicionar conteúdo HTML
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Enviar email
            server = self._create_smtp_connection()
            if server:
                server.send_message(msg)
                server.quit()
                return True
            
            return False
            
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
            return False
    
    def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str) -> bool:
        """Envia email de recuperação de senha."""
        # URL base do frontend (pode ser configurável)
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Template HTML do email
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperação de Senha - OrthoFlow</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🦴 OrthoFlow</h1>
                    <h2>Recuperação de Senha</h2>
                </div>
                <div class="content">
                    <p>Olá <strong>{{ user_name }}</strong>,</p>
                    
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta no OrthoFlow.</p>
                    
                    <p>Para criar uma nova senha, clique no botão abaixo:</p>
                    
                    <div style="text-align: center;">
                        <a href="{{ reset_url }}" class="button">Redefinir Senha</a>
                    </div>
                    
                    <div class="warning">
                        <p><strong>⚠️ Importante:</strong></p>
                        <ul>
                            <li>Este link é válido por apenas <strong>1 hora</strong></li>
                            <li>Se você não solicitou esta alteração, ignore este email</li>
                            <li>Nunca compartilhe este link com outras pessoas</li>
                        </ul>
                    </div>
                    
                    <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                    <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px; font-family: monospace;">{{ reset_url }}</p>
                </div>
                <div class="footer">
                    <p>Este é um email automático, não responda.</p>
                    <p>© 2024 OrthoFlow - Sistema de Gestão Ortopédica</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        # Template de texto simples
        text_content = f"""
        OrthoFlow - Recuperação de Senha
        
        Olá {user_name},
        
        Recebemos uma solicitação para redefinir a senha da sua conta no OrthoFlow.
        
        Para criar uma nova senha, acesse o link abaixo:
        {reset_url}
        
        IMPORTANTE:
        - Este link é válido por apenas 1 hora
        - Se você não solicitou esta alteração, ignore este email
        - Nunca compartilhe este link com outras pessoas
        
        Este é um email automático, não responda.
        © 2024 OrthoFlow - Sistema de Gestão Ortopédica
        """
        
        # Renderizar template HTML
        html_content = html_template.render(
            user_name=user_name,
            reset_url=reset_url
        )
        
        # Enviar email
        return self.send_email(
            to_email=to_email,
            subject="🔐 Recuperação de Senha - OrthoFlow",
            html_content=html_content,
            text_content=text_content
        )

# Instância global do serviço de email
email_service = EmailService()