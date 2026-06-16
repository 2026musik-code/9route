import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Server, Settings, Plus, Trash2, Edit, ShieldAlert, Activity, Cpu } from 'lucide-react';

interface Model {
  id: string;
  object: string;
  owned_by: string;
}

export default function AdminView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'users' | 'endpoints' | 'models' | 'settings'>('models');
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ rpm: 60, rpd: 50000, enforceApiKey: true, logRequests: true });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editLimit, setEditLimit] = useState<number>(0);

  useEffect(() => {
    if (activeTab === 'models') {
      fetchModels();
    } else if (activeTab === 'endpoints') {
      fetchEndpoints();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/users');
      const data = await res.json();
      if (data && data.success) setUsers(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/v1/settings');
      const data = await res.json();
      if (data && data.success) setSettings(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async () => {
    try {
      const res = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert("Settings updated!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveUserLimit = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/v1/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpdLimit: editLimit })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, rpdLimit: editLimit } : u));
        setEditingUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEndpoints = async () => {
    try {
      const res = await fetch('/api/v1/endpoints');
      const data = await res.json();
      if (data && data.data) {
        setEndpoints(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEndpoint = async (id: string) => {
    try {
      await fetch(`/api/v1/endpoints/${id}`, { method: 'DELETE' });
      setEndpoints(endpoints.filter(e => e.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const addEndpoint = async () => {
    const path = window.prompt("New Endpoint Path (e.g. /api/v1/new):");
    if (!path) return;
    const method = window.prompt("Method (GET, POST, DELETE, etc.):") || "GET";
    const description = window.prompt("Description:");

    try {
      const res = await fetch('/api/v1/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, method: method.toUpperCase(), description })
      });
      const data = await res.json();
      if (data && data.success) {
        fetchEndpoints();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch('/api/v1/models');
      const data = await res.json();
      if (data && data.data) {
        setModels(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingModels(false);
  };

  const deleteModel = async (id: string) => {
    try {
      await fetch(`/api/v1/models/entry?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setModels(models.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const addModel = async () => {
    const id = window.prompt("New Model ID (e.g. gc/gemini-new):");
    if (!id) return;
    const owned_by = window.prompt("Owned By (e.g. gc, ag, kc):") || "custom";

    try {
      const res = await fetch('/api/v1/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, owned_by })
      });
      const data = await res.json();
      if (data && data.success) {
        fetchModels();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-x-auto">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage system endpoints, models, users, rate limits, and global configurations.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl shrink-0 min-w-max">
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'models' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Models
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'endpoints' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Endpoints
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'settings' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === 'models' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-slate-800 dark:text-white">API Models Management</h4>
            </div>
             <button onClick={addModel} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" /> Add Model
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Model ID</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Owned By</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingModels ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Loading models...</td></tr>
                ) : models.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No models found</td></tr>
                ) : (
                  models.map(model => (
                    <tr key={model.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                       <td className="px-6 py-4">
                         <code className="text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">{model.id}</code>
                       </td>
                       <td className="px-6 py-4">
                         <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-1 rounded text-[10px] uppercase">{model.owned_by}</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => deleteModel(model.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Model"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'endpoints' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-slate-800 dark:text-white">Endpoint Management</h4>
            </div>
             <button onClick={addEndpoint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" /> Add Endpoint
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Method & Path</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Description</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {endpoints.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No endpoints found</td></tr>
                ) : (
                  endpoints.map((ep) => (
                    <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex flex-col gap-1">
                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase w-max ${ep.method === 'GET' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : ep.method === 'POST' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : ep.method === 'DELETE' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>{ep.method}</span>
                            <code className="text-slate-700 dark:text-slate-300 font-mono text-xs">{ep.path}</code>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{ep.description || 'No description'}</td>
                       <td className="px-6 py-4 text-center">
                         <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 rounded-lg text-xs">Active</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => deleteEndpoint(ep.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-slate-800 dark:text-white">User Management</h4>
            </div>
             <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">User</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Role</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Plan</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No users found</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase">{u.name.charAt(0)}</div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white">{u.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                            </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-1 rounded-lg text-[10px] uppercase">{u.role}</span>
                       </td>
                       <td className="px-6 py-4">
                         <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-1 rounded-lg text-xs">{u.plan}</span>
                       </td>
                       <td className="px-6 py-4">
                         <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{u.rpdLimit || 50000} RPD</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingUser(u); setEditLimit(u.rpdLimit || 50000); }} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                            <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-800 dark:text-white">Global Rate Limits</h4>
              </div>
              <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Default RPM (Requests/Min)</label>
                   <input type="number" value={settings.rpm} onChange={e => setSettings({...settings, rpm: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-transparent text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Default RPD (Requests/Day)</label>
                   <input type="number" value={settings.rpd} onChange={e => setSettings({...settings, rpd: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-transparent text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <button onClick={updateSettings} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors text-sm">Save Limits</button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-amber-600 text-indigo-400" />
                <h4 className="font-bold text-slate-800 dark:text-white">Security Settings</h4>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <input type="checkbox" checked={settings.enforceApiKey} onChange={e => setSettings({...settings, enforceApiKey: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Enforce API Key Usage</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Require valid Bearer token for all /api/v1 endpoints</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <input type="checkbox" checked={settings.logRequests} onChange={e => setSettings({...settings, logRequests: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Log Requests</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Store API request metadata for debugging</span>
                  </div>
                </label>
                 <button onClick={updateSettings} className="w-full bg-slate-800 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white font-bold py-2 rounded-lg transition-colors text-sm">Update Security</button>
              </div>
            </div>
         </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Edit Limit for {editingUser.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Requests Per Day (RPD)</label>
                <input 
                  type="number" 
                  value={editLimit} 
                  onChange={e => setEditLimit(parseInt(e.target.value) || 0)} 
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none" 
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button 
                onClick={() => setEditingUser(null)} 
                className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveUserLimit} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
