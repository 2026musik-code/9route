import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, Plus, Trash2, Copy, Check, Eye, EyeOff, Server, Link2, Send, X } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdDate: string;
  lastUsed: string;
}

export default function ApiKeysView() {
  const { t } = useTranslation();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('https://your-domain.com');
  const [endpoints, setEndpoints] = useState<any[]>([]);
  
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{endpoint: string, result: any, error?: string} | null>(null);

  const [models, setModels] = useState<any[]>([]);
  const [selectedModelForTest, setSelectedModelForTest] = useState<Record<string, string>>({});

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
    fetch('/api/v1/endpoints').then(res => res.json()).then(data => {
      if(data && data.data) {
        setEndpoints(data.data);
      }
    }).catch(e => console.error(e));
    
    fetch('/api/v1/models').then(res => res.json()).then(data => {
      if(data && data.data) {
        setModels(data.data);
      }
    }).catch(e => console.error(e));

    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : '1';
    
    fetch('/api/v1/apikeys', { headers: { 'x-user-id': userId } }).then(res => res.json()).then(data => {
      if(data && data.data) {
        setKeys(data.data);
      }
    }).catch(e => console.error(e));
  }, []);

  const handleGenerate = async () => {
    if (!newKeyName.trim()) return;
    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : '1';
      const res = await fetch('/api/v1/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ name: newKeyName.trim(), userId })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setKeys([data.data, ...keys]);
      }
    } catch (e) {
      console.error(e);
    }
    setShowGenerateModal(false);
    setNewKeyName('');
  };

  const handleCopyKey = (id: string, keyString: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyEndpoint = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/apikeys/${id}`, { method: 'DELETE' });
      setKeys(keys.filter((k) => k.id !== id));
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleTestEndpoint = async (ep: any) => {
    setIsTesting(ep.id);
    setTestResult(null);
    try {
      let bodyStr;
      if (ep.method !== 'GET' && ep.method !== 'HEAD') {
        let bodyObj: any = {};
        if (ep.path.includes('/chat/completions')) {
          bodyObj = {
            model: selectedModelForTest[ep.id] || (models && models.length > 0 ? models[0].id : "gc/gemini-3-flash-preview"),
            messages: [{ role: "user", content: "Say hello!" }]
          };
        }
        bodyStr = JSON.stringify(bodyObj);
      }

      const res = await fetch(ep.path, {
          method: ep.method,
          headers: {
              'Authorization': keys.length > 0 ? `Bearer ${keys[0].key}` : '',
              'Content-Type': 'application/json'
          },
          body: bodyStr
      });
      
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      
      setTestResult({ endpoint: ep.path, result: data });
    } catch (error) {
      setTestResult({ endpoint: ep.path, result: null, error: String(error) });
    }
    setIsTesting(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">API Keys & Endpoints</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your secret keys and view available API endpoints.
          </p>
        </div>
        <button
          onClick={() => { setShowGenerateModal(true); setNewKeyName(`New Key ${keys.length + 1}`); }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-md shadow-indigo-200"
        >
          <Plus className="w-4 h-4" /> Generate New Key
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Key Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Secret Key</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Created</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Last Used</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">{k.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                        {showKeyId === k.id ? k.key : k.key.substring(0, 7) + '...' + k.key.slice(-4)}
                      </code>
                      <button
                        onClick={() => setShowKeyId(showKeyId === k.id ? null : k.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title={showKeyId === k.id ? "Hide key" : "Show key"}
                      >
                        {showKeyId === k.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{k.createdDate}</td>
                  <td className="px-6 py-4 text-slate-500">{k.lastUsed}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button 
                        onClick={() => handleCopyKey(k.id, k.key)}
                        className="p-1.5 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors"
                        title="Copy"
                      >
                        {copiedId === k.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(k.id)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        title="Revoke"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No API keys found. Generate one to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Endpoints List */}
      <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-2 flex items-center gap-2">
        <Server className="w-5 h-5 text-indigo-600" /> Available Endpoints
      </h4>
      <div className="grid grid-cols-1 gap-4">
        {endpoints.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            Tidak ada endpoint yang tersedia. Anda dapat menambahkannya melalui Dasbor Admin.
          </div>
        ) : (
          endpoints.map((ep) => (
            <div key={ep.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider">{ep.method}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">{ep.description || "API Endpoint"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                <code className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded truncate flex-1 md:flex-none">
                  {baseUrl}{ep.path}
                </code>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ep.path.includes('/chat/completions') && models.length > 0 && (
                <select 
                  value={selectedModelForTest[ep.id] || models[0].id}
                  onChange={(e) => setSelectedModelForTest({...selectedModelForTest, [ep.id]: e.target.value})}
                  className="max-w-[120px] sm:max-w-[160px] truncate text-[10px] sm:text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1.5 rounded outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  title="Select model to test"
                >
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.id}</option>
                  ))}
                </select>
              )}
              <button 
                onClick={() => handleCopyEndpoint(ep.id, `${baseUrl}${ep.path}`)}
                className="flex items-center gap-2 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:text-slate-400 rounded-lg transition-colors"
                title="Copy URL"
              >
                {copiedEndpoint === ep.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} 
                <span className="text-xs font-bold hidden sm:inline">{copiedEndpoint === ep.id ? 'Copied!' : 'Copy'}</span>
              </button>
              <button 
                onClick={() => handleTestEndpoint(ep)}
                disabled={isTesting === ep.id}
                className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-50"
                title="Test Request"
              >
                {isTesting === ep.id ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-slate-700 animate-spin" />
                ) : (
                    <Send className="w-4 h-4" />
                )}
                <span className="text-xs font-bold hidden sm:inline">Test</span>
              </button>
            </div>
          </div>
        )))}
      </div>

      {/* Test Result Modal */}
      {testResult && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Test Response</h3>
                <code className="text-xs font-mono text-slate-500 mt-1">{testResult.endpoint}</code>
              </div>
              <button 
                onClick={() => setTestResult(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              {testResult.error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                  <h4 className="font-bold text-sm mb-1">Request failed</h4>
                  <p className="text-xs font-mono break-all">{testResult.error}</p>
                </div>
              ) : (
                <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all">
                  {typeof testResult.result === 'object' 
                    ? JSON.stringify(testResult.result, null, 2)
                    : String(testResult.result)
                  }
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Key Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white">Generate New API Key</h3>
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Key Name</label>
              <input 
                type="text" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Development, Production"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                autoFocus
              />
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate}
                disabled={!newKeyName.trim()}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
