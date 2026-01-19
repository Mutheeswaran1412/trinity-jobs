import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { navigationHelper } from '../utils/navigationHelper';

interface BackButtonProps {
  onBack?: () => void;
  fallbackPage?: string;
  onNavigate?: (page: string) => void;
  className?: string;
  variant?: 'floating' | 'inline';
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  onBack, 
  fallbackPage = 'home', 
  onNavigate,
  className,
  variant = 'floating',
  label = 'Back'
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigationHelper.goBackWithFallback(fallbackPage, onNavigate);
    }
  };

  const baseClasses = variant === 'floating' 
    ? "fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
    : "inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors";

  return (
    <button
      onClick={handleBack}
      className={className || baseClasses}
      aria-label="Go back"
    >
      <ArrowLeft className={variant === 'floating' ? "w-6 h-6" : "w-4 h-4 mr-1"} />
      {variant === 'inline' && <span>{label}</span>}
    </button>
  );
};

export default BackButton;