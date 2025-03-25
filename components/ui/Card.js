'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Card = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn("bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

const CardHeader = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn("px-6 py-4 border-b border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
});
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3 
      ref={ref} 
      className={cn("text-lg font-medium text-gray-900", className)}
      {...props}
    >
      {children}
    </h3>
  );
});
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p 
      ref={ref} 
      className={cn("text-sm text-gray-500 mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
});
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn("px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
});
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn("px-6 py-4 bg-gray-50 border-t border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
});
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }; 