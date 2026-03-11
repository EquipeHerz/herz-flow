import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const c = document.getElementById("chatbot-container");
    if (c) c.remove();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Webhook call (keeping existing functionality)
      try {
        fetch("https://n8n.srv1025595.hstgr.cloud/webhook/bdembeddixy?empresa=Embeddixy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        }).catch(err => console.error("Erro no webhook:", err));
      } catch (err) {
        console.error("Erro ao chamar webhook:", err);
      }

      await login({
        email: credentials.email,
        password: credentials.password
      });

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Dashboard Herz!",
      });
      // Navigation is handled in AuthContext but we can ensure it here too if needed
      // navigate("/dashboard"); 
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos. Verifique suas credenciais.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hero-start to-hero-end relative overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-float-cyan/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-2xl animate-float-delayed" />
      
      <div className="w-full max-w-md p-8 m-4 bg-card rounded-2xl shadow-2xl relative z-10 border border-border/50">
        <div className="text-center mb-8">
          <Logo size="xl" className="mx-auto mb-4 text-accent" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Herz</h1>
          <p className="text-foreground/70">Acesse suas análises e métricas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">E-mail</label>
            <Field>
              <Mail aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
                autoComplete="email"
              />
            </Field>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Senha</label>
            <Field>
              <Lock aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </Field>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-background"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar no Dashboard"}
          </Button>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <p className="font-semibold mb-2">Credenciais de teste (Senha: 12345678):</p>
            <div className="grid gap-1">
              <p>👑 Admin: <code className="text-accent">admin@sistema.com</code></p>
              <p>🏢 Empresa: <code className="text-accent">admin@empresa.com</code></p>
              <p>📂 Setor: <code className="text-accent">admin@setor.com</code></p>
              <p>👤 Operador: <code className="text-accent">operador@empresa.com</code></p>
            </div>
          </div>

          <div className="text-center mt-4">
            <a href="/" className="text-sm text-accent hover:underline">
              Voltar para o site
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
