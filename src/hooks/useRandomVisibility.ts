import { useState, useEffect, useRef } from 'react';

interface VisibilityState {
  [key: string]: boolean;
}

export const useRandomVisibility = (elementIds: string[], interval: number = 3000) => {
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const isInitialized = useRef(false);

  useEffect(() => {
    // Inicializa todos como visíveis apenas uma vez
    if (!isInitialized.current) {
      const initialVisibility: VisibilityState = {};
      elementIds.forEach(id => {
        initialVisibility[id] = true;
      });
      setVisibility(initialVisibility);
      isInitialized.current = true;
    }

    // Função para alternar visibilidade aleatoriamente
    const toggleRandomVisibility = () => {
      setVisibility(prev => {
        const newVisibility = { ...prev };
        const visibleElements = Object.keys(newVisibility).filter(id => newVisibility[id]);
        const hiddenElements = Object.keys(newVisibility).filter(id => !newVisibility[id]);
        
        // Se todos estão visíveis, esconde um aleatório
        if (visibleElements.length === elementIds.length) {
          const randomIndex = Math.floor(Math.random() * visibleElements.length);
          newVisibility[visibleElements[randomIndex]] = false;
        }
        // Se alguns estão escondidos, mostra um aleatório
        else if (hiddenElements.length > 0) {
          const randomIndex = Math.floor(Math.random() * hiddenElements.length);
          newVisibility[hiddenElements[randomIndex]] = true;
        }
        
        return newVisibility;
      });
    };

    // Configura intervalo para alternar visibilidade
    const intervalId = setInterval(toggleRandomVisibility, interval);

    // Limpa o intervalo quando o componente desmonta
    return () => clearInterval(intervalId);
  }, [elementIds, interval]);

  return visibility;
};