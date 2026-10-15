'use client';

import React, { useRef, useState } from 'react';

export function CopyCodeBlock(props: React.ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!preRef.current) return;
    const text = preRef.current.innerText || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback ignored if clipboard permission denied
    }
  };

  return (
    <div className="my-6 rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700 text-xs text-slate-300">
        <span className="font-medium text-slate-300">Code Snippet</span>
        <button
          type="button"
          onClick={handleCopy}
          className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-100 transition cursor-pointer font-medium"
        >
          {copied ? 'Copied ✓' : 'Copy Code'}
        </button>
      </div>
      <pre
        ref={preRef}
        className="font-mono text-xs p-4 overflow-x-auto text-slate-100 leading-relaxed"
        {...props}
      />
    </div>
  );
}
