import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';
import StatusBadge from './StatusBadge';
import SaveButton from './SaveButton';
import useSavedPapers from '../../hooks/useSavedPapers';

function Avatar({ name, className = 'w-8 h-8 text-[10px]' }) {
  const initials = (name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`${className} rounded-full border-2 border-white bg-neutral-900/5 flex items-center justify-center font-bold text-neutral-700`}
      title={name}
    >
      {initials}
    </div>
  );
}

/**
 * Prisma stores authors as a JSON string on some endpoints (faculty detail
 * returns raw rows). Normalize to an array so every caller is safe.
 */
function authorsToArray(authors) {
  if (Array.isArray(authors)) return authors;
  if (typeof authors === 'string') {
    try {
      const parsed = JSON.parse(authors);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not JSON — fall through to single-name handling below
    }
    return authors ? [authors] : [];
  }
  return [];
}

/**
 * Solid ink marker shown in the card meta row when the paper is saved.
 */
function SavedMark() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
      <span
        className="material-symbols-outlined text-[14px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        bookmark
      </span>
      Saved
    </span>
  );
}
/**
 * Research paper card used across browse / home / dashboard.
 * Links to the paper detail page when `to` is provided.
 * Renders an image header when `image` is provided.
 */
export default function ResearchCard({ paper, to, showStatus = false, footer, image, bare = false, lean = false }) {
  const authors = authorsToArray(paper.authors);
  const { has } = useSavedPapers();
  const saved = has(paper.id);
  if (lean) {
    const leanCard = (
      <GlassCard className="p-6 flex flex-col group border-b-4 border-b-transparent hover:border-b-neutral-900 h-full">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 font-mono ${
              paper.program === 'BSCpE'
                ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                : 'bg-neutral-900/5 text-neutral-700 border border-neutral-200'
            }`}
          >
            {paper.program || 'BSIT'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {saved && <SavedMark />}
            {showStatus && paper.status !== 'approved' && <StatusBadge status={paper.status} />}
            <span className="font-mono text-[12px] font-semibold text-on-surface-variant">{paper.year}</span>
          </div>
        </div>
        {paper.thesisNumber && (
          <p className="mb-2 truncate font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-400" title={paper.thesisNumber}>
            {paper.thesisNumber}
          </p>
        )}
        <h3 className="font-display text-[19px] font-bold leading-snug line-clamp-2 min-h-[54px] group-hover:text-neutral-600 transition-colors">
          {paper.title}
        </h3>
        <p className="mt-2 text-[13px] font-medium text-neutral-500 truncate" title={authors.join(', ')}>
          {authors.join(', ')}
        </p>
        <p className="mt-2.5 text-[13px] leading-relaxed text-neutral-600 line-clamp-3 min-h-[60px]">
          {paper.abstract}
        </p>
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline-variant/30 mt-auto">
          <span className="text-[12px] font-semibold text-neutral-600 truncate" title={paper.category}>
            {paper.category}
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <SaveButton paperId={paper.id} />
            <span className="material-symbols-outlined text-[20px] text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </span>
        </div>
      </GlassCard>
    );

    if (to) {
      return (
        <Link to={to} className="block h-full">
          {leanCard}
        </Link>
      );
    }
    return leanCard;
  }

  const Wrapper = bare ? 'div' : GlassCard;
  const content = (
    <Wrapper
      className={
        bare
          ? 'flex flex-col group h-full'
          : 'p-6 flex flex-col group border-b-4 border-b-transparent hover:border-b-neutral-900 h-full'
      }
    >
      {image && (
        <div className="relative -mx-2 -mt-2 mb-5 h-40 rounded-xl overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 font-mono ${
              paper.program === 'BSCpE'
                ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                : 'bg-neutral-900/5 text-neutral-700 border border-neutral-200'
            }`}
          >
            {paper.program || 'BSIT'}
          </span>
          <span className="px-2.5 py-0.5 bg-surface-variant/80 text-on-surface text-[11px] font-medium rounded-full truncate max-w-[160px]" title={paper.category}>
            {paper.category}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && <SavedMark />}
          {showStatus && <StatusBadge status={paper.status} />}
          <span className="text-[12px] font-semibold text-on-surface-variant">{paper.year}</span>
        </div>
      </div>

      {/* Catalog number */}
      {paper.thesisNumber && (
        <div className="flex items-center gap-1.5 font-mono text-[13px] font-semibold tracking-wide text-neutral-900 mb-2.5">
          <span className="material-symbols-outlined text-[14px] text-neutral-400">tag</span>
          <span className="whitespace-nowrap">{paper.thesisNumber}</span>
        </div>
      )}

      <h3 className="font-display text-[18px] font-bold mb-3 line-clamp-2 group-hover:text-neutral-600 transition-colors">
        {paper.title}
      </h3>
      <p className="text-[14px] text-on-surface-variant mb-6 line-clamp-3 flex-grow">{paper.abstract}</p>

      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30 mt-auto">
        <div className="flex -space-x-2">
          {authors.map((author, i) => (
            <Avatar key={i} name={author} />
          ))}
        </div>
        {footer ? (
          footer
        ) : (
          <div className="flex items-center gap-3 font-mono text-[12px] text-on-surface-variant">
            <div className="flex items-center gap-1" title={`${paper.views || 0} Views`}>
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span className="text-[12px] font-medium">{paper.views || 0}</span>
            </div>
            <div className="flex items-center gap-1" title={`${paper.citations || 0} Citations`}>
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span className="text-[12px] font-medium">{paper.citations || 0}</span>
            </div>
            <SaveButton paperId={paper.id} />
          </div>
        )}
      </div>
    </Wrapper>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}
