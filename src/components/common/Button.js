import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({ children, onClick, className, variant = 'primary', disabled, size = 'md' }) => {
    const baseClasses = "rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
    
    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    };
    
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500 shadow-sm hover:shadow-md",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900 focus:ring-blue-500 shadow-sm hover:shadow-md",
        success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg",
        ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:ring-gray-500"
    };
    
    return (
        <button 
            onClick={onClick} 
            className={cn(baseClasses, sizeClasses[size], variants[variant], className)} 
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
