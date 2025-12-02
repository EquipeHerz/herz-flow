import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 md:h-10',
    md: 'h-12 md:h-16', 
    lg: 'h-16 md:h-20',
    xl: 'h-20 md:h-28'
  };

  return (
    <img 
      src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/logo_light.ico`}
      alt="Grupo Herz"
      className={`w-auto ${sizeClasses[size]} ${className} object-contain dark:brightness-110 dark:contrast-110`}
    />
  );
};

export default Logo;