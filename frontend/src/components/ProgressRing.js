import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const getColor = (value, customColor) => {
    if (customColor)
        return customColor;
    if (value >= 90)
        return '#10b981';
    if (value >= 75)
        return '#6366f1';
    if (value >= 50)
        return '#f59e0b';
    return '#ef4444';
};
export const ProgressRing = ({ value, size = 120, strokeWidth = 8, label, sublabel, color, showValue = true, }) => {
    const [animatedValue, setAnimatedValue] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (animatedValue / 100) * circumference;
    const resolvedColor = getColor(value, color);
    useEffect(() => {
        const timer = setTimeout(() => setAnimatedValue(value), 100);
        return () => clearTimeout(timer);
    }, [value]);
    return (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsxs("div", { className: "relative", style: { width: size, height: size }, children: [_jsxs("svg", { width: size, height: size, className: "-rotate-90", children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "currentColor", strokeWidth: strokeWidth, className: "text-gray-200 dark:text-slate-700" }), _jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: resolvedColor, strokeWidth: strokeWidth, strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: offset, style: { transition: 'stroke-dashoffset 1s ease-out' } })] }), showValue && (_jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [_jsx("span", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: Math.round(animatedValue) }), sublabel ? (_jsx("span", { className: "text-[10px] text-gray-500 dark:text-zinc-400", children: sublabel })) : (_jsx("span", { className: "text-[10px] text-gray-500 dark:text-zinc-400", children: "%" }))] }))] }), label && (_jsx("span", { className: "text-sm font-medium text-gray-700 dark:text-zinc-300", children: label }))] }));
};
export default ProgressRing;
