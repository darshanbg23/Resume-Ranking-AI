import { jsx as _jsx } from "react/jsx-runtime";
import './index.css';
import AppRouter from '@routes/index';
import { ThemeProvider } from '@context/ThemeContext';
import { AuthProvider } from '@context/AuthContext';
import ErrorBoundary from '@components/ErrorBoundary';
export const App = () => {
    return (_jsx(ErrorBoundary, { children: _jsx(ThemeProvider, { children: _jsx(AuthProvider, { children: _jsx(AppRouter, {}) }) }) }));
};
export default App;
