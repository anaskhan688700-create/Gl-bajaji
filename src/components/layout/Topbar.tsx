import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useFarms } from '../../context/FarmContext';
import { useSensors } from '../../context/SensorContext';
import { useTheme } from '../../context/ThemeContext';

interface TopbarProps {
  collapsed: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ collapsed, setMobileOpen }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, role, switchDemoRole, logout } = useAuth();
  const { farms, selectedFarm, setSelectedFarmId } = useFarms();
  const { activeAlerts, refreshTelemetry, isLoading } = useSensors();
  const { theme, toggleTheme } = useTheme();

  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/95 dark:bg-darkSurface/95 backdrop-blur-md border-b border-gray-200 dark:border-darkBorder transition-all duration-300 ${
        collapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}
    >
      {/* Left: Mobile Toggle & Farm Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-forest dark:text-darkTextPrimary lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-darkCard"
          aria-label="Open navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Farm Switcher */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-warmBg dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl text-xs font-medium text-forest dark:text-darkTextPrimary">
            <MapPin className="w-3.5 h-3.5 text-agri" />
            <select
              value={selectedFarm?.id || ''}
              onChange={e => setSelectedFarmId(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer text-darkText dark:text-darkTextPrimary"
            >
              {farms.map(f => (
                <option key={f.id} value={f.id} className="dark:bg-darkCard dark:text-darkTextPrimary">
                  {f.name} ({f.location.district}) — {f.area} {f.areaUnit}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Refresh, Lang, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-forest dark:text-limeAccent hover:bg-warmBg dark:hover:bg-darkCard transition-colors border border-gray-200 dark:border-darkBorder"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-limeAccent animate-in spin-in-90" />
          ) : (
            <Moon className="w-4 h-4 text-forest" />
          )}
        </button>

        {/* Refresh Data Button */}
        <button
          onClick={() => refreshTelemetry()}
          disabled={isLoading}
          className="p-2 text-forest dark:text-darkTextPrimary hover:bg-warmBg dark:hover:bg-darkCard rounded-xl transition-colors border border-gray-200 dark:border-darkBorder"
          title="Refresh Field Metrics"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-agri' : ''}`} />
        </button>

        {/* Language Switcher */}
        <div className="flex items-center bg-warmBg dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl p-0.5 text-xs font-medium">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              language === 'en'
                ? 'bg-forest dark:bg-forest-light text-white font-bold shadow-soft'
                : 'text-secondaryText dark:text-darkTextSecondary hover:text-darkText dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              language === 'hi'
                ? 'bg-forest dark:bg-forest-light text-limeAccent font-bold shadow-soft'
                : 'text-secondaryText dark:text-darkTextSecondary hover:text-darkText dark:hover:text-white'
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="relative p-2 text-forest dark:text-darkTextPrimary hover:bg-warmBg dark:hover:bg-darkCard rounded-xl transition-colors border border-gray-200 dark:border-darkBorder"
            title="Field Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-criticalRed rounded-full ring-2 ring-white dark:ring-darkSurface animate-pulse" />
            )}
          </button>

          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-darkCard rounded-2xl shadow-elevated border border-gray-100 dark:border-darkBorder py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-darkBorder flex items-center justify-between">
                <span className="text-xs font-bold text-forest dark:text-darkTextPrimary">Field Risk Alerts</span>
                <span className="text-[11px] font-semibold text-criticalRed">
                  {activeAlerts.length} Active
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-darkBorder">
                {activeAlerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-secondaryText dark:text-darkTextSecondary">
                    All field parameters normal. No active risk warnings.
                  </div>
                ) : (
                  activeAlerts.map(a => (
                    <div key={a.id} className="p-3 text-xs hover:bg-warmBg dark:hover:bg-darkSurface transition-colors">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <AlertTriangle className={`w-3.5 h-3.5 ${a.severity === 'High risk' ? 'text-criticalRed' : 'text-warningAmber'}`} />
                        <span className={a.severity === 'High risk' ? 'text-criticalRed' : 'text-warningAmber'}>
                          {language === 'hi' ? a.titleHi : a.titleEn}
                        </span>
                      </div>
                      <p className="text-[11px] text-secondaryText dark:text-darkTextSecondary line-clamp-2">
                        {language === 'hi' ? a.explanationHi : a.explanationEn}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-warmBg dark:hover:bg-darkCard transition-colors border border-gray-200 dark:border-darkBorder"
          >
            <div className="w-7 h-7 rounded-lg bg-forest text-limeAccent font-bold text-xs flex items-center justify-center">
              {user?.name.charAt(0) || 'K'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-darkText dark:text-darkTextPrimary leading-none truncate max-w-[100px]">
                {user?.name || 'Farmer'}
              </span>
              <span className="text-[10px] text-agri font-semibold capitalize">
                {role} mode
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-secondaryText dark:text-darkTextSecondary" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-darkCard rounded-2xl shadow-elevated border border-gray-100 dark:border-darkBorder py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-darkBorder">
                <p className="text-xs font-bold text-darkText dark:text-darkTextPrimary">{user?.name}</p>
                <p className="text-[11px] text-secondaryText dark:text-darkTextSecondary">{user?.email}</p>
                <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 dark:bg-forest text-forest dark:text-limeAccent">
                  Role: {role}
                </div>
              </div>

              <div className="px-2 py-1.5">
                <p className="px-2 py-1 text-[10px] font-bold text-secondaryText dark:text-darkTextSecondary uppercase">
                  Switch Demo Account
                </p>
                <button
                  onClick={() => {
                    switchDemoRole('farmer');
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                    role === 'farmer'
                      ? 'bg-warmBg dark:bg-darkSurface font-bold text-forest dark:text-limeAccent'
                      : 'hover:bg-warmBg dark:hover:bg-darkSurface text-darkText dark:text-darkTextPrimary'
                  }`}
                >
                  <span>👨‍🌾 Ramesh Kumar (Farmer)</span>
                  {role === 'farmer' && <CheckCircle2 className="w-3.5 h-3.5 text-agri" />}
                </button>
                <button
                  onClick={() => {
                    switchDemoRole('admin');
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                    role === 'admin'
                      ? 'bg-warmBg dark:bg-darkSurface font-bold text-forest dark:text-limeAccent'
                      : 'hover:bg-warmBg dark:hover:bg-darkSurface text-darkText dark:text-darkTextPrimary'
                  }`}
                >
                  <span>🔬 Dr. Priya Sharma (Admin)</span>
                  {role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-agri" />}
                </button>
              </div>

              <div className="p-2 border-t border-gray-100 dark:border-darkBorder">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-1.5 text-xs text-criticalRed hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
