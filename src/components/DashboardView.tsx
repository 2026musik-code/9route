import React from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DashboardData } from '../types';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface DashboardViewProps {
  data: DashboardData | null;
}

export default function DashboardView({ data }: DashboardViewProps) {
  const { t } = useTranslation();

  if (!data) return <div className="p-8 text-gray-500 animate-pulse">Loading dashboard...</div>;

  const usagePercent = Math.min((data.used / data.totalLimit) * 100, 100);
  const isNearLimit = usagePercent >= 90;

  return (
    <div className="space-y-6">
      {isNearLimit && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">{t('Warning')}</h3>
            <p className="text-red-700 text-sm mt-1">{t('Quota near limit')}</p>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{t('Quota Usage')}</div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{usagePercent.toFixed(1)}%</span>
            <span className="text-emerald-500 dark:text-emerald-400 text-xs font-medium flex items-center gap-1 mb-1">
              Live
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full ${isNearLimit ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} 
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
          <div className="absolute -top-1 -right-1">
            <span className="flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isNearLimit ? 'bg-red-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isNearLimit ? 'bg-red-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{t('Used Tokens')}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.used.toLocaleString()}</div>
          <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mt-1 uppercase">{t('Total Allowed')}: {data.totalLimit.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{t('Remaining Tokens')}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {Math.max(0, data.totalLimit - data.used).toLocaleString()}
          </div>
          <div className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold mt-1">Ready for requests</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">{t('Traffic Analytics Trend')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('Real-time Token Consumption')}</p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(val) => val.toLocaleString()}/>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="tokens" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">{t('Time')}</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">{t('Model')}</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">{t('Tokens')}</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">{t('Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {data.logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-3 font-mono text-slate-600 dark:text-slate-400">{log.model}</td>
                  <td className="px-6 py-3 font-bold text-slate-800 dark:text-white">{log.tokens.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    {log.status === 'success' ? (
                      <span className="text-emerald-500 flex items-center gap-1.5 font-medium">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Success
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1.5 font-medium">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {data.logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No logs yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
