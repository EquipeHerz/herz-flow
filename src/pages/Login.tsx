import { useState, useEffect } from "react";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import FloatingElements from "@/components/FloatingElements";
import AIAnimations from "@/components/AIAnimations";
import { Checkbox } from "@/components/ui/checkbox";
import { clearRememberedCredentials, loadRememberedCredentials, saveRememberedCredentials } from "@/utils/rememberedCredentials";
import { ApiError } from "@/services/http/apiError";

const Login = () => {
  const { toast } = useToast();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ login: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const c = document.getElementById("chatbot-container");
    if (c) c.remove();
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      const saved = await loadRememberedCredentials();
      if (!saved) return;
      setCredentials({ login: saved.login, password: saved.password });
      setRememberMe(true);
    };
    hydrate();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      fetch("https://n8n.srv1025595.hstgr.cloud/webhook/bdembeddixy?empresa=Embeddixy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).catch(() => {});

      await login({
        login: credentials.login,
        password: credentials.password
      });

      if (rememberMe) {
        await saveRememberedCredentials({ login: credentials.login, password: credentials.password }, 30);
      } else {
        clearRememberedCredentials();
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Dashboard Herz!",
      });
    } catch (error) {
      const description =
        error instanceof ApiError
          ? `${error.message}${error.status ? ` (HTTP ${error.status})` : ""}`
          : error instanceof Error
            ? error.message
            : "Não foi possível realizar login. Verifique suas credenciais.";

      toast({
        title: "Erro no login",
        description,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-hero-start to-hero-end p-4 sm:p-8 relative overflow-hidden">
      <FloatingElements />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-background/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 overflow-hidden min-h-[600px] relative z-10">

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
                <label className="text-sm font-medium text-foreground block">Login</label>
                <Field>
                  <Mail aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Digite seu email"
                    value={credentials.login}
                    onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                    required
                    autoComplete="username"
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </Field>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-foreground select-none">
                  <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(Boolean(v))} />
                  Lembrar-me
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-accent hover:text-accent/80"
                  onClick={() => {
                    clearRememberedCredentials();
                    setRememberMe(false);
                    setCredentials((prev) => ({ ...prev, password: "" }));
                  }}
                >
                  Limpar dados salvos
                </button>
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

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                Para solicitar acesso,{" "}
                <a
                  href="https://wa.me/5554999699949?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20seus%20servi%C3%A7os%21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:text-accent/80"
                >
                  entre em contato
                </a>
                .
              </p>
              <p>
                <a href="/" className="font-medium text-accent hover:text-accent/80">
                  Voltar para o site
                </a>
              </p>
            </div>
          </div>
        </div>

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
