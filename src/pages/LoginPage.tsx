import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchDemoRole, isLoading } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('ramesh@kisanrakshak.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email);
    if (success) {
      navigate('/overview');
    } else {
      setError('Invalid credentials or connection error.');
    }
  };

  const handleDemoLogin = async (role: 'farmer' | 'admin') => {
    await switchDemoRole(role);
    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-warmBg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-agri flex items-center justify-center text-limeAccent font-bold shadow-soft mx-auto mb-4">
          <Leaf className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-forest">
          {t.login}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-secondaryText">
          KisanRakshak AI Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-elevated rounded-3xl border border-gray-100">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-criticalRed text-xs font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                Email Address / मोबाइल नंबर
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                  placeholder="ramesh@kisanrakshak.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                Password / पासवर्ड
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-darkText"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-forest text-limeAccent font-bold text-sm hover:bg-forest-light transition-colors shadow-soft"
            >
              {isLoading ? t.loading : t.login}
            </button>
          </form>

          {/* Quick Demo Logins for Hackathon Judges */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-xs font-bold text-secondaryText uppercase tracking-wider mb-3">
              One-Click Hackathon Evaluation
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('farmer')}
                className="p-2.5 rounded-xl bg-warmBg hover:bg-green-50 border border-gray-200 text-xs font-bold text-forest flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>👨‍🌾 Demo Farmer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2.5 rounded-xl bg-warmBg hover:bg-green-50 border border-gray-200 text-xs font-bold text-forest flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🔬 Demo Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-secondaryText">
            Don’t have a farm registered yet?{' '}
            <Link to="/signup" className="font-bold text-agri hover:underline">
              {t.signup}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

