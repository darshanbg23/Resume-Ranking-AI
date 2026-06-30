import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard, People, Analytics, Settings,
  Description, Search, Assignment,
  Psychology, ManageAccounts,
  ScreenSearchDesktop, EmojiEvents,
  Gavel, BarChart, Close,
  BusinessCenter,
} from '@mui/icons-material';
import { useAuth } from '@context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const candidateNav: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/candidate/dashboard', label: 'Dashboard', icon: Dashboard },
      { path: '/candidate/jobs', label: 'Job Search', icon: Search },
      { path: '/candidate/applications', label: 'My Applications', icon: Assignment },
    ],
  },
  {
    title: 'RESUME & AI',
    items: [
      { path: '/candidate/resume', label: 'Resume Manager', icon: Description },
      { path: '/candidate/insights', label: 'AI Insights', icon: Psychology },
    ],
  },
  {
    items: [
      { path: '/candidate/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const recruiterNav: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/recruiter/dashboard', label: 'Dashboard', icon: Dashboard },
    ],
  },
  {
    title: 'RECRUITMENT',
    items: [
      { path: '/recruiter/jobs', label: 'Job Management', icon: BusinessCenter },
      { path: '/recruiter/candidates', label: 'Candidates', icon: People },
      { path: '/recruiter/screening', label: 'Resume Screening', icon: ScreenSearchDesktop },
      { path: '/recruiter/rankings', label: 'Rankings', icon: EmojiEvents },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { path: '/recruiter/analytics', label: 'Analytics', icon: Analytics },
    ],
  },
];

const adminNav: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: Dashboard },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/admin/users', label: 'Users', icon: People },
      { path: '/admin/recruiters', label: 'Recruiters', icon: ManageAccounts },
      { path: '/admin/jobs', label: 'Jobs', icon: BusinessCenter },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { path: '/admin/analytics', label: 'Platform Analytics', icon: BarChart },
      { path: '/admin/logs', label: 'Audit Logs', icon: Gavel },
    ],
  },
  {
    items: [
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const getNavSections = (role?: string): NavSection[] => {
  switch (role) {
    case 'candidate': return candidateNav;
    case 'recruiter': return recruiterNav;
    case 'admin': return adminNav;
    default: return [];
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const sections = getNavSections(user?.role);

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));

  const roleGradient = user?.role === 'recruiter'
    ? 'from-purple-600 to-indigo-600'
    : user?.role === 'admin'
    ? 'from-red-600 to-orange-600'
    : 'from-blue-600 to-indigo-600';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-white dark:bg-[#0A0A0A] border-r border-gray-200 dark:border-[#222222] z-40 lg:z-0 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-[#222222] flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className={`w-8 h-8 bg-gradient-to-br ${roleGradient} rounded-lg flex items-center justify-center shadow-sm`}>
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-lg gradient-text">ResumeRank</span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#111111] lg:hidden"
            aria-label="Close menu"
          >
            <Close style={{ fontSize: 20 }} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && (
                <p className="px-3 mb-2 text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-600 uppercase">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#111111] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {active && <div className="nav-active-indicator" />}
                      <Icon style={{ fontSize: 20 }} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-300'} />
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card */}
        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-[#222222] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleGradient} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-semibold text-xs">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
