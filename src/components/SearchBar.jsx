/**
 * Glass-styled search input with a leading search icon.
 */
export default function SearchBar({ value, onChange, placeholder = 'Search the repository...', className = '' }) {
  return (
    <div className={`relative flex-grow w-full ${className}`}>
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-all text-[14px] text-neutral-900 placeholder:text-neutral-400"
      />
    </div>
  );
}
