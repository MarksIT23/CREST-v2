import { useState } from 'react';

const STORAGE_KEY = 'crest_wip_dismissed';

export default function WipBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Storage may be unavailable (private mode) — the notice just reappears.
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] sm:left-auto sm:right-6 sm:w-[380px]">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
        <span className="material-symbols-outlined mt-0.5 text-[20px] text-amber-700">
          construction
        </span>
        <div className="flex-1 text-[13px] leading-snug text-amber-900">
          <span className="font-bold">Work in progress.</span> CREST is under active
          development — some features may be incomplete or change without notice.
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss work-in-progress notice"
          className="mt-0.5 rounded-full p-1 text-amber-700 transition-colors hover:bg-amber-200/60 hover:text-amber-900"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
