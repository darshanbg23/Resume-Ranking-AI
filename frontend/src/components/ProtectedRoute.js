import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { LoadingPage } from './LoadingSpinner';
export const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return _jsx(LoadingPage, {});
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (requiredRole && user.role !== requiredRole) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
