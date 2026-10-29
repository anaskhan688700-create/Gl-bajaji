import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  ShieldAlert,
  Compass,
  GitCompare,
  CloudSun,
  Calculator,
  BotMessageSquare,
  Camera,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { t } = useLanguage();
  const { role } = useAuth();

  // Navigation Items (Filtered: No IoT / Sensors / Devices)
  const navItems = [
    { to: '/overview', label: t.navOverview, icon: LayoutDashboard },
    { to: '/farms', label: t.navFarms, icon: Sprout },
    { to: '/crop-health', label: t.navCropHealth, icon: ShieldAlert },
    { to: '/crop-advisor', label: t.navCropAdvisor, icon: Compass },
    { to: '/crop-comparison', label: t.navCropComparison, icon: GitCompare },
    { to: '/weather', label: t.navWeather, icon: CloudSun },
    { to: '/profit-calculator', label: t.navCalculator, icon: Calculator },
    { to: '/assistant', label: t.navAssistant, icon: BotMessageSquare },
    { to: '/image-analysis', label: t.navImageAnalysis, icon: Camera },
    { to: '/reports', label: t.navReports, icon: FileSpreadsheet },
    { to: '/admin', label: t.navAdmin, icon: ShieldCheck, adminOnly: true },
    { to: '/settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-forest/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-forest dark:bg-darkSurface text-warmBg border-r border-forest-light dark:border-darkBorder transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-forest-light dark:border-darkBorder">
          <NavLink
            to="/overview"
            className="flex items-center gap-3 overflow-hidden group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-agri flex items-center justify-center text-limeAccent font-bold shadow-soft flex-shrink-0 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
                  KisanRakshak <span className="text-limeAccent font-extrabold text-xs uppercase px-1.5 py-0.5 rounded bg-forest-light dark:bg-forest">AI</span>
                </span>
                <span className="text-[11px] text-gray-300 dark:text-darkTextSecondary truncate max-w-[150px]">
                  Smart Crop Advisory
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-forest-light dark:bg-darkCard hover:bg-agri text-gray-200 items-center justify-center transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 custom-scrollbar">
          {navItems.map(item => {
            if (item.adminOnly && role !== 'admin') return null;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-agri text-white shadow-soft font-semibold'
                      : 'text-gray-300 dark:text-darkTextSecondary hover:bg-forest-light dark:hover:bg-darkCard hover:text-white dark:hover:text-white'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Agricultural Benchmark Pill */}
        {!collapsed && (
          <div className="p-3 m-3 rounded-xl bg-forest-dark dark:bg-darkCard border border-forest-light dark:border-darkBorder text-xs text-gray-300 dark:text-darkTextSecondary">
            <div className="flex items-center justify-between font-semibold text-limeAccent mb-1">
              <span>ICAR Standard</span>
              <span className="text-[10px] bg-forest-light dark:bg-forest px-1.5 py-0.5 rounded text-white">v1.0</span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-400">
              Validated against Indian crop science benchmarks.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
