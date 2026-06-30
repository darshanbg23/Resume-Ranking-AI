import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SkeletonLine = ({ width = '100%', height = '12px', className = '', }) => (_jsx("div", { className: `skeleton ${className}`, style: { width, height } }));
const CardSkeleton = () => (_jsxs("div", { className: "card-base p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(SkeletonLine, { width: "60%", height: "16px" }), _jsx(SkeletonLine, { width: "40%", height: "12px" })] }), _jsx("div", { className: "skeleton w-10 h-10 rounded-lg" })] }), _jsx(SkeletonLine, { width: "80%" }), _jsx(SkeletonLine, { width: "50%" })] }));
const TableRowSkeleton = () => (_jsxs("div", { className: "flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-[#222222]/50", children: [_jsx("div", { className: "skeleton w-8 h-8 rounded-full" }), _jsx(SkeletonLine, { width: "25%", height: "14px" }), _jsx(SkeletonLine, { width: "20%", height: "14px" }), _jsx(SkeletonLine, { width: "15%", height: "14px" }), _jsx(SkeletonLine, { width: "10%", height: "24px", className: "rounded-full" })] }));
const StatSkeleton = () => (_jsxs("div", { className: "card-base p-6 space-y-3", children: [_jsx(SkeletonLine, { width: "50%", height: "12px" }), _jsx(SkeletonLine, { width: "40%", height: "28px" }), _jsx(SkeletonLine, { width: "30%", height: "10px" })] }));
const ProfileSkeleton = () => (_jsxs("div", { className: "card-base p-6 flex items-center gap-4", children: [_jsx("div", { className: "skeleton w-16 h-16 rounded-full" }), _jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(SkeletonLine, { width: "50%", height: "18px" }), _jsx(SkeletonLine, { width: "30%", height: "12px" }), _jsx(SkeletonLine, { width: "70%", height: "12px" })] })] }));
const ListItemSkeleton = () => (_jsxs("div", { className: "flex items-center gap-3 py-3", children: [_jsx("div", { className: "skeleton w-5 h-5 rounded" }), _jsx(SkeletonLine, { width: "70%", height: "14px" })] }));
const variants = {
    card: CardSkeleton,
    'table-row': TableRowSkeleton,
    stat: StatSkeleton,
    profile: ProfileSkeleton,
    text: () => _jsx(SkeletonLine, {}),
    'list-item': ListItemSkeleton,
};
export const SkeletonLoader = ({ variant = 'card', count = 1, className = '', }) => {
    const Component = variants[variant];
    return (_jsx("div", { className: `space-y-3 ${className}`, children: Array.from({ length: count }).map((_, i) => (_jsx(Component, {}, i))) }));
};
export default SkeletonLoader;
