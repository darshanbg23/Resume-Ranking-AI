import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp, TrendingDown } from '@mui/icons-material';
const colorConfig = {
    blue: {
        icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        gradient: 'from-blue-500 to-blue-600',
        glow: 'shadow-blue-500/10',
    },
    indigo: {
        icon: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        gradient: 'from-indigo-500 to-indigo-600',
        glow: 'shadow-indigo-500/10',
    },
    green: {
        icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        gradient: 'from-green-500 to-emerald-600',
        glow: 'shadow-green-500/10',
    },
    emerald: {
        icon: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        gradient: 'from-emerald-500 to-teal-600',
        glow: 'shadow-emerald-500/10',
    },
    purple: {
        icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        gradient: 'from-purple-500 to-purple-600',
        glow: 'shadow-purple-500/10',
    },
    orange: {
        icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        gradient: 'from-orange-500 to-amber-600',
        glow: 'shadow-orange-500/10',
    },
    red: {
        icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        gradient: 'from-red-500 to-red-600',
        glow: 'shadow-red-500/10',
    },
    pink: {
        icon: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        gradient: 'from-pink-500 to-rose-600',
        glow: 'shadow-pink-500/10',
    },
};
export const StatsCard = ({ title, value, icon, trend, trendValue, description, color = 'blue', variant = 'default', }) => {
    const cfg = colorConfig[color];
    if (variant === 'gradient') {
        return (_jsxs("div", { className: `relative overflow-hidden rounded-xl bg-gradient-to-br ${cfg.gradient} p-6 text-white shadow-lg ${cfg.glow} card-hover`, children: [_jsxs("div", { className: "relative z-10", children: [_jsx("p", { className: "text-sm font-medium text-white/80 mb-1", children: title }), _jsx("p", { className: "text-3xl font-bold animate-countUp", children: value }), (trend && trendValue) && (_jsxs("div", { className: "flex items-center gap-1 mt-2 text-white/90", children: [trend === 'up' ? _jsx(TrendingUp, { style: { fontSize: 16 } }) : _jsx(TrendingDown, { style: { fontSize: 16 } }), _jsx("span", { className: "text-xs font-semibold", children: trendValue })] })), description && _jsx("p", { className: "text-xs text-white/70 mt-2", children: description })] }), _jsx("div", { className: "absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" }), _jsx("div", { className: "absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5" })] }));
    }
    return (_jsx("div", { className: "card-base p-6 card-hover", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1", children: title }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white animate-countUp", children: value }), description && (_jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mt-2", children: description })), trend && trendValue && (_jsxs("div", { className: `flex items-center gap-1 mt-2 ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`, children: [trend === 'up' ? _jsx(TrendingUp, { style: { fontSize: 16 } }) : _jsx(TrendingDown, { style: { fontSize: 16 } }), _jsx("span", { className: "text-xs font-semibold", children: trendValue })] }))] }), icon && (_jsx("div", { className: `p-3 rounded-xl ${cfg.icon}`, children: icon }))] }) }));
};
export default StatsCard;
