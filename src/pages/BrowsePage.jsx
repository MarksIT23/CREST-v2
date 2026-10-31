import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPapers, getCategories } from '../services/data';
import { useAuth } from '../contexts/AuthContext';
import ResearchCard from '../components/ui/ResearchCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const STATUS_FILTERS = [
  { id: '', label: 'All statuses' },
  { id: 'approved', label: 'Approved' },
  { id: 'pending', label: 'Pending' },
  { id: 'archived', label: 'Archived' },
];

const SORT_OPTIONS = [
  { id: '', label: 'Default order' },
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'viewed', label: 'Most viewed' },
  { id: 'cited', label: 'Most cited' },
  { id: 'title', label: 'Title A–Z' },
];

const SORT_FNS = {
  newest: (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0),
  oldest: (a, b) => (Number(a.year) || 0) - (Number(b.year) || 0),
  viewed: (a, b) => (b.views || 0) - (a.views || 0),
  cited: (a, b) => (b.citations || 0) - (a.citations || 0),
  title: (a, b) => String(a.title || '').localeCompare(String(b.title || '')),
};

const PROGRAMS = [
  { id: '', label: 'All CECT Programs', icon: 'apps' },
  { id: 'BSIT', label: 'BS Information Technology', icon: 'terminal' },
  { id: 'BSCpE', label: 'BS Computer Engineering', icon: 'memory' },
  { id: 'BSECE', label: 'BS Electronics Engineering', icon: 'electric_bolt' },
];

const selectClass =
  'bg-transparent font-body text-[13px] font-bold uppercase tracking-wider text-neutral-900 outline-none cursor-pointer hover:text-black transition-colors py-1 pr-1';

const toolbarLabelClass =
  'flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400';

