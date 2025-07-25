import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({ children, onClick, className, variant = 'primary', disabled }) => {
    const baseClasses = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500",
    };
    return (
        <button onClick={onClick} className={cn(baseClasses, variants[variant], className)} disabled={disabled}>
            {children}
        </button>
    );
};

export default Button;
