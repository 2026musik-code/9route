import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, Code, Link2, KeyRound, ChevronDown } from 'lucide-react';

export default function PlaygroundView({ refreshDashboard }: { refreshDashboard: () => void }) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('Halo! Jawab dengan singkat: apakah koneksi HTTPS domain baruku ini sudah berjalan sempurna?');
  const [payloadMode, setPayloadMode] = useState<'chat' | 'image' | 'raw'>('chat');
  const [rawPayload, setRawPayload] = useState('{\n  "model": "gemini-1.5-flash",\n  "messages": [\n    { "role": "user", "content": "Halo!" }\n  ]\n}');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('gc/gemini-3-flash-preview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        body: payloadMode === 'chat' 
          ? JSON.stringify({
              model: selectedModel,
              stream: false,
              temperature,
              max_tokens: maxTokens,
              messages: [{ role: 'user', content: prompt }]
            })
          : payloadMode === 'image'
          ? JSON.stringify({
              model: selectedModel,
              prompt: prompt,
              n: 1,
              size: 'auto',
              quality: 'auto',
              background: 'auto',
              image_detail: 'high',
              output_format: 'png'
            })
          : rawPayload
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const textData = await res.text();
        data = { error: textData || 'Invalid non-JSON response received' };
      }
      
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to fetch response');
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
      <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm min-h-[300px] lg:min-h-0">
        <div className="p-3 md:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
          <span className="font-bold text-slate-800 dark:text-white text-sm">Endpoint Setup</span>
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 text-[10px] sm:text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg uppercase outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="truncate">{selectedModel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-3 overflow-hidden">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Select AI Model
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {models.length > 0 ? (
                    models.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-colors ${selectedModel === m.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm' : 'bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1 shrink-0 bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse`}></div>
                        <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 break-all leading-tight">{m.id}</span>
                      </button>
                    ))
                  ) : (
                    <button
                        className="flex items-start gap-2 p-2.5 rounded-lg border text-left bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 col-span-1 sm:col-span-2 shadow-sm"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="w-2 h-2 rounded-full mt-1 shrink-0 bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 break-all leading-tight">{selectedModel}</span>
                      </button>
                  )}
                </div>
              </div>
            )}
          </div>
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
          {payloadMode === 'chat' && (
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
          )}
        </div>

        <div className="p-3 md:p-4 flex-1 flex flex-col">
          <div className="flex flex-wrap items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Playground Type</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button onClick={() => { setPayloadMode('chat'); setEndpointUrl(window.location.origin + '/api/v1/chat/completions'); }} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${payloadMode === 'chat' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Chat</button>
              <button onClick={() => { setPayloadMode('image'); setEndpointUrl(window.location.origin + '/api/v1/images/generations'); }} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${payloadMode === 'image' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Image</button>
              <button onClick={() => setPayloadMode('raw')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${payloadMode === 'raw' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>JSON</button>
            </div>
          </div>
          {payloadMode === 'chat' || payloadMode === 'image' ? (
            <textarea
              className="w-full h-40 lg:h-auto flex-1 p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 resize-none text-slate-800 dark:text-slate-200 transition-all font-mono text-sm border border-slate-100 dark:border-slate-700 outline-none"
              placeholder={payloadMode === 'chat' ? t('Type message') : t('Describe the image...')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          ) : (
            <textarea
              className="w-full h-40 lg:h-auto flex-1 p-3 md:p-4 bg-slate-900 text-[#a5d6ff] rounded-xl focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all font-mono text-sm border border-slate-800 outline-none whitespace-pre"
              placeholder={'{\n  "prompt": "flying cat",\n  "model": "stable-diffusion"\n}'}
              value={rawPayload}
              onChange={(e) => setRawPayload(e.target.value)}
            />
          )}
        </div>
        <div className="p-3 md:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading || (payloadMode === 'chat' || payloadMode === 'image' ? !prompt.trim() : !rawPayload.trim())}
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
            <div className="flex flex-col gap-4">
              {(() => {
                try {
                  const data = JSON.parse(response);
                  if (data && data.data && Array.isArray(data.data) && data.data[0]) {
                    const img = data.data[0];
                    if (img.url || img.b64_json) {
                       const src = img.url || `data:image/png;base64,${img.b64_json}`;
                       return (
                         <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden self-start shadow-xl">
                           <img src={src} className="max-w-full md:max-w-md block" alt="Generated artifact" referrerPolicy="no-referrer" />
                         </div>
                       );
                    }
                  }
                } catch(e) {}
                return null;
              })()}
              <pre className="whitespace-pre-wrap">{response}</pre>
            </div>
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
