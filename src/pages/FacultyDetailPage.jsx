import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFacultyById } from '../services/data';
import ResearchCard from '../components/ui/ResearchCard';

const viewportOnce = { once: true, margin: '-60px' };

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const paperVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 26 } },
};

function initialsOf(faculty) {
  if (faculty.initials) return faculty.initials;
  return (faculty.name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function FacultyDetailPage() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFacultyById(id)
      .then((data) => setFaculty(data))
      .catch(() => setFaculty(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1024px] px-4 py-12 md:px-12" aria-label="Loading profile">
        <div className="h-4 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="mt-8 flex animate-pulse gap-8">
          <div className="h-28 w-28 shrink-0 rounded-3xl bg-neutral-200" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-7 w-2/3 rounded bg-neutral-200" />
            <div className="h-4 w-1/3 rounded bg-neutral-100" />
            <div className="h-4 w-full rounded bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="material-symbols-outlined mb-3 block text-[48px] text-neutral-300">
            person_search
          </span>
          <h2 className="font-display text-[24px] font-bold mb-2">Faculty not found</h2>
          <p className="mb-6 text-[14px] text-neutral-500">This profile may have been moved or removed.</p>
          <Link
            to="/faculty"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[14px] font-bold text-white transition-all hover:bg-neutral-700 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to directory
          </Link>
        </div>
      </div>
    );
  }

  const papers = Array.isArray(faculty.advisedPaperList)
    ? faculty.advisedPaperList
    : (faculty.papers || []).filter((p) => p && typeof p === 'object');
  const paperCount = faculty.paperCount ?? papers.length;

  return (
    <motion.div
      className="max-w-[1024px] mx-auto px-4 md:px-12 py-12"
      variants={pageVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {/* Breadcrumb */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-[13px] font-medium text-neutral-500 mb-8">
        <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to="/faculty" className="hover:text-neutral-900 transition-colors">Faculty</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-neutral-900 font-semibold truncate">{faculty.name}</span>
      </motion.div>

      {/* ProfileHero — masthead echo */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-neutral-950 text-white"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -right-6 select-none font-display text-[140px] font-bold leading-none text-white/[0.05]"
        >
          {initialsOf(faculty)}
        </div>
        <div className="relative z-10 flex flex-col gap-6 p-8 sm:flex-row sm:items-start md:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.15 }}
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white font-display text-[32px] font-bold text-neutral-950 md:h-28 md:w-28"
          >
            {initialsOf(faculty)}
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-white/50">
              Faculty profile
            </p>
            <h1 className="mt-1 font-display text-[28px] font-bold leading-tight md:text-[36px]">
              {faculty.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {faculty.department && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/90">
                  {faculty.department}
                </span>
              )}
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[12px] font-semibold text-emerald-300">
                {paperCount} {paperCount === 1 ? 'paper' : 'papers'} advised
              </span>
            </div>
            {faculty.bio && (
              <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/70">{faculty.bio}</p>
            )}
          </div>
        </div>
        <div className="relative z-10 flex flex-col gap-2 border-t border-white/10 px-8 py-5 text-[13px] font-medium text-white/70 sm:flex-row sm:gap-8 md:px-10">
          {faculty.specialization && (
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-white/50">workspace_premium</span>
              <span className="font-bold text-white/90">Specialization:</span> {faculty.specialization}
            </span>
          )}
          {faculty.email && (
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-white/50">mail</span>
              {faculty.email}
            </span>
          )}
        </div>
      </motion.section>

      {/* Papers */}
      <motion.div variants={itemVariants} className="mt-12">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-[22px] font-bold text-neutral-900">
            Research Papers{' '}
            <span className="text-[16px] font-medium text-neutral-400">({papers.length})</span>
          </h2>
          <Link
            to="/faculty"
            className="inline-flex items-center gap-1 text-[13px] font-bold text-neutral-500 transition-all hover:gap-2 hover:text-neutral-900"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            All advisers
          </Link>
        </div>
        {papers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 py-14 text-center text-neutral-500">
            <span className="material-symbols-outlined text-[40px] mb-3 block text-neutral-300">description</span>
            <p className="text-[14px] font-medium">No published papers linked to this faculty member yet.</p>
          </div>
        ) : (
          <motion.div
            variants={pageVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {papers.map((paper, i) => (
              <motion.div key={paper.id ?? paper.thesisNumber ?? i} variants={paperVariants}>
                <ResearchCard paper={paper} to={`/research/${paper.id}`} showStatus />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
