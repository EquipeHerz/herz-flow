import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * RouteTransition
 * 
 * Descrição:
 * - Observa mudanças de rota e aplica comportamentos de transição:
 *   scroll suave para o topo, foco no primeiro H1 e indicador visual de carregamento.
 * 
 * Parâmetros:
 * - Nenhum parâmetro direto; utiliza hooks useLocation/useState e efeitos.
 * 
 * Dependências/Requisitos:
 * - React Router (useLocation) para detectar mudanças na URL.
 * - Suporte a CSS animations e fixed positioning para a barra de progresso.
 * 
 * Valor de retorno:
 * - JSX.Element com a barra de transição (ou null quando inativo).
 * 
 * Erros/Exceções:
 * - Em ambientes sem suporte a scroll suave, faz fallback para scroll instantâneo.
 * - Falha ao focar H1 quando não existe; o componente ignora com segurança.
 * 
 * Exemplo:
 *  <BrowserRouter>
 *    <RouteTransition />
 *    <Routes>...</Routes>
 *  </BrowserRouter>
 */
const RouteTransition = () => {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);

    // Scroll para o topo com suavidade (fallback para compatibilidade)
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }

    // Acessibilidade: ao carregar, focar o H1 para leitura imediata do contexto
    const focusHeading = () => {
      const el = document.querySelector("main h1, h1") as HTMLElement | null;
      if (el) {
        el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
        setTimeout(() => el.removeAttribute("tabindex"), 500);
      }
    };
    focusHeading();

    // Encerrar a transição após ~300ms (tempo perceptivo curto)
    const endTransition = () => {
      setTransitioning(false);
    };

    const timer = setTimeout(endTransition, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, location.hash]);

  return transitioning ? (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/10"
    >
      {/* Barra de progresso animada (feedback visual leve durante transições) */}
      <div className="h-full w-0 bg-primary animate-[progress_0.3s_ease-out_forwards]" />
      <style>
        {`
        @keyframes progress {
          from { width: 0% }
          to { width: 100% }
        }
      `}
      </style>
    </div>
  ) : null;
};

export default RouteTransition;
