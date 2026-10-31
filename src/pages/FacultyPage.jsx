import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getFaculty } from '../services/data';
import SearchBar from '../components/SearchBar';
import useDragScroll from '../hooks/useDragScroll';

const viewportOnce = { once: true, margin: '-60px' };

const staggerReveal = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const railRise = {
  hidden: { y: '100%' },
  show: { y: '0%', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const railRule = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const rowIn = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 26 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.18 } },
};

const DEPT_SHORT = {
  'Information Technology': 'IT',
  'Computer Engineering': 'CE',
  'Electronics Engineering': 'ECE',
};

const DEPT_ICON = {
  'Information Technology': 'terminal',
  'Computer Engineering': 'memory',
  'Electronics Engineering': 'electric_bolt',
};

function initialsOf(f) {
  if (f.initials) return f.initials;
  return (f.name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function paperCountOf(f) {
  return f.paperCount ?? f.papers?.length ?? 0;
}

export default function FacultyPage() {
  const deptScroll = useDragScroll();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');

  useEffect(() => {
    getFaculty()
      .then((data) => setFaculty(Array.isArray(data) ? data : []))
      .catch(() => setFaculty([]))
      .finally(() => setLoading(false));
  }, []);

  const departments = useMemo(
    () => [...new Set(faculty.map((f) => f.department).filter(Boolean))],
    [faculty]
  );

  const papersTotal = useMemo(
    () => faculty.reduce((sum, f) => sum + paperCountOf(f), 0),
    [faculty]
  );

  const featured = useMemo(() => {
    if (faculty.length < 3) return null;
    return [...faculty].sort((a, b) => paperCountOf(b) - paperCountOf(a))[0] || null;
  }, [faculty]);

  const isFiltering = search.trim() !== '' || dept !== '';

  const filtered = faculty.filter((f) => {
    const q = search.trim().toLowerCase();
    const matchesDept = !dept || f.department === dept;
    if (!q) return matchesDept;
    return (
      matchesDept &&
      ((f.name || '').toLowerCase().includes(q) ||
        (f.specialization || '').toLowerCase().includes(q))
    );
  });

  // Hide the featured adviser from the roster when it is shown above
  const roster = featured && !isFiltering ? filtered.filter((f) => f.id !== featured.id) : filtered;

  const clearFilters = () => {
    setSearch('');
    setDept('');
  };

  return (
    <>
      {/* Masthead — hero-echo ink block */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden bg-neutral-950 text-white"
      >

        <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-12 pt-14 md:px-12 md:pb-14">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            The Faculty
          </motion.p>
          <div className="overflow-hidden">
            <motion.h1
              variants={railRise}
              initial="hidden"
              animate="show"
              className="mt-4 font-poster text-[36px] font-bold leading-[1.05] md:text-[110px]"
            >
              THE ADVISERS
            </motion.h1>
          </div>
          <motion.div
            variants={railRule}
            initial="hidden"
            animate="show"
            className="mt-6 h-px w-24 origin-left bg-white/40"
          />
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/70"
          >
            Meet the research advisers and discipline leads across the Wesleyan University
            Philippines CECT Department — Information Technology, Computer Engineering
            &amp; Electronics Engineering.
          </motion.p>
          <motion.dl
            variants={staggerReveal}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap gap-x-10 gap-y-4"
          >
            {[
              { value: String(faculty.length), label: 'Advisers' },
              { value: String(departments.length), label: 'Departments' },
              { value: String(papersTotal), label: 'Papers advised' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-[28px] font-bold leading-none md:text-[32px]">
                  {loading ? '–' : s.value}
                </dd>
                <dd className="mt-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  {s.label}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </motion.section>

      <motion.div
        className="mx-auto max-w-[1280px] px-4 py-12 md:px-12"
        variants={staggerReveal}
        initial="hidden"
        animate="show"
      >
        {/* FilterBar — ivory control strip */}
        <motion.div
          variants={fadeUp}
          className="sticky top-[76px] z-20 mb-10 rounded-2xl border border-neutral-200 bg-background/95 p-4 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col gap-4 md:flex-row md:items-center"
        >
          <div className="flex-1 min-w-0">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or specialization..." />
          </div>
          <div
            ref={deptScroll.ref}
            onMouseDown={deptScroll.onMouseDown}
            onMouseMove={deptScroll.onMouseMove}
            onMouseLeave={deptScroll.onMouseLeave}
            onMouseUp={deptScroll.onMouseUp}
            className="flex gap-2 overflow-x-auto hide-scrollbar md:w-auto w-full shrink-0 cursor-grab"
          >
            {['', ...departments].map((d) => {
              const active = dept === d;
              return (
                <button
                  key={d || 'all'}
                  onClick={() => setDept(d)}
                  title={d || 'All departments'}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-[13px] font-bold transition-colors ${active ? 'text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dept-pill"
                      className="absolute inset-0 rounded-full bg-neutral-900"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{d === '' ? 'All' : DEPT_SHORT[d] || d}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Featured lead */}
        {featured && !isFiltering && !loading && (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mb-12"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-neutral-400">star</span>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                Featured adviser
              </h2>
            </div>
            <Link
              to={`/faculty/${featured.id}`}
              className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-950 text-white md:grid-cols-12"
            >
              <div className="relative flex items-center justify-center overflow-hidden bg-neutral-900 p-10 md:col-span-4 md:p-12">
                <span
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center font-display text-[120px] font-bold text-white/[0.05] md:text-[160px]"
                >
                  {initialsOf(featured)}
                </span>
                <span className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-white font-display text-[36px] font-bold text-neutral-950 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2 md:h-32 md:w-32">
                  {initialsOf(featured)}
                </span>
              </div>
              <div className="p-8 md:col-span-8 md:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/90">
                    <span className="material-symbols-outlined text-[14px]">
                      {DEPT_ICON[featured.department] || 'school'}
                    </span>
                    {featured.department}
                  </span>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[12px] font-semibold text-emerald-300">
                    {paperCountOf(featured)} {paperCountOf(featured) === 1 ? 'paper' : 'papers'} advised
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[26px] font-bold leading-tight md:text-[32px]">
                  {featured.name}
                </h3>
                <p className="mt-2 line-clamp-2 max-w-2xl text-[14px] leading-relaxed text-white/65">
                  {featured.bio || featured.specialization || 'Research adviser'}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-white">
                  View profile
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-1.5">
                    arrow_forward
                  </span>
                </span>
              </div>
            </Link>
          </motion.section>
        )}

        {/* Roster */}
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-[22px] font-bold text-neutral-900">
            {isFiltering ? 'Results' : 'All advisers'}
            {!loading && (
              <span className="ml-2 align-middle text-[14px] font-medium text-neutral-400">
                ({roster.length})
              </span>
            )}
          </h2>
          {isFiltering && !loading && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[13px] font-bold text-neutral-500 transition-colors hover:text-neutral-900"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-neutral-200 border-y border-neutral-200" aria-label="Loading advisers">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-5 py-6">
                <div className="hidden font-mono text-[13px] text-neutral-300 sm:block">0{i + 1}</div>
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-neutral-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-neutral-200" />
                  <div className="h-3 w-1/2 rounded bg-neutral-100" />
                </div>
                <div className="hidden h-8 w-24 rounded-full bg-neutral-100 md:block" />
              </div>
            ))}
          </div>
        ) : roster.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 py-20 text-center">
            <span className="material-symbols-outlined mb-3 block text-[48px] text-neutral-300">
              person_search
            </span>
            <p className="font-display text-[18px] font-bold text-neutral-900">No advisers found</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-neutral-500">
              {isFiltering
                ? 'Try a different name, specialization, or department.'
                : 'No faculty profiles have been published yet.'}
            </p>
            {isFiltering && (
              <button
                onClick={clearFilters}
                className="mt-6 rounded-full bg-neutral-900 px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-neutral-700 active:scale-95"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <motion.div variants={staggerReveal} initial="hidden" whileInView="show" viewport={viewportOnce}>
            <div className="divide-y divide-neutral-200 border-y border-neutral-200">
              <AnimatePresence mode="popLayout">
                {roster.map((f, i) => (
                  <motion.div
                    key={f.id}
                    variants={rowIn}
                    layout
                    exit="exit"
                    initial="hidden"
                    whileInView="show"
                    viewport={viewportOnce}
                  >
                    <Link
                      to={`/faculty/${f.id}`}
                      className="group flex items-center gap-4 py-5 transition-all duration-300 hover:bg-neutral-50 sm:gap-6 sm:px-4 md:hover:px-6"
                    >
                      <span className="hidden w-8 shrink-0 font-mono text-[13px] font-medium text-neutral-300 transition-colors group-hover:text-neutral-900 sm:block">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 font-display text-[18px] font-bold text-white transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2 md:h-16 md:w-16">
                        {initialsOf(f)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-[17px] font-bold text-neutral-900">
                          {f.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-neutral-500">
                          {f.specialization || 'Research adviser'}
                        </span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900/5 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700">
                            {DEPT_SHORT[f.department] || f.department || 'CECT'}
                          </span>
                          <span className="text-[12px] font-medium text-neutral-400">
                            {paperCountOf(f)} {paperCountOf(f) === 1 ? 'paper' : 'papers'}
                          </span>
                        </span>
                      </span>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-all duration-300 group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                        <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          arrow_outward
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
