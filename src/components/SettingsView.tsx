import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Monitor, Globe, Bell, Shield, Key } from 'lucide-react';

export default function SettingsView() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.removeItem('theme');
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
           <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl text-left transition-colors">
             <Monitor className="w-5 h-5" /> Appearance
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-xl text-left transition-colors">
             <Globe className="w-5 h-5" /> Language & Region
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-xl text-left transition-colors">
             <Bell className="w-5 h-5" /> Notifications
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-xl text-left transition-colors">
             <Shield className="w-5 h-5" /> Security
           </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Theme Preferences</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => handleThemeChange('light')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                  <Sun className="w-6 h-6" />
                </div>
                <span className={`font-bold ${theme === 'light' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Light</span>
              </button>
              
              <button 
                onClick={() => handleThemeChange('dark')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 dark:bg-slate-800 flex items-center justify-center text-indigo-400">
                  <Moon className="w-6 h-6" />
                </div>
                <span className={`font-bold ${theme === 'dark' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Dark</span>
              </button>
              
              <button 
                onClick={() => handleThemeChange('system')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <span className={`font-bold ${theme === 'system' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>System</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Language Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <Globe className="w-6 h-6 text-slate-400" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">Active Language</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {i18n.language === 'id' ? 'Indonesian' : 'English'}
                    </div>
                  </div>
                </div>
                <select 
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 py-2 px-4 rounded-lg outline-none"
                >
                  <option value="en">English</option>
                  <option value="id">Indonesian</option>
                </select>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
