import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CircularProgress } from '@mui/material';
export const LoadingSpinner = ({ size = 40, label }) => (_jsxs("div", { className: "flex flex-col items-center justify-center gap-4", children: [_jsx(CircularProgress, { size: size, color: "inherit" }), label && _jsx("p", { className: "text-gray-600 dark:text-zinc-400", children: label })] }));
export const LoadingPage = () => (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0D0D0D]", children: _jsx(LoadingSpinner, { size: 60, label: "Loading..." }) }));
export default LoadingSpinner;
