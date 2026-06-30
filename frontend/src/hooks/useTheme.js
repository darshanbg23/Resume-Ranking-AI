import { useTheme } from '@context/ThemeContext';
export const useIsDarkMode = () => {
    const { theme } = useTheme();
    return theme === 'dark';
};