const PAGE_SIZE = 9;

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const [papers, setPapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedProgram, setSelectedProgram] = useState(searchParams.get('program') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAdviser, setSelectedAdviser] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const resultsRef = useRef(null);
  const { can } = useAuth();
  const isStaff = can(['admin', 'faculty']);

  useEffect(() => {
    getCategories({ program: selectedProgram }).then(setCategories);
  }, [selectedProgram]);

  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      setPage(1);
      try {
        const data = await getPapers({
          search,
          program: selectedProgram,
          category: selectedCategory,
          year: selectedYear,
          status: isStaff ? selectedStatus || undefined : 'approved',
        });
        setPapers(data);
      } catch (err) {
        console.error('Error fetching papers:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPapers, 250);
    return () => clearTimeout(timeoutId);
  }, [search, selectedProgram, selectedCategory, selectedYear, selectedStatus, isStaff]);

  const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);
  const advisers = [...new Set(papers.map((p) => p.advisor).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b))
  );

  const orderedPapers = (() => {
    const filtered = selectedAdviser ? papers.filter((p) => p.advisor === selectedAdviser) : papers;
    const sortFn = SORT_FNS[sort];
    return sortFn ? [...filtered].sort(sortFn) : filtered;
  })();

  const totalPages = Math.max(1, Math.ceil(orderedPapers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visiblePapers = orderedPapers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (p) => {
    setPage(p);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hasActiveFilters = search || selectedProgram || selectedCategory || selectedYear || selectedStatus || selectedAdviser || sort;

  const clearAll = () => {
    setSearch('');
    setSelectedProgram('');
    setSelectedCategory('');
    setSelectedYear('');
    setSelectedStatus('');
    setSelectedAdviser('');
    setSort('');
  };

  const activeStamps = [
    search && { key: 'q', label: `"${search}"`, clear: () => setSearch('') },
    selectedProgram && { key: 'program', label: selectedProgram, clear: () => { setSelectedProgram(''); setSelectedCategory(''); } },
    selectedCategory && { key: 'category', label: selectedCategory, clear: () => setSelectedCategory('') },
    selectedYear && { key: 'year', label: selectedYear, clear: () => setSelectedYear('') },
    selectedAdviser && { key: 'adviser', label: selectedAdviser, clear: () => setSelectedAdviser('') },
    sort && {
      key: 'sort',
      label: SORT_OPTIONS.find((s) => s.id === sort)?.label || sort,
      clear: () => setSort(''),
    },
    isStaff && selectedStatus && {
      key: 'status',
      label: STATUS_FILTERS.find((s) => s.id === selectedStatus)?.label || selectedStatus,
      clear: () => setSelectedStatus(''),
    },
  ].filter(Boolean);

  return (
    <motion.div
      className="max-w-[1280px] mx-auto px-4 md:px-12 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {/* Masthead */}
      <motion.div variants={itemVariants} className="mb-10">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">The collection</p>
        <h1 className="mt-2 font-display text-[32px] md:text-[40px] font-bold text-neutral-900">Browse Repository</h1>
        <p className="text-neutral-600 max-w-2xl text-[16px] mt-3">
          Peer-reviewed capstones and technical manuscripts from across the CECT department — BSIT, BSCpE, and BSECE.
        </p>
      </motion.div>

      {/* Catalog console — one composed filter block under a single ink rule */}
      <motion.div variants={itemVariants} className="border-t-2 border-neutral-900 mb-10">
        {/* Search */}
        <div className="flex items-center gap-3 border-b border-neutral-200 py-4">
          <span className="material-symbols-outlined text-[22px] text-neutral-400 shrink-0">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, thesis #, abstract, author, or keyword..."
            className="w-full bg-transparent text-[16px] md:text-[17px] text-neutral-900 placeholder:text-neutral-400 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="material-symbols-outlined text-[20px] text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
            >
              close
            </button>
          )}
        </div>

        {/* Program index tabs */}
        <div className="flex gap-6 border-b border-neutral-200 overflow-x-auto hide-scrollbar">
          {PROGRAMS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProgram(p.id);
                setSelectedCategory('');
              }}
              className={`flex items-center gap-2 py-3 border-b-2 -mb-px font-body text-[14px] font-bold whitespace-nowrap transition-all ${
                selectedProgram === p.id
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Toolbar — track / year / status + count + clear */}
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 py-3.5">
          <label className={toolbarLabelClass}>
            Track
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={selectClass}>
              <option value="">All tracks</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className={toolbarLabelClass}>
            Year
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={selectClass}>
              <option value="">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          {isStaff && (
            <label className={toolbarLabelClass}>
              Status
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className={selectClass}>
                {STATUS_FILTERS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={toolbarLabelClass}>
            Adviser
            <select value={selectedAdviser} onChange={(e) => { setSelectedAdviser(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">All advisers</option>
              {advisers.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className={toolbarLabelClass}>
            Sort
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className={selectClass}>
              {SORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <div className="ml-auto flex items-center gap-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Showing {visiblePapers.length} of {orderedPapers.length} {orderedPapers.length === 1 ? 'entry' : 'entries'}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900 underline decoration-neutral-300 decoration-2 underline-offset-4 hover:decoration-neutral-900 transition-all"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Active filter stamps */}
      {hasActiveFilters && !loading && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-8">
          {activeStamps.map((s) => (
            <button
              key={s.key}
              onClick={s.clear}
              className="inline-flex items-center gap-1.5 border border-neutral-300 rounded-full pl-3 pr-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-all"
            >
              {s.label}
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Paper grid */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : orderedPapers.length === 0 ? (
        <div className="border-t-2 border-neutral-900 pt-8 pb-4">
          <span className="material-symbols-outlined text-[40px] text-neutral-300 mb-3 block">folder_off</span>
          <h3 className="font-display text-[22px] font-bold text-neutral-900 mb-1">No research papers found</h3>
          <p className="text-neutral-600 text-[14px] mb-5">
            {selectedProgram ? `No ${selectedProgram} papers matched your filter.` : 'Try adjusting your search terms or filters.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[13px] font-bold text-white transition-all hover:bg-neutral-700 active:scale-95"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div ref={resultsRef} className="scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePapers.map((paper) => (
              <ResearchCard key={paper.id} paper={paper} to={`/research/${paper.id}`} showStatus lean />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t-2 border-neutral-900 pt-5">
              <button
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                className="inline-flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-wider text-neutral-900 transition-all hover:gap-3 disabled:text-neutral-300 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    aria-label={`Page ${p}`}
                    className={`w-9 h-9 font-mono text-[12px] font-bold transition-all rounded-full ${
                      p === safePage
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="inline-flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-wider text-neutral-900 transition-all hover:gap-3 disabled:text-neutral-300 disabled:pointer-events-none"
              >
                Next
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
