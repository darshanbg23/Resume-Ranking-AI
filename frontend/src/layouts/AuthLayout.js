import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@components/Navbar';
import Sidebar from '@components/Sidebar';
import ProtectedRoute from '@components/ProtectedRoute';
export const AuthLayout = ({ requiredRole }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    return (_jsx(ProtectedRoute, { requiredRole: requiredRole, children: _jsxs("div", { className: "flex h-screen bg-gray-50 dark:bg-black", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden min-w-0", children: [_jsx(Navbar, { onMenuClick: () => setSidebarOpen(!sidebarOpen) }), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8", children: _jsx("div", { className: "animate-fadeIn", children: _jsx(Outlet, {}) }) }) })] })] }) }));
};
export default AuthLayout;
