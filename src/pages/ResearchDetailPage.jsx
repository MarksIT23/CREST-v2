import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPaperById, getRelatedPapers } from '../services/data';
import StatusBadge from '../components/ui/StatusBadge';
import ResearchCard from '../components/ui/ResearchCard';
import CiteDialog from '../components/ui/CiteDialog';
import SaveButton from '../components/ui/SaveButton';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function ResearchDetailPage() {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [citing, setCiting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      setLoading(true);
      setPreviewOpen(false);
      setPreviewLoaded(false);
      setPreviewFailed(false);
      const found = await getPaperById(id);
      if (!found) {
        setPaper(null);
        setLoading(false);
        return;
      }
      setPaper(found);
      setRelated(await getRelatedPapers(found));
      setLoading(false);
    };
    fetchPaper();
  }, [id]);

  const hasPdf = paper && paper.pdfUrl && paper.pdfUrl !== '#';
  const pdfFileName = hasPdf ? paper.pdfUrl.split('/').pop() : 'manuscript.pdf';

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-[56px] text-outline mb-4 block">search_off</span>
          <h2 className="font-display text-[24px] font-bold mb-2">Paper not found</h2>
          <p className="text-on-surface-variant text-[14px] mb-6">This paper may have been removed from the repository.</p>
          <Link to="/browse" className="text-neutral-900 font-medium hover:underline">
            Back to repository
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-[1280px] mx-auto px-4 md:px-12 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {/* Breadcrumb */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-[13px] font-medium text-neutral-500 mb-8">
        <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link to="/browse" className="hover:text-neutral-900 transition-colors">Repository</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-neutral-900 font-semibold truncate max-w-xs">{paper.title}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <span className={`px-3 py-1 text-[12px] font-bold rounded-full uppercase tracking-wider font-mono ${paper.program === 'BSCpE'
                ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                : 'bg-neutral-900/5 text-neutral-700 border border-neutral-200'
                }`}>
                {paper.program || 'BSIT'}
              </span>
              <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-[12px] font-semibold rounded-full uppercase tracking-wide font-mono">
                {paper.category}
              </span>
              <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-[12px] font-semibold rounded-full uppercase tracking-wide font-mono">
                {paper.year}
              </span>
              {paper.thesisNumber && (
                <span className="px-3 py-1 bg-neutral-100 text-neutral-500 text-[12px] font-mono font-medium rounded-full">
                  {paper.thesisNumber}
                </span>
              )}
              {paper.status !== 'approved' && <StatusBadge status={paper.status} />}
            </div>

            <h1 className="font-display text-[32px] md:text-[40px] font-bold leading-tight mb-6">{paper.title}</h1>

            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {paper.authors.map((author, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-neutral-900/5 flex items-center justify-center text-[12px] font-bold text-neutral-700"
                      style={{ zIndex: 10 - i }}
                      title={author}
                    >
                      {author.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[14px] font-bold">{paper.authors.join(', ')}</div>
                  <div className="text-[12px] text-on-surface-variant">
                    {paper.advisor ? `Advised by ${paper.advisor}` : 'Primary Researchers'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-on-surface-variant text-[14px] ml-auto">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>{paper.views} views</span>
                </div>
                <div className="flex items-center gap-1.5" title={`${paper.citations || 0} Citations`}>
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  <span>{paper.citations || 0} citations</span>
                </div>
              </div>
            </div>

            {paper.status === 'pending' && paper.reviewNote && (
              <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-[14px] text-amber-900 flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5">pending_actions</span>
                <div>
                  <div className="font-bold text-amber-900">Reviewer Remark (Revision Required)</div>
                  <div className="mt-1 leading-relaxed text-amber-800">{paper.reviewNote}</div>
                </div>
              </div>
            )}
          </div>

          {/* Abstract */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400 mb-3">Abstract</p>
            <p className="text-[16px] leading-relaxed text-neutral-700">{paper.abstract}</p>
          </div>

          {/* Keywords */}
          {paper.keywords && paper.keywords.length > 0 && (
            <div>
              <h3 className="font-display text-[16px] font-bold mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-[13px] rounded-full font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Manuscript Preview */}
          {hasPdf && (
            <div className="pt-8">
              <button
                type="button"
                onClick={() => setPreviewOpen((v) => !v)}
                aria-expanded={previewOpen}
                className="flex w-full items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-all hover:border-neutral-900 hover:shadow-lg active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                  <span className="material-symbols-outlined text-[26px]">picture_as_pdf</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-neutral-900">Manuscript Preview</span>
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${previewOpen ? 'bg-neutral-100 text-neutral-700' : 'bg-neutral-900 text-white'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {previewOpen ? 'expand_less' : 'visibility'}
                  </span>
                  {previewOpen ? 'Hide' : 'Preview'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {previewOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className="flex gap-1.5 shrink-0">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-neutral-400" title={pdfFileName}>
                          {pdfFileName}
                        </span>
                        <a
                          href={paper.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in new tab"
                          aria-label="Open manuscript in new tab"
                          className="material-symbols-outlined text-[20px] text-neutral-400 transition-colors hover:text-white shrink-0"
                        >
                          open_in_new
                        </a>
                        <a
                          href={paper.pdfUrl}
                          download
                          title="Download PDF"
                          aria-label="Download manuscript PDF"
                          className="material-symbols-outlined text-[20px] text-neutral-400 transition-colors hover:text-white shrink-0"
                        >
                          download
                        </a>
                      </div>
                      <div className="relative bg-neutral-100">
                        {!previewLoaded && !previewFailed && (
                          <div className="flex h-[480px] flex-col items-center justify-center gap-3">
                            <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
                            <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-400">Loading manuscript…</p>
                          </div>
                        )}
                        {previewFailed ? (
                          <div className="flex h-[240px] flex-col items-center justify-center gap-2 px-6 text-center">
                            <span className="material-symbols-outlined text-[36px] text-neutral-300">picture_as_pdf</span>
                            <p className="text-[14px] font-medium text-neutral-500">Preview unavailable — download the manuscript instead.</p>
                            <a
                              href={paper.pdfUrl}
                              download
                              className="mt-2 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-[13px] font-bold text-white hover:bg-neutral-700 transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              Download PDF
                            </a>
                          </div>
                        ) : (
                          <iframe
                            title={`Preview of ${paper.title}`}
                            src={paper.pdfUrl}
                            className={`w-full ${previewLoaded ? 'h-[720px]' : 'h-0'}`}
                            onLoad={() => setPreviewLoaded(true)}
                            onError={() => setPreviewFailed(true)}
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Related Papers */}
          {related.length > 0 && (
            <div className="pt-8">
              <h2 className="font-display text-[22px] font-bold mb-6">Related Research in {paper.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((p) => (
                  <ResearchCard key={p.id} paper={p} to={`/research/${p.id}`} />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl sticky top-24">
            <h3 className="font-display text-[18px] font-bold mb-6">Access Options</h3>

            <div className="space-y-3">
              {paper.pdfUrl && paper.pdfUrl !== '#' ? (
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-3.5 px-4 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                  Download Manuscript (PDF)
                </a>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-400 py-3.5 px-4 rounded-full text-[14px] font-medium border border-neutral-200">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                  No PDF Attached
                </div>
              )}

              {paper.sourceUrl && (
                <a
                  href={paper.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-white text-neutral-900 border border-neutral-200 py-3 px-4 rounded-full text-[14px] font-bold hover:border-neutral-900 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">code</span>
                  Source Code Repository
                </a>
              )}

              <SaveButton paperId={paper.id} variant="full" />

              <button
                onClick={() => setCiting(true)}
                className="w-full flex items-center justify-center gap-2 bg-white text-neutral-900 border border-neutral-200 py-3 px-4 rounded-full text-[14px] font-bold hover:border-neutral-900 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">menu_book</span>
                Cite this Paper
              </button>
            </div>

            {paper.advisor && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <div className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Academic Adviser
                </div>
                <div className="font-bold text-[15px]">{paper.advisor}</div>
                <div className="text-[12px] text-on-surface-variant">College of Engineering and Computer Technology</div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-neutral-200 text-[12px] text-on-surface-variant space-y-2">
              <div className="flex justify-between">
                <span>Published:</span>
                <span className="font-medium text-on-surface">{paper.year}</span>
              </div>
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-medium text-on-surface">{paper.program === 'BSCpE' ? 'Computer Engineering' : paper.program === 'BSECE' ? 'Electronics Engineering' : 'Information Technology'}</span>
              </div>
              <div className="flex justify-between">
                <span>Access Level:</span>
                <span className="font-medium text-emerald-600">Open Access</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <CiteDialog paper={citing ? paper : null} onClose={() => setCiting(false)} />
    </motion.div>
  );
}
