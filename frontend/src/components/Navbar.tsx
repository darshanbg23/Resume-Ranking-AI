import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon, Brightness4, Brightness7, Logout,
  Notifications, Person, Circle,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import apiClient from '../services/api';


interface NavbarProps {
  onMenuClick?: () => void;
}

interface NotifItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/notifications/unread-count/');
      if (res.data.status) {
        setUnreadCount(res.data.data.unread_count);
      }
    } catch {
      // Silently fail
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/notifications/');
      if (res.data.status) {
        setNotifications(res.data.data.slice(0, 5));
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch {
      // Silently fail
    }
  }, [isAuthenticated]);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // every 30s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  const handleNotifToggle = () => {
    if (!showNotifs) fetchNotifications();
    setShowNotifs(!showNotifs);
    setShowUserMenu(false);
  };

  const handleMarkRead = async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  };

  const getProfilePath = () => {
    if (user?.role === 'candidate') return '/candidate/settings';
    if (user?.role === 'recruiter') return '/recruiter/profile';
    return '/admin/settings';
  };

  const getDashboardPath = () => {
    if (user?.role === 'candidate') return '/candidate/dashboard';
    if (user?.role === 'recruiter') return '/recruiter/dashboard';
    return '/admin/dashboard';
  };

  const getNotificationsPath = () => {
    if (user?.role === 'candidate') return '/candidate/notifications';
    return '/recruiter/dashboard';
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <nav className="sticky top-0 z-20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-[#222222]/80">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#111111] lg:hidden transition-colors"
              aria-label="Toggle menu"
            >
              <MenuIcon className="text-gray-600 dark:text-zinc-400" style={{ fontSize: 22 }} />
            </button>
            <Link to={getDashboardPath()} className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
            </Link>
          </div>

          {/* Center: Page context */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            {/* Breadcrumb or search could go here */}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light'
                ? <Brightness4 style={{ fontSize: 20 }} className="text-gray-500" />
                : <Brightness7 style={{ fontSize: 20 }} className="text-gray-400" />
              }
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleNotifToggle}
                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors"
                    aria-label="Notifications"
                  >
                    <Notifications style={{ fontSize: 20 }} className="text-gray-500 dark:text-zinc-400" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulseGlow">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0D0D0D] rounded-xl border border-gray-200 dark:border-[#222222] shadow-xl animate-fadeInDown overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#222222] flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 text-[10px] font-bold rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notif => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                if (!notif.is_read) handleMarkRead(notif.id);
                                setShowNotifs(false);
                              }}
                              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors border-b border-gray-100 dark:border-[#1a1a1a] last:border-b-0 ${
                                !notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/5' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs ${!notif.is_read ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white truncate`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">{getTimeAgo(notif.created_at)}</p>
                                </div>
                                {!notif.is_read && (
                                  <Circle style={{ fontSize: 8 }} className="text-blue-500 mt-1 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500 dark:text-zinc-400">
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-2 text-center border-t border-gray-100 dark:border-[#1a1a1a]">
                        <button
                          onClick={() => { setShowNotifs(false); navigate(getNotificationsPath()); }}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                    className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-[10px]">
                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-zinc-300 max-w-[100px] truncate">
                      {user?.first_name}
                    </span>
                    <KeyboardArrowDown style={{ fontSize: 18 }} className="text-gray-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0D0D0D] rounded-xl border border-gray-200 dark:border-[#222222] shadow-xl animate-fadeInDown overflow-hidden">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#222222]">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-semibold rounded-full capitalize">{user?.role}</span>
                      </div>
                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          to={getProfilePath()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors"
                        >
                          <Person style={{ fontSize: 18 }} className="text-gray-400" />
                          Profile & Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors"
                        >
                          <Logout style={{ fontSize: 18 }} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-ghost text-sm px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
