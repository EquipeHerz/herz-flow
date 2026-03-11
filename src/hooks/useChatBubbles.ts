import { useState, useEffect, useRef, useCallback } from 'react';

export interface ChatBubble {
  id: string;
  text: string;
  position: number; // ângulo em graus (0-360)
  size: 'small' | 'medium' | 'large';
  isVisible: boolean;
  displayTime: number; // tempo de exibição em ms
  fadeDuration: number; // duração do fade em ms
}

interface BubbleConfig {
  minDisplayTime: number;
  maxDisplayTime: number;
  minFadeDuration: number;
  maxFadeDuration: number;
  radius: number; // raio do círculo em pixels
  centerX: number; // centro X relativo (0-1)
  centerY: number; // centro Y relativo (0-1)
}

const defaultConfig: BubbleConfig = {
  minDisplayTime: 2000,
  maxDisplayTime: 5000,
  minFadeDuration: 300,
  maxFadeDuration: 500,
  radius: 180,
  centerX: 0.5,
  centerY: 0.5
};

export const useChatBubbles = (
  bubbleData: Array<{ id: string; text: string; size?: 'small' | 'medium' | 'large'; angle?: number; distance?: number }>,
  config: Partial<BubbleConfig> = {}
) => {
  // Cria balões estáticos sem animação
  const bubbles: ChatBubble[] = bubbleData.map((data) => ({
    id: data.id,
    text: data.text,
    position: data.angle || 0,
    size: data.size || 'large',
    isVisible: true,
    displayTime: 3000,
    fadeDuration: 400
  }));

  const mergedConfig = { ...defaultConfig, ...config };

  // Função para calcular posição baseada no ângulo
  const calculatePosition = useCallback((angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  }, []);

  // Função para obter estilos de posicionamento
  const getBubbleStyle = (bubble: ChatBubble) => {
    const position = calculatePosition(bubble.position, mergedConfig.radius);
    const baseSize = bubble.size === 'small' ? '160px' : bubble.size === 'large' ? '220px' : '190px';
    
    return {
      position: 'absolute' as const,
      left: `calc(${mergedConfig.centerX * 100}% + ${position.x}px)`,
      top: `calc(${mergedConfig.centerY * 100}% + ${position.y}px)`,
      transform: 'translate(-50%, -50%)',
      width: 'auto',
      maxWidth: baseSize,
      minWidth: '120px',
      opacity: bubble.isVisible ? 1 : 0,
      transition: `opacity ${bubble.fadeDuration}ms ease-in-out`,
      zIndex: 10,
    };
  };

  return {
    bubbles,
    getBubbleStyle,
    config: mergedConfig,
    isInitialized: true
  };
};