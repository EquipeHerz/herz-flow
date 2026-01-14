import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RouteTransition = () => {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);

    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }

    const focusHeading = () => {
      const el = document.querySelector("main h1, h1") as HTMLElement | null;
      if (el) {
        el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
        setTimeout(() => el.removeAttribute("tabindex"), 500);
      }
    };
    focusHeading();

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
