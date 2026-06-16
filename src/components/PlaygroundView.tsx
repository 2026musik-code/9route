import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, Code, Link2, KeyRound } from 'lucide-react';

export default function PlaygroundView({ refreshDashboard }: { refreshDashboard: () => void }) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('Halo! Jawab dengan singkat: apakah koneksi HTTPS domain baruku ini sudah berjalan sempurna?');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('gc/gemini-3-flash-preview');
  
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEndpointUrl(`${window.location.origin}/api/v1/chat/completions`);
    }
    fetch('/api/v1/models').then(res => res.json()).then(data => {
      if(data && data.data) {
        setModels(data.data);
        if (data.data.length > 0) {
          setSelectedModel(data.data[0].id);
        }
      }
    }).catch(e => console.error(e));
  }, []);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const authHeader = apiKey ? `Bearer ${apiKey}` : 'Bearer sk-mock-key-for-playground';
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          model: selectedModel,
          stream: false,
          temperature,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setResponse(JSON.stringify(data, null, 2));
      refreshDashboard(); // Trigger dashboard update
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px] lg:h-[calc(100vh-12rem)]">
      {/* Input Section */}
      <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-h-[300px] lg:min-h-0">
        <div className="p-3 md:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/50">
          <span className="font-bold text-slate-800 dark:text-white text-sm">Endpoint Setup</span>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded uppercase outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            {models.length > 0 ? (
              models.map(m => (
                <option key={m.id} value={m.id}>{m.id}</option>
              ))
            ) : (
              <option value={selectedModel}>{selectedModel}</option>
            )}
          </select>
        </div>
        
        <div className="p-3 md:p-4 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" /> Endpoint URL
            </label>
            <input 
              type="text" 
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none"
              placeholder="https://api.yourdomain.com/api/v1/chat/completions"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> API Key
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none"
              placeholder="sk-..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Temperature</span>
                <span className="text-slate-600 dark:text-slate-400">{temperature}</span>
              </label>
              <input 
                type="range" 
                min="0" max="2" step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Max Tokens</span>
                <span className="text-slate-600 dark:text-slate-400">{maxTokens}</span>
              </label>
              <input 
                type="number" 
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-3 md:p-4 flex-1 flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message Payload</label>
          <textarea
            className="w-full h-40 lg:h-auto flex-1 p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 resize-none text-slate-800 dark:text-slate-200 transition-all font-mono text-sm border border-slate-100 dark:border-slate-700 outline-none"
            placeholder={t('Type message')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="p-3 md:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {t('Send')}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex flex-col bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-slate-800 text-slate-300 min-h-[300px] lg:min-h-0">
        <div className="p-3 md:p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
          <Code className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-200 text-sm">Response</span>
        </div>
        <div className="p-4 md:p-6 flex-1 overflow-auto font-mono text-[10px] sm:text-xs md:text-sm leading-relaxed">
          {loading ? (
             <div className="flex items-center justify-center h-full text-indigo-400 gap-3">
               <Loader2 className="w-6 h-6 animate-spin" /> Waiting for API...
             </div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : response ? (
            <pre className="whitespace-pre-wrap">{response}</pre>
          ) : (
            <div className="flex items-center text-center justify-center h-full text-slate-600 font-medium tracking-wide">
               No response yet. Submit a request to see the API output.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
