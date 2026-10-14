'use client';

export function PrintResumeButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition cursor-pointer"
    >
      PRINT / SAVE PDF
    </button>
  );
}
