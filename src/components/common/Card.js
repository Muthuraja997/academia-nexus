import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Card = ({ children, className }) => (
    <div className={cn("bg-white dark:bg-gray-800/50 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl", className)}>
        <div className="p-6">{children}</div>
    </div>
);

export default Card;
