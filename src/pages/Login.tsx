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
    
    // Mock authentication - in production, this would be a real API call
    if (credentials.email && credentials.password) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      setTimeout(() => navigate("/dashboard"), 1000);
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
            <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
                className="pl-10 bg-background"
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

          <div className="text-center">
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
