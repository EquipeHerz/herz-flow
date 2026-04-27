import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type FeatureDisabledProps = {
  title?: string;
  description?: string;
  backTo?: string;
};

const FeatureDisabled = ({
  title = "Funcionalidade desativada",
  description = "Esta funcionalidade está temporariamente desabilitada neste ambiente.",
  backTo = "/dashboard",
}: FeatureDisabledProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-hero-start to-hero-end p-4 sm:p-8">
      <div className="w-full max-w-xl bg-background/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-8 sm:p-10">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => navigate(backTo)}>
            Voltar
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/")}>
            Ir para a página inicial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeatureDisabled;

