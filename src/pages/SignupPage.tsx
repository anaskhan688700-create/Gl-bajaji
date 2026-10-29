import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Haryana');
  const [district, setDistrict] = useState('Karnal');
  const [role, setRole] = useState<'farmer' | 'admin'>('farmer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signup({
      name,
      email,
      phone,
      state,
      district,
      role,
      preferredLanguage: 'hi',
    });
    if (success) {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-warmBg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-agri flex items-center justify-center text-limeAccent font-bold shadow-soft mx-auto mb-4">
          <Leaf className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-forest">
          {t.signup}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-secondaryText">
          Start intelligent farm monitoring & crop advisory
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-elevated rounded-3xl border border-gray-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                Farmer / User Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="farmer@kisanrakshak.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  State / राज्य
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  District / जिला
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-agri"
              >
                <option value="farmer">Farmer / कृषि उत्पादक</option>
                <option value="admin">Agronomist / Researcher / Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-forest text-limeAccent font-bold text-sm hover:bg-forest-light transition-colors shadow-soft"
            >
              {isLoading ? t.loading : 'Create Account & Start Onboarding'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-secondaryText">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-agri hover:underline">
              {t.login}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

