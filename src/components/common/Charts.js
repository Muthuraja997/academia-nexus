'use client';
import React from 'react';

// Simple chart components using CSS and SVG
export const LineChart = ({ data, title, color = '#3B82F6' }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const width = 300;
    const height = 150;
    const padding = 20;

    const points = data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
        const y = height - padding - ((d.value - minValue) / range) * (height - 2 * padding);
        return { x, y, label: d.label, value: d.value };
    });

    const pathData = points.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    return (
        <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
            <div className="relative">
                <svg width={width} height={height} className="overflow-visible">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                        <line
                            key={ratio}
                            x1={padding}
                            y1={height - padding - ratio * (height - 2 * padding)}
                            x2={width - padding}
                            y2={height - padding - ratio * (height - 2 * padding)}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                        />
                    ))}
                    
                    {/* Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    
                    {/* Points */}
                    {points.map((point, i) => (
                        <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill={color}
                            className="hover:r-4 transition-all cursor-pointer"
                        >
                            <title>{`${point.label}: ${point.value}`}</title>
                        </circle>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export const BarChart = ({ data, title, color = '#10B981' }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div className="w-20 text-xs text-gray-600 truncate">
                            {item.label}
                        </div>
                        <div className="flex-1 mx-2">
                            <div className="bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${(item.value / maxValue) * 100}%`,
                                        backgroundColor: color
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="w-10 text-xs text-gray-600 text-right">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PieChart = ({ data, title }) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = 0;
    const radius = 60;
    const centerX = 80;
    const centerY = 80;

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    const segments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (item.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        
        const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
        const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
        const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
        const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
        
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        currentAngle += angle;

        return {
            ...item,
            pathData,
            color: colors[index % colors.length],
            percentage: percentage.toFixed(1)
        };
    });

    return (
        <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
            <div className="flex items-center space-x-4">
                <svg width="160" height="160" className="flex-shrink-0">
                    {segments.map((segment, index) => (
                        <path
                            key={index}
                            d={segment.pathData}
                            fill={segment.color}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <title>{`${segment.label}: ${segment.value} (${segment.percentage}%)`}</title>
                        </path>
                    ))}
                </svg>
                <div className="space-y-1">
                    {segments.map((segment, index) => (
                        <div key={index} className="flex items-center text-xs">
                            <div
                                className="w-3 h-3 rounded mr-2"
                                style={{ backgroundColor: segment.color }}
                            ></div>
                            <span className="text-gray-600">
                                {segment.label}: {segment.percentage}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const ProgressRing = ({ percentage, title, color = '#3B82F6', size = 120 }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div>
            <span className="mt-2 text-sm text-gray-600 text-center">{title}</span>
        </div>
    );
};
