'use client';

import React, { useState, useCallback, useEffect } from 'react';

const LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "Java", "C#", "Go", "Rust", "C++", "PHP", "Swift"
];

export default function CodeConverter() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [inputLang, setInputLang] = useState('JavaScript');
  const [outputLang, setOutputLang] = useState('Python');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      console.error('Clipboard copy failed.');
    }
  };

  const convertCode = useCallback(async () => {
    if (!inputCode.trim()) {
      setStatusMessage('⚠️ Please enter source code to convert.');
      return;
    }
    if (inputLang === outputLang) {
      setStatusMessage('⚠️ Source and Target languages are the same.');
      return;
    }

    setIsLoading(true);
    setOutputCode('');
    setStatusMessage('Converting your code...');

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputCode, inputLang, outputLang }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Conversion failed.');
      }

      setOutputCode(data.output || '');
      setStatusMessage('✅ Conversion successful!');
    } catch (error) {
      console.error('Conversion failed:', error);
      setOutputCode('// ❌ Conversion failed. Please try again.');
      setStatusMessage('❌ Conversion failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputCode, inputLang, outputLang]);

  const swapLanguages = () => {
    setInputLang(outputLang);
    setOutputLang(inputLang);
    setInputCode(outputCode);
    setOutputCode(inputCode);
  };

  useEffect(() => {
  const handleShortcut = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') convertCode();
  };
  window.addEventListener('keydown', handleShortcut);
  return () => window.removeEventListener('keydown', handleShortcut);
}, [convertCode]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
            AI Code <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Translator</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Convert code between languages instantly with AI-powered precision
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Language Selectors */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 sm:p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Source Language */}
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-300 mb-2">Source Language</label>
                <select 
                  value={inputLang} 
                  onChange={(e) => setInputLang(e.target.value)}
                  className="cursor-pointer w-full sm:w-48 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                >
                  {LANGUAGES?.map(lang => (
                    <option key={lang} value={lang} className="cursor-pointer bg-slate-800">{lang}</option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <button
                onClick={swapLanguages}
                className="mt-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all transform hover:scale-110 hover:rotate-180 duration-300"
                title="Swap languages"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              {/* Target Language */}
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Language</label>
                <select 
                  value={outputLang} 
                  onChange={(e) => setOutputLang(e.target.value)}
                  className="cursor-pointer w-full sm:w-48 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang} className="bg-slate-800">{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Code Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {/* Input Editor */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Input Code</h3>
                <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">{inputLang}</span>
              </div>
              <div className="relative">
                <textarea
                  rows={20}
                  placeholder="// Paste your source code here..."
                  className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-gray-200 font-mono resize-none outline-none focus:ring-2 focus:ring-purple-500 transition placeholder:text-gray-500"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  spellCheck={false}
                />
                {inputCode && (
                  <button
                    onClick={() => setInputCode('')}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-xs transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Output Editor */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Converted Code</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">{outputLang}</span>
                  {outputCode && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500/80 hover:bg-green-500 text-white rounded-lg text-xs transition"
                    >
                      {isCopied ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="relative bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden" style={{ minHeight: '450px' }}>
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
                      <p className="text-gray-400">Converting code...</p>
                    </div>
                  </div>
                ) : outputCode ? (
                  <div className="overflow-auto max-h-[450px] p-4">
                    <pre className="text-sm font-mono text-gray-200 whitespace-pre-wrap break-words">
                      <code>{outputCode}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <p>Converted code will appear here...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={convertCode}
                disabled={isLoading || !inputCode.trim()}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Converting...
                    </>
                  ) : (
                    <div className='cursor-pointer flex items-center gap-2'>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Convert Code
                    </div>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
              
              {statusMessage && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  statusMessage.includes('✅') 
                    ? 'bg-green-500/20 text-green-300' 
                    : statusMessage.includes('⚠️') || statusMessage.includes('❌')
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  <span className="text-sm font-medium">{statusMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">Convert code between languages in seconds with AI-powered translation</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="bg-pink-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">High Accuracy</h3>
            <p className="text-gray-400 text-sm">Powered by advanced AI to ensure accurate syntax and logic preservation</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">10+ Languages</h3>
            <p className="text-gray-400 text-sm">Support for Python, JavaScript, Java, C++, Go, and many more languages</p>
          </div>
        </div>
      </div>
    </div>
  );
}