import React from 'react'

export default function Button({
    children,
    type = "button",
    bgColor = "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400",
    textColor = "text-white",
    className = "",
    ...props
}) {
    return (
        <button type={type} className={`rounded-lg px-4 py-2 font-semibold shadow-sm transition-colors duration-200 ${bgColor} ${textColor} ${className}`} {...props}>
            {children}
        </button>
    );
}
