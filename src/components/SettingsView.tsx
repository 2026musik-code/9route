import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Monitor, Globe, Bell, Shield, Key } from 'lucide-react';

export default function SettingsView() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [activeTab, setActiveTab] = useState<'appearance' | 'language' | 'notifications' | 'security'>('appearance');
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReports: false,
    securityAlerts: true,
  });

  const [securityData, setSecurityData] = useState({
    twoFactorAuth: false,
    activeSessions: 2,
  });

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
           <button 
             onClick={() => setActiveTab('appearance')}
             className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-left transition-colors ${activeTab === 'appearance' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
           >
             <Monitor className="w-5 h-5" /> Appearance
           </button>
           <button 
             onClick={() => setActiveTab('language')}
             className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-left transition-colors ${activeTab === 'language' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
           >
             <Globe className="w-5 h-5" /> Language & Region
           </button>
           <button 
             onClick={() => setActiveTab('notifications')}
             className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-left transition-colors ${activeTab === 'notifications' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
           >
             <Bell className="w-5 h-5" /> Notifications
           </button>
           <button 
             onClick={() => setActiveTab('security')}
             className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-left transition-colors ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
           >
             <Shield className="w-5 h-5" /> Security
           </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          {activeTab === 'appearance' && (
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
          )}

          {activeTab === 'language' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Language Settings</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 gap-4">
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
                    className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="en">English (US)</option>
                    <option value="id">Indonesian (ID)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">Email Alerts</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Receive alerts about API usage.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.emailAlerts}
                      onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">Weekly Reports</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Receive a weekly summary of your token usage.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.weeklyReports}
                      onChange={(e) => setNotifications({...notifications, weeklyReports: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">Security Alerts</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Get notified about new sign-ins or suspicious activity.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.securityAlerts}
                      onChange={(e) => setNotifications({...notifications, securityAlerts: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <Key className="w-6 h-6 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white">Two-Factor Authentication</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {securityData.twoFactorAuth ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSecurityData({...securityData, twoFactorAuth: !securityData.twoFactorAuth})}
                    className={`px-4 py-2 font-bold rounded-lg text-sm transition-colors ${securityData.twoFactorAuth ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}
                  >
                    {securityData.twoFactorAuth ? 'Disable' : 'Enable'}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <Monitor className="w-6 h-6 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white">Active Sessions</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">You are currently logged in on {securityData.activeSessions} devices</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
