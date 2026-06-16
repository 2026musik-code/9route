import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, CreditCard, LogOut, FileText } from 'lucide-react';

export default function ProfileView() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : '1';
    fetch('/api/v1/profile', {
      headers: { 'x-user-id': userId }
    }).then(res => res.json()).then(data => {
      if(data && data.success) {
        setProfile(data.data);
      }
    }).catch(e => console.error(e));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (!profile) return <div className="p-8 text-slate-500 animate-pulse">Loading profile...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-800 shadow-lg">
            <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{profile.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{profile.email}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase rounded-full tracking-wider flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {profile.role}
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] uppercase rounded-full tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3 h-3" /> {profile.plan} Plan
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <button className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Account Information</h4>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</div>
              <div className="font-medium text-slate-800 dark:text-white">{profile.name}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</div>
              <div className="font-medium text-slate-800 dark:text-white">{profile.email}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Joined Date</div>
              <div className="font-medium text-slate-800 dark:text-white">{profile.joinedDate}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Billing Details</h4>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Plan</div>
              <div className="font-medium text-slate-800 dark:text-white">{profile.plan}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billing Cycle</div>
              <div className="font-medium text-slate-800 dark:text-white">{profile.billingCycle}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Next Payment</div>
              <div className="font-medium text-slate-800 dark:text-white">{profile.nextPayment}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
