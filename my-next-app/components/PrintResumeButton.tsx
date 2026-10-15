'use client';

export function PrintResumeButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-bold shadow-xs transition cursor-pointer"
    >
      Print / Save as PDF
    </button>
  );
}
