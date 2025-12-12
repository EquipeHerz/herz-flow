import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  useEffect(() => {
    const c = document.getElementById("chatbot-container");
    if (c) c.remove();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const users = {
      "grupoherz": { role: "admin", name: "Administrador", envKey: "VITE_ADMIN_PASSWORD" },
      "techsolutions": { role: "empresa", name: "Tech Solutions", envKey: "VITE_EMPRESA_PASSWORD" },
      "joao.silva": { role: "cliente", name: "João Silva", envKey: "VITE_CLIENTE_PASSWORD" }
    } as const;

    const user = users[credentials.email as keyof typeof users];
    
    const env = import.meta.env as Record<string, string>;
    const envPassword = user ? env[user.envKey] : undefined;
    
    if (user && envPassword && credentials.password === envPassword) {
      // Save session to localStorage
      localStorage.setItem("userSession", JSON.stringify({
        username: credentials.email,
        role: user.role,
        name: user.name,
        loginTime: new Date().toISOString()
      }));

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${user.name}!`,
      });
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos.",
        variant: "destructive"
      });
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
            <label className="text-sm font-medium text-foreground mb-2 block">Usuário</label>
            <Field>
              <Mail aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Informe seu usuário"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
                autoComplete="username"
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

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-background">
            Entrar no Dashboard
          </Button>

          {/*
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Credenciais de teste:</p>
            <p>👨‍💼 Admin: <code className="text-accent">admin / admin123</code></p>
            <p>🏢 Empresa: <code className="text-accent">techsolutions / tech123</code></p>
            <p>👤 Cliente: <code className="text-accent">joao.silva / joao123</code></p>
          </div>
          */}

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
