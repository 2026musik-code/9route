import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, ShieldAlert, Activity, KeyRound, Server, Copy, Check } from 'lucide-react';

export default function DocsView() {
  const { t } = useTranslation();
  const [baseUrl, setBaseUrl] = useState('https://your-domain.com');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`${baseUrl}/api/v1`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCurl = () => {
    const curl = `curl ${baseUrl}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-your_generated_secret_key" \\
  -d '{
    "model": "gc/gemini-3-flash-preview",
    "stream": false,
    "messages": [
      {"role": "user", "content": "Halo! Jawab dengan singkat: apakah koneksi HTTPS domain baruku ini sudah berjalan sempurna?"}
    ]
  }'`;
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">API Documentation</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Integrate intelligent LLM capabilities into your applications. This endpoint provides access to Gemini-3 Flash via our managed gateway, optimized for speed and low-latency interactions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Endpoint Info */}
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Endpoint Detail</h4>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Base URL</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 block overflow-hidden text-ellipsis border border-slate-200 dark:border-slate-700">
                  {baseUrl}/api/v1
                </code>
                <button 
                  onClick={handleCopyUrl}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-slate-300 rounded-lg text-slate-500 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-700"
                  title="Copy URL"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chat Completions</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">POST</span>
                <code className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">/chat/completions</code>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generate a text completion response from a series of chat messages.</p>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Headers</div>
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg p-3 text-xs space-y-2 font-mono">
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold w-24 shrink-0">Content-Type:</span>
                  <span className="text-slate-600 dark:text-slate-300 break-all">application/json</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold w-24 shrink-0">Authorization:</span>
                  <span className="text-slate-600 dark:text-slate-300 break-all">Bearer &lt;YOUR_API_KEY&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Rate Limits & Quotas</h4>
          </div>
          <div className="p-5 flex flex-col gap-4 flex-1">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-1">
              To ensure stability and fair usage, the API enforces limits on requests and tokens based on your subscription tier.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Requests Per Minute (RPM)</span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">60</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tokens Per Day (TPD)</span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">50,000</span>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 flex gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold">429 Too Many Requests:</span> If you exceed the limits, the API will return a 429 status code. You can check your dashboard for live token usage limit updates.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="px-4 py-3 bg-slate-950 flex justify-between items-center border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Example Request (cURL)</span>
          <button 
            onClick={handleCopyCurl}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            {copiedCurl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedCurl ? 'Copied' : 'Copy cURL'}
          </button>
        </div>
        <div className="p-5 overflow-auto">
          <pre className="text-xs sm:text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
{`curl ${baseUrl}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-your_generated_secret_key" \\
  -d '{
    "model": "gc/gemini-3-flash-preview",
    "stream": false,
    "messages": [
      {"role": "user", "content": "Halo! Jawab dengan singkat: apakah koneksi HTTPS domain baruku ini sudah berjalan sempurna?"}
    ]
  }'`}
          </pre>
        </div>
      </div>
    </div>
  );
}
