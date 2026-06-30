import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';
export const PublicLayout = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    return (_jsxs("div", { className: "flex flex-col min-h-screen bg-white dark:bg-black", children: [!isAuthPage && _jsx(Navbar, {}), _jsx("main", { className: "flex-1", children: _jsx(Outlet, {}) }), !isAuthPage && _jsx(Footer, {})] }));
};
export default PublicLayout;
