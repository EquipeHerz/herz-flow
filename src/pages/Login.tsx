import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import FloatingElements from "@/components/FloatingElements";
import AIAnimations from "@/components/AIAnimations";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-hero-start to-hero-end p-4 sm:p-8 relative overflow-hidden">
      <FloatingElements />
      
      {/* Main Card Container - Centered with split layout */}
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-background/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 overflow-hidden min-h-[600px] relative z-10">
        
        {/* Left Column: Login Form */}
        <div className="w-full p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative z-20">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-6">
                <Logo size="lg" className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Bem-vindo de volta</h1>
              <p className="text-muted-foreground mt-2">
                Acesse sua conta para gerenciar seus atendimentos inteligentes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">E-mail</label>
                <Field>
                  <Mail aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    required
                    autoComplete="email"
                    className="pl-10"
                  />
                </Field>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground block">Senha</label>
                  <a href="#" className="text-sm font-medium text-accent hover:text-accent/80">
                    Esqueceu a senha?
                  </a>
                </div>
                <Field>
                  <Lock aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className="pl-10"
                  />
                </Field>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar no Dashboard"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <a href="/" className="font-medium text-accent hover:text-accent/80">
                Voltar para o site
              </a>
            </p>
          </div>
        </div>

        {/* Right Column: Image/Branding */}
        <div className="hidden lg:flex relative bg-muted flex-col justify-end p-12 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90 mix-blend-multiply z-10" />
          <AIAnimations />
          <div className="relative z-20 space-y-6 max-w-lg mx-auto lg:mx-0">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight dark:text-[#ffffff] text-primary-foreground">
              Transforme seu atendimento com Inteligência Artificial
            </h2>
            <p className="text-lg opacity-90 leading-relaxed dark:text-[#e0e0e0] text-primary-foreground/90">
              Gerencie seus agentes, acompanhe métricas em tempo real e revolucione a experiência dos seus clientes.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
