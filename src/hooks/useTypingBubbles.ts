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

  const calculatePosition = useCallback((angle: number, distance: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * distance,
      y: Math.sin(radian) * distance
    };
  }, []);

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

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const groups = createGroupSequence();

    const animateGroup1 = () => {
      groups.group1.bubbles.forEach(bubbleId => {
        setBubbles(prev => prev.map(bubble => 
          bubble.id === bubbleId 
            ? { ...bubble, isActive: true, isTyping: true, typingDuration: groups.group1.typingDuration }
            : bubble
        ));
      });

      setTimeout(() => {
        groups.group1.bubbles.forEach(bubbleId => {
          setBubbles(prev => prev.map(bubble => 
            bubble.id === bubbleId 
              ? { ...bubble, isTyping: bubble.typingOnly ? true : false }
              : bubble
          ));
        });
      }, groups.group1.typingDuration);

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

    const animateGroup2 = () => {
      groups.group2.bubbles.forEach(bubbleId => {
        setBubbles(prev => prev.map(bubble => 
          bubble.id === bubbleId 
            ? { ...bubble, isActive: true, isTyping: true, typingDuration: groups.group2.typingDuration }
            : bubble
        ));
      });

      setTimeout(() => {
        groups.group2.bubbles.forEach(bubbleId => {
          setBubbles(prev => prev.map(bubble => 
            bubble.id === bubbleId 
              ? { ...bubble, isTyping: bubble.typingOnly ? true : false }
              : bubble
          ));
        });
      }, groups.group2.typingDuration);

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

    animateGroup1();
    setTimeout(animateGroup2, groups.group2.startTime);

    const totalDuration = groups.group2.startTime + groups.group2.duration + 800;
    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(startAnimation, 1200);
    }, totalDuration);
  }, [createGroupSequence, isAnimating]);

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
