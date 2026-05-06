import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble as ChatBubbleData } from '@/hooks/useChatBubbles';

interface ChatBubbleProps {
  id: string;
  text: string;
  position: number;
  isVisible: boolean;
  size?: 'small' | 'medium' | 'large';
  fadeDuration?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  id, 
  text, 
  position, 
  isVisible, 
  size = 'large', 
  fadeDuration = 400,
  className = '',
  theme = 'light' 
}) => {
  const bubble: ChatBubbleData = {
    id,
    text,
    position,
    isVisible,
    size,
    fadeDuration,
  };
  const [measuredStyle, setMeasuredStyle] = useState<React.CSSProperties>({});
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentWidth = contentRef.current.scrollWidth;
      const contentHeight = contentRef.current.scrollHeight;
      
      const padding = bubble.size === 'small' ? 12 : bubble.size === 'large' ? 20 : 16;
      const minWidth = bubble.size === 'small' ? 100 : bubble.size === 'large' ? 160 : 130;
      const maxWidth = bubble.size === 'small' ? 140 : bubble.size === 'large' ? 220 : 180;
      
      const idealWidth = Math.min(Math.max(contentWidth + padding * 2, minWidth), maxWidth);
      const idealHeight = contentHeight + padding * 2;

      setMeasuredStyle({
        width: 'auto',
        minWidth: idealWidth,
        minHeight: idealHeight,
        padding: `${padding}px`
      });
    }
  }, [bubble.text, bubble.size]);

  const getSizeClasses = () => {
    const base = 'rounded-2xl shadow-lg border-0 backdrop-blur-none';
    const sizeClasses = {
      small: 'text-xs px-3 py-2',
      medium: 'text-sm px-4 py-3',
      large: 'text-sm px-5 py-4'
    };
    
    const themeClasses = theme === 'dark' 
      ? 'bg-blue-500 text-white'
      : 'bg-blue-100 text-gray-800';

    return `${base} ${sizeClasses[bubble.size]} ${themeClasses}`;
  };

  const getArrowPosition = () => {
    const angle = bubble.position;
    
    if (angle >= 315 || angle < 45) return 'bottom';
    if (angle >= 45 && angle < 135) return 'left';
    if (angle >= 135 && angle < 225) return 'top';
    return 'right';
  };

  const arrowPosition = getArrowPosition();

  return (
    <div 
      style={measuredStyle} 
      className={`absolute ${
        bubble.isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
      aria-label={`Mensagem: ${bubble.text}`}
    >
      <div className={getSizeClasses()}>
        <div 
          ref={contentRef}
          className="font-normal text-left leading-relaxed break-words"
          style={{
            lineHeight: 1.4,
            wordBreak: 'break-word'
          }}
        >
          {bubble.text}
        </div>
      </div>

      <div 
        className={`absolute ${
          arrowPosition === 'bottom' ? 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full' :
          arrowPosition === 'top' ? 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full' :
          arrowPosition === 'left' ? 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2' :
          'right-0 top-1/2 transform translate-x-full -translate-y-1/2'
        }`}
      >
        <div 
          className={`w-0 h-0 border-transparent ${
            arrowPosition === 'bottom' ? 'border-t-6 border-l-6 border-r-6 border-t-blue-100' :
            arrowPosition === 'top' ? 'border-b-6 border-l-6 border-r-6 border-b-blue-100' :
            arrowPosition === 'left' ? 'border-r-6 border-t-6 border-b-6 border-r-blue-100' :
            'border-l-6 border-t-6 border-b-6 border-l-blue-100'
          } ${theme === 'dark' ? 'dark:border-t-blue-500 dark:border-b-blue-500 dark:border-r-blue-500 dark:border-l-blue-500' : ''}`}
        />
      </div>
    </div>
  );
};

export { ChatBubble };
