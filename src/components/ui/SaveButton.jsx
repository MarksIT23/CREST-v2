import { useNavigate } from 'react-router-dom';
import useSavedPapers from '../../hooks/useSavedPapers';

/**
 * Bookmark toggle for papers. Safe inside <Link> cards — stops
 * propagation so saving never navigates to the detail page.
 * Guests are sent to sign in instead of saving.
 *
 * variant="icon" — footer icon button (cards, rows).
 * variant="full" — full-width sidebar button (detail page).
 */
export default function SaveButton({ paperId, variant = 'icon' }) {
  const { has, toggle, canSave } = useSavedPapers();
  const navigate = useNavigate();
  const saved = has(paperId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canSave) {
      navigate('/auth');
      return;
    }
    toggle(paperId);
  };

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-[14px] font-bold transition-all active:scale-[0.98] ${
          saved
            ? 'bg-neutral-900 text-white hover:bg-neutral-700'
            : 'bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-900'
        }`}
      >
        <span
        className="material-symbols-outlined text-[20px]"
        style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {saved ? 'bookmark' : 'bookmark_add'}
      </span>
        {saved ? 'Saved to Library' : 'Save Paper'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      title={saved ? 'Remove from library' : canSave ? 'Save to library' : 'Log in to save papers'}
      style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
      className={`material-symbols-outlined text-[20px] transition-all shrink-0 hover:scale-110 active:scale-95 ${
        saved ? 'text-neutral-900' : 'text-neutral-300 hover:text-neutral-900'
      }`}
    >
      {saved ? 'bookmark' : 'bookmark_add'}
    </button>
  );
}
