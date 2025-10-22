
import React from 'react';
import { Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} gradient-bg rounded-xl flex items-center justify-center shadow-medium`}>
        <Leaf className="text-white h-6 w-6" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizeClasses[size]} font-bold text-gray-800`}>
            SONI
          </h1>
          <p className="text-sm text-gray-600 -mt-1">
            Sistema de Organização Nutricional Inteligente
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
