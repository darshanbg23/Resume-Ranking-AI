import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "p-4", children: _jsxs(Alert, { severity: "error", children: [_jsx(AlertTitle, { children: "Something went wrong" }), this.state.error?.message] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
