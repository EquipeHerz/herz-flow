import React, { useState, useEffect } from 'react';

interface ChatTypingBubbleProps {
  text: string;
  position: { x: number; y: number };
  delay?: number;
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark';
  arrowDirection?: 'top' | 'bottom' | 'left' | 'right';
  typingOnly?: boolean;
  typingDuration?: number;
  variant?: 'accent' | 'primary' | 'secondary' | 'muted';
  movementClass?: string;
}

const ChatTypingBubble: React.FC<ChatTypingBubbleProps> = ({
  text,
  position,
  delay = 0,
  isActive = true,
  size = 'medium',
  theme = 'light',
  arrowDirection = 'bottom',
  typingOnly = false,
  typingDuration = 1500,
  variant = 'accent',
  movementClass = 'chat-bubble-float'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      setIsTyping(true);
      if (!typingOnly) {
        const t = setTimeout(() => setIsTyping(false), typingDuration);
        return () => clearTimeout(t);
      }
    } else {
      setIsVisible(false);
      setIsTyping(true);
    }
  }, [isActive, typingOnly, typingDuration]);

  const getBubbleClasses = () => {
    const base = 'rounded-2xl shadow-lg border bg-card text-card-foreground backdrop-blur-sm transition-all duration-500 ease-out';
    const sizeClasses = {
      small: 'text-xs px-3 py-2 max-w-[140px]',
      medium: 'text-sm px-4 py-3 max-w-[180px]',
      large: 'text-sm px-5 py-4 max-w-[220px]'
    };
    const variantBorder = {
      accent: 'border-accent/40',
      primary: 'border-primary/40',
      secondary: 'border-secondary/40',
      muted: 'border-muted/40'
    }[variant];
    
    return `${base} ${sizeClasses[size]} font-medium ${variantBorder}`;
  };

  const getArrowClasses = () => {
    const base = 'absolute w-0 h-0 border-transparent';
    const arrowSize = '6';
    
    const positions = {
      top: `bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-b-${arrowSize} border-l-${arrowSize} border-r-${arrowSize}`,
      bottom: `top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-t-${arrowSize} border-l-${arrowSize} border-r-${arrowSize}`,
      left: `right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-r-${arrowSize} border-t-${arrowSize} border-b-${arrowSize}`,
      right: `left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-l-${arrowSize} border-t-${arrowSize} border-b-${arrowSize}`
    };

    if (arrowDirection === 'top') {
      return `${positions.top} border-b-[hsl(var(--card))]`;
    } else if (arrowDirection === 'bottom') {
      return `${positions.bottom} border-t-[hsl(var(--card))]`;
    } else if (arrowDirection === 'left') {
      return `${positions.left} border-r-[hsl(var(--card))]`;
    } else {
      return `${positions.right} border-l-[hsl(var(--card))]`;
    }
  };

  const getDotColor = () => {
    return 'bg-accent';
  };

  if (!isActive) return null;

  return (
    <div 
      className={`absolute transform transition-all duration-1200 ease-in-out ${movementClass} z-50 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
      style={{
        left: `calc(50% + ${position.x}px)`,
        top: `calc(50% + ${position.y}px)`,
        transform: 'translate(-50%, -50%)',
        transitionTimingFunction: 'ease-in-out',
        animationDelay: `${Math.random() * 2}s`,
        zIndex: 50
      }}
    >
      <div className={getBubbleClasses()}>
        {isTyping ? (
          <div className="flex items-center justify-center gap-1.5 py-1">
            <span 
              className={`w-1.5 h-1.5 ${getDotColor()} rounded-full animate-bounce`}
              style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
            />
            <span 
              className={`w-1.5 h-1.5 ${getDotColor()} rounded-full animate-bounce`}
              style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
            />
            <span 
              className={`w-1.5 h-1.5 ${getDotColor()} rounded-full animate-bounce`}
              style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
            />
          </div>
        ) : (
          <div className="font-normal text-left leading-relaxed break-words">
            {text}
          </div>
        )}
      </div>
      <div className={getArrowClasses()} />
    </div>
  );
};

export { ChatTypingBubble };
