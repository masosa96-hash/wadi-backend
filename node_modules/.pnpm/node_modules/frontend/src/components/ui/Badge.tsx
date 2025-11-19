import { type ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full border';
  
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    success: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
    error: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
    info: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span 
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
