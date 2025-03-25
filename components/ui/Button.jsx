'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const buttonVariants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
};

const buttonSizes = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-sm px-2.5 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
  xl: 'text-lg px-6 py-3',
};

const Button = forwardRef(
  ({ className, children, href, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = buttonVariants[variant];
    const sizeClasses = buttonSizes[size];
    
    const classes = cn(baseClasses, variantClasses, sizeClasses, className);
    
    if (href) {
      return (
        <Link href={disabled ? '#' : href} className={classes} ref={ref} {...props} aria-disabled={disabled}>
          {children}
        </Link>
      );
    }
    
    return (
      <button 
        className={classes} 
        disabled={disabled} 
        ref={ref} 
        type={props.type || 'button'} 
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 