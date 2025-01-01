import React from 'react';

export function Alert({ children, variant = 'default', className = '' }) {
  const baseClasses = 'p-4 rounded-md mb-4';
  const variants = {
    default: 'bg-gray-100 text-gray-900',
    destructive: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children }) {
  return <div className="text-sm">{children}</div>;
}