import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import logoLight from "@/assets/logo-light.png";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication with different user types
    const users = {
      "admin": { password: "admin123", role: "admin", name: "Administrador" },
      "techsolutions": { password: "tech123", role: "empresa", name: "Tech Solutions" },
      "joao.silva": { password: "joao123", role: "cliente", name: "João Silva" }
    };

    const user = users[credentials.email as keyof typeof users];
    
    if (user && user.password === credentials.password) {
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
          <img src={logoLight} alt="Grupo Herz" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Herz</h1>
          <p className="text-foreground/70">Acesse suas análises e métricas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Usuário</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="admin, techsolutions ou joao.silva"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
                className="pl-10 bg-background"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                className="pl-10 bg-background"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-background">
            Entrar no Dashboard
          </Button>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Credenciais de teste:</p>
            <p>👨‍💼 Admin: <code className="text-accent">admin / admin123</code></p>
            <p>🏢 Empresa: <code className="text-accent">techsolutions / tech123</code></p>
            <p>👤 Cliente: <code className="text-accent">joao.silva / joao123</code></p>
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
