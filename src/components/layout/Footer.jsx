import { Link } from 'react-router-dom';

const EXPLORE_LINKS = [
  { label: 'Browse repository', to: '/browse' },
  { label: 'Faculty', to: '/faculty' },
  { label: 'About the archive', to: '/about' },
  { label: 'Submit capstone', to: '/submit' },
  { label: 'Sign in', to: '/auth' },
];

const PROGRAM_LINKS = [
  { label: 'BS Information Technology', to: '/browse?program=BSIT' },
  { label: 'BS Computer Engineering', to: '/browse?program=BSCpE' },
  { label: 'BS Electronics Engineering', to: '/browse?program=BSECE' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative z-10 bg-neutral-950 text-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 pt-14 pb-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
              Wesleyan University Philippines — CECT
            </p>
            <p className="mt-3 font-display text-[40px] font-bold leading-none tracking-tight md:text-[48px]">
              CREST
            </p>
            <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Capstone Research Electronic Storage and Tracking
            </p>
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-white/60">
              The institutional archive for peer-reviewed capstone work from the College of
              Engineering and Computer Technology.
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-[14px] font-semibold text-white/75 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Programs
            </p>
            <ul className="mt-4 space-y-2.5">
              {PROGRAM_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-[14px] font-semibold text-white/75 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-1 flex md:justify-end items-start">
            <button
              onClick={scrollTop}
              aria-label="Back to top"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all hover:border-white/60 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
            © {year} CECT Research Repository
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
            BSIT · BSCpE · BSECE
          </p>
        </div>
      </div>
    </footer>
  );
}
