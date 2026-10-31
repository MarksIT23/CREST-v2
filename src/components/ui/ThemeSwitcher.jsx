import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeSwitcher({ onDark = false }) {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change color scheme"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 ${
          onDark
            ? 'text-white hover:bg-white/10'
            : 'text-neutral-600 hover:bg-neutral-900/5 hover:text-neutral-900'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">palette</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-background shadow-2xl animate-fade-in"
        >
          <div className="px-4 pb-1 pt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Color scheme
          </div>
          <div className="pb-2">
            {themes.map((preset) => {
              const active = preset.id === theme;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setTheme(preset.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-900/5 ${
                    active ? 'bg-neutral-900/5' : ''
                  }`}
                >
                  <span className="flex shrink-0 items-center -space-x-1.5">
                    {preset.swatches.map((color) => (
                      <span
                        key={color}
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ background: color }}
                      />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-neutral-900">
                      {preset.name}
                    </span>
                    <span className="block truncate text-[11px] text-neutral-500">
                      {preset.description}
                    </span>
                  </span>
                  {active && (
                    <span className="material-symbols-outlined text-[18px] text-neutral-900">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
