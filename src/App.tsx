/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Terminal, KeyRound, Settings, Globe, Menu, X, BookOpen, User, ShieldAlert, ChevronLeft } from 'lucide-react';
import DashboardView from './components/DashboardView';
import PlaygroundView from './components/PlaygroundView';
import DocsView from './components/DocsView';
import ApiKeysView from './components/ApiKeysView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import { ViewState, DashboardData } from './types';

function MainLayout() {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : '1';
      const res = await fetch('/api/dashboard', {
          headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setData(json.data);
      }
    } catch (e) {
      // Silently catch fetch errors during dev server reloads or network hiccups
      // to prevent "Failed to fetch" console spam during polling.
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Simulate real-time updates every 10 seconds (polling)
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initial dark mode check
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleNavClick = (view: ViewState) => {
    if (view === 'admin') {
      navigate('/admin');
      return;
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-800 dark:text-slate-200 font-sans pb-16 md:pb-0 transition-colors">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Hidden on mobile by default) */}
      <aside className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 z-30 shrink-0 transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">API Manager</span>
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> {t('Dashboard')}
          </button>
          <button 
            onClick={() => handleNavClick('playground')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${currentView === 'playground' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Terminal className="w-5 h-5" /> {t('Playground')}
          </button>
          
          <button 
            onClick={() => handleNavClick('docs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${currentView === 'docs' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <BookOpen className="w-5 h-5" /> {t('Documentation')}
          </button>
          
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800"></div>
          
          <button 
            onClick={() => handleNavClick('api-keys')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${currentView === 'api-keys' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <KeyRound className="w-5 h-5" /> {t('API Keys')}
          </button>
          
          <button 
            onClick={() => handleNavClick('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${currentView === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <User className="w-5 h-5" /> Profile
          </button>

          <button 
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${currentView === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings className="w-5 h-5" /> {t('Settings')}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Globe className="w-5 h-5" />
            {i18n.language === 'en' ? 'Switch to Indonesia' : 'Switch to English'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen w-full">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 hover:bg-slate-100 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white truncate">
              {currentView === 'dashboard' && t('Dashboard')}
              {currentView === 'playground' && t('Playground')}
              {currentView === 'docs' && t('Documentation')}
              {currentView === 'api-keys' && t('API Keys')}
              {currentView === 'profile' && 'Profile'}
              {currentView === 'settings' && t('Settings')}
            </h2>
            <span className="hidden sm:inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Live</span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
               <button onClick={() => i18n.changeLanguage('id')} className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded-md ${i18n.language === 'id' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>ID</button>
               <button onClick={() => i18n.changeLanguage('en')} className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded-md ${i18n.language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>EN</button>
            </div>
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleNavClick('profile')}>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 dark:text-white">Admin User</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Dev Lead</div>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 text-[10px] md:text-xs shrink-0">AU</div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {currentView === 'dashboard' && <DashboardView data={data} />}
          {currentView === 'playground' && <PlaygroundView refreshDashboard={fetchDashboardData} />}
          {currentView === 'docs' && <DocsView />}
          {currentView === 'api-keys' && <ApiKeysView />}
          {currentView === 'profile' && <ProfileView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 px-6 flex justify-between items-center z-20 pb-safe">
        <button 
          onClick={() => handleNavClick('dashboard')}
          className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>
        <button 
          onClick={() => handleNavClick('api-keys')}
          className={`flex flex-col items-center gap-1 ${currentView === 'api-keys' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <KeyRound className="w-5 h-5" />
          <span className="text-[10px] font-semibold">API</span>
        </button>
        <button 
          onClick={() => handleNavClick('profile')}
          className={`flex flex-col items-center gap-1 ${currentView === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </div>
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">System Admin</h1>
          </div>
        </div>
        <div className="text-xs font-mono font-bold bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
           ROOT LEVEL ACCESS
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-6xl">
          <AdminView />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('user');
  });

  const handleLogin = (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/admin" element={<AdminLayout />} />
        {/* Handle all other routes by sending back to / */}
        <Route path="*" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

