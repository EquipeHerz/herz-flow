import { useState, useEffect, useCallback } from 'react';

interface TypingBubble {
  id: string;
  text: string;
  position: { x: number; y: number };
  delay: number;
  isActive: boolean;
  isTyping: boolean;
  size: 'small' | 'medium' | 'large';
  arrowDirection: 'top' | 'bottom' | 'left' | 'right';
  typingOnly?: boolean;
  typingDuration?: number;
}

interface TypingSequence {
  bubbleId: string;
  startDelay: number;
  typingDuration: number;
  visibleDuration: number;
  hideDelay: number;
}

export const useTypingBubbles = () => {
  const [bubbles, setBubbles] = useState<TypingBubble[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Configuração dos balões posicionados estrategicamente para grupos de 3
  const bubbleConfigs = [
    {
      id: 'bubble-1',
      text: 'Olá! Como posso ajudar você hoje?',
      angle: -90,
      distance: 160,
      size: 'large' as const,
      arrowDirection: 'bottom' as const
    },
    {
      id: 'bubble-2',
      text: 'Estou processando sua solicitação...',
      angle: -45,
      distance: 150,
      size: 'small' as const,
      arrowDirection: 'bottom' as const,
      typingOnly: true
    },
    {
      id: 'bubble-3',
      text: 'Tenho uma solução perfeita!',
      angle: -135,
      distance: 150,
      size: 'large' as const,
      arrowDirection: 'left' as const
    },
    {
      id: 'bubble-4',
      text: 'Aguarde só um momento...',
      angle: 90,
      distance: 150,
      size: 'medium' as const,
      arrowDirection: 'top' as const
    },
    {
      id: 'bubble-5',
      text: 'Pronto! Tudo resolvido. 😊',
      angle: 45,
      distance: 150,
      size: 'small' as const,
      arrowDirection: 'top' as const,
      typingOnly: true
    },
    {
      id: 'bubble-6',
      text: 'Posso ajudar em mais algo?',
      angle: 135,
      distance: 160,
      size: 'medium' as const,
      arrowDirection: 'right' as const
    }
  ];

  // Calcula posição baseada em ângulo e distância
  const calculatePosition = useCallback((angle: number, distance: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * distance,
      y: Math.sin(radian) * distance
    };
  }, []);

  // Inicializa os balões
  const initializeBubbles = useCallback(() => {
    const initialBubbles: TypingBubble[] = bubbleConfigs.map(config => ({
      id: config.id,
      text: config.text,
      position: calculatePosition(config.angle, config.distance),
      delay: 0,
      isActive: false,
      isTyping: true,
      size: config.size,
      arrowDirection: config.arrowDirection,
      typingOnly: config.typingOnly || false,
      typingDuration: 1500
    }));

    setBubbles(initialBubbles);
  }, [calculatePosition]);

  // Sistema de grupos: 3 balões por grupo, alternando infinitamente
  const createGroupSequence = useCallback(() => {
    const group1 = ['bubble-1', 'bubble-2', 'bubble-3'];
    const group2 = ['bubble-4', 'bubble-5', 'bubble-6'];
    
    return {
      group1: {
        bubbles: group1,
        startTime: 0,
        duration: 10000,
        typingDuration: 1600
      },
      group2: {
        bubbles: group2,
        startTime: 9200,
        duration: 10000,
        typingDuration: 1600
      }
    };
  }, []);

  // Inicia a animação completa com sistema de grupos
  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const groups = createGroupSequence();

    // Anima Grupo 1
    const animateGroup1 = () => {
      // Mostra todos os balões do grupo 1
      groups.group1.bubbles.forEach(bubbleId => {
        setBubbles(prev => prev.map(bubble => 
          bubble.id === bubbleId 
            ? { ...bubble, isActive: true, isTyping: true, typingDuration: groups.group1.typingDuration }
            : bubble
        ));
      });

      // Finaliza digitação no grupo 1
      setTimeout(() => {
        groups.group1.bubbles.forEach(bubbleId => {
          setBubbles(prev => prev.map(bubble => 
            bubble.id === bubbleId 
              ? { ...bubble, isTyping: bubble.typingOnly ? true : false }
              : bubble
          ));
        });
      }, groups.group1.typingDuration);

      // Esconde grupo 1
      setTimeout(() => {
        groups.group1.bubbles.forEach(bubbleId => {
          setBubbles(prev => prev.map(bubble => 
            bubble.id === bubbleId 
              ? { ...bubble, isActive: false }
              : bubble
          ));
        });
      }, groups.group1.duration);
    };

    // Anima Grupo 2
    const animateGroup2 = () => {
      // Mostra todos os balões do grupo 2
      groups.group2.bubbles.forEach(bubbleId => {
        setBubbles(prev => prev.map(bubble => 
          bubble.id === bubbleId 
            ? { ...bubble, isActive: true, isTyping: true, typingDuration: groups.group2.typingDuration }
            : bubble
        ));
      });

      // Finaliza digitação no grupo 2
      setTimeout(() => {
        groups.group2.bubbles.forEach(bubbleId => {
          setBubbles(prev => prev.map(bubble => 
            bubble.id === bubbleId 
              ? { ...bubble, isTyping: bubble.typingOnly ? true : false }
              : bubble
          ));
        });
      }, groups.group2.typingDuration);

      // Esconde grupo 2
      setTimeout(() => {
        groups.group2.bubbles.forEach(bubbleId => {
          setBubbles(prev => prev.map(bubble => 
            bubble.id === bubbleId 
              ? { ...bubble, isActive: false }
              : bubble
          ));
        });
      }, groups.group2.duration);
    };

    // Inicia a sequência de grupos
    animateGroup1();
    setTimeout(animateGroup2, groups.group2.startTime);

    // Reinicia animação após ciclo completo
    const totalDuration = groups.group2.startTime + groups.group2.duration + 800;
    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(startAnimation, 1200);
    }, totalDuration);
  }, [createGroupSequence, isAnimating]);

  // Inicializa e inicia animação
  useEffect(() => {
    initializeBubbles();
    const startTimer = setTimeout(startAnimation, 1000);
    
    return () => {
      clearTimeout(startTimer);
      setIsAnimating(false);
    };
  }, [initializeBubbles, startAnimation]);

  return {
    bubbles,
    isAnimating,
    startAnimation,
    stopAnimation: () => setIsAnimating(false)
  };
};
