import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPapers, getDrafts, deleteDraft } from '../../services/data';
import { useAuth } from '../../contexts/AuthContext';
import useSavedPapers from '../../hooks/useSavedPapers';
import StatusBadge from '../../components/ui/StatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function authorList(authors) {
  if (Array.isArray(authors)) return authors.join(', ');
  if (typeof authors === 'string') {
    try {
      const parsed = JSON.parse(authors);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch {
      // Not JSON — fall through to raw string below
    }
    return authors;
  }
  return '';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const { count: savedCount } = useSavedPapers();
  const [papers, setPapers] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(location.state?.toast || '');

  useEffect(() => {
    if (toast) setTimeout(() => setToast(''), 3000);
  }, [toast]);

  const refresh = useCallback(async () => {
    const [myPapers, myDrafts] = await Promise.all([
      getPapers({ author: user?.email }),
      getDrafts(user?.email),
    ]);
    setPapers(myPapers);
    setDrafts(myDrafts);
    setLoading(false);
  }, [user?.email]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDeleteDraft = async (id) => {
    await deleteDraft(id);
    refresh();
  };

  const statusCounts = papers.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    { approved: 0, pending: 0, rejected: 0, archived: 0 }
  );

  const firstName = user?.name?.split(' ')[0] || 'there';
  const heroLine = statusCounts.pending > 0
    ? `You have ${statusCounts.pending} ${statusCounts.pending === 1 ? 'paper' : 'papers'} awaiting review.`
    : drafts.length > 0
      ? 'Pick up a draft or share something new with the college.'
      : 'Share your first study with the college.';

  const stats = [
    { label: 'Approved', value: statusCounts.approved, icon: 'check_circle', tile: 'bg-emerald-500/10 text-emerald-600' },
    { label: 'Pending review', value: statusCounts.pending, icon: 'hourglass_top', tile: 'bg-amber-500/10 text-amber-600' },
    { label: 'Drafts', value: drafts.length, icon: 'draft', tile: 'bg-neutral-900/5 text-neutral-700' },
    { label: 'Saved', value: savedCount, icon: 'bookmark', tile: 'bg-neutral-900/5 text-neutral-700' },
  ];

  return (
    <div className="max-w-[1080px] mx-auto px-4 md:px-12 py-12">
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-xl text-[14px] font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="show">
        {/* Hero */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-8 md:p-10">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/[0.06]" />
          <div className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-white/[0.04]" />
          <div className="relative">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">Student portal</p>
            <h1 className="mt-2 font-display text-[28px] md:text-[38px] font-bold leading-tight">
              {greeting()}, {firstName}.
            </h1>
            <p className="mt-2 max-w-md text-[14px] text-white/60">{heroLine}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-neutral-900 transition-all hover:bg-white/85 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Submission
              </Link>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[14px] font-bold text-white transition-all hover:border-white/60 active:scale-95"
              >
                Browse repository
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mt-6">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.tile}`}>
                <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
              </span>
              <span>
                <span className="block font-display text-[26px] font-bold leading-none text-neutral-900">{s.value}</span>
                <span className="mt-1 block text-[12px] font-medium text-neutral-500">{s.label}</span>
              </span>
            </div>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
            {/* Submissions feed */}
            <motion.section variants={itemVariants} className="lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-[20px] font-bold text-neutral-900">My Submissions</h2>
                {papers.length > 0 && (
                  <span className="rounded-full bg-neutral-900/5 border border-neutral-200 px-3 py-1 font-mono text-[11px] font-bold text-neutral-600">
                    {papers.length} total
                  </span>
                )}
              </div>
              {papers.length === 0 ? (
                <div className="glass-card rounded-3xl p-12 text-center">
                  <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900/5 text-neutral-400">
                    <span className="material-symbols-outlined text-[32px]">upload_file</span>
                  </span>
                  <p className="font-display text-[18px] font-bold text-neutral-900">No submissions yet</p>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] text-neutral-500">Your published and in-review papers will live here.</p>
                  <Link
                    to="/submit"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[13px] font-bold text-white transition-all hover:bg-neutral-700 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Submit your first paper
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {papers.map((paper) => (
                    <div key={paper.id} className="glass-card group rounded-2xl p-5 transition-all hover:shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">{paper.category}</span>
                            {paper.thesisNumber && <span className="font-mono text-[11px] text-neutral-500">{paper.thesisNumber}</span>}
                            <span className="text-[11px] text-neutral-500">{paper.year}</span>
                          </div>
                          <h3 className="truncate font-bold text-[15px] text-neutral-900" title={paper.title}>{paper.title}</h3>
                          <p className="mt-0.5 truncate text-[12px] text-neutral-500" title={authorList(paper.authors)}>
                            {authorList(paper.authors)}
                          </p>
                          <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-neutral-400">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">visibility</span>
                              {paper.views || 0}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">menu_book</span>
                              {paper.citations || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <StatusBadge status={paper.status} />
                          <Link
                            to={`/research/${paper.id}`}
                            aria-label={`View ${paper.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                          >
                            <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
                          </Link>
                        </div>
                      </div>
                      {paper.status === 'pending' && paper.reviewNote && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-[12px] text-amber-800">
                          <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0 text-amber-600">pending_actions</span>
                          <div>
                            <span className="font-bold block text-amber-900">Reviewer remark:</span>
                            <span className="leading-relaxed">{paper.reviewNote}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Side rail */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Drafts */}
              <section className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <span className="material-symbols-outlined text-[20px]">draft</span>
                  </span>
                  <div>
                    <h2 className="font-display text-[16px] font-bold text-neutral-900">Drafts</h2>
                    <p className="text-[12px] text-neutral-500">{drafts.length === 0 ? 'Nothing in progress' : `${drafts.length} in progress`}</p>
                  </div>
                </div>
                {drafts.length === 0 ? (
                  <p className="rounded-xl bg-neutral-900/[0.03] border border-neutral-200 px-4 py-3 text-[13px] text-neutral-500">
                    Ideas start here — drafts you save while submitting will wait for you.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {drafts.slice(0, 4).map((d) => (
                      <div key={d.id} className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-[13px] font-bold text-neutral-900" title={d.title}>{d.title || 'Untitled draft'}</h4>
                          <p className="text-[11px] text-neutral-500">
                            {d.category || 'No category'} · {d.savedAt ? new Date(d.savedAt).toLocaleDateString() : 'recently'}
                          </p>
                        </div>
                        <Link to="/submit" className="shrink-0 text-[12px] font-bold text-neutral-900 hover:underline">
                          Continue
                        </Link>
                        <button
                          onClick={() => handleDeleteDraft(d.id)}
                          title="Delete draft"
                          aria-label={`Delete draft ${d.title || ''}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Reading list teaser */}
              <section className="relative overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white">
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/[0.06]" />
                <div className="relative">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <span className="material-symbols-outlined text-[20px]">bookmark</span>
                    </span>
                    <div>
                      <h2 className="font-display text-[16px] font-bold">Reading list</h2>
                      <p className="text-[12px] text-white/50">{savedCount === 0 ? 'Nothing saved yet' : `${savedCount} saved`}</p>
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed text-white/60">
                    Papers you bookmark live in your profile library, on every device you sign into.
                  </p>
                  <Link
                    to="/profile"
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-white transition-all hover:gap-2.5"
                  >
                    Open my library
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </section>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
