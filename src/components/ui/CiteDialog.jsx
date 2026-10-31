import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CITATION_STYLES } from '../../utils/citations';

/**
 * Citation picker dialog: APA / MLA / IEEE preview with copy,
 * plus BibTeX download. Rendered when `paper` is set.
 */
export default function CiteDialog({ paper, onClose }) {
  const [style, setStyle] = useState('apa');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStyle('apa');
    setCopied(false);
  }, [paper?.id]);

  const text = useMemo(() => {
    if (!paper) return '';
    const entry = CITATION_STYLES.find((s) => s.id === style);
    return entry ? entry.format(paper) : '';
  }, [paper, style]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy this citation:', text);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = style === 'bibtex' ? 'citation.bib' : 'citation.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {paper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-background w-full max-w-lg rounded-3xl p-8 shadow-2xl"
          >
            <span className="material-symbols-outlined w-11 h-11 rounded-2xl flex items-center justify-center text-[24px] bg-neutral-900/5 text-neutral-900">
              menu_book
            </span>
            <h3 className="mt-4 font-display text-[20px] font-bold text-neutral-900">Cite this paper</h3>
            <p className="mt-1 text-[13px] text-neutral-500 line-clamp-1">{paper.title}</p>

            <div className="mt-4 flex gap-2 flex-wrap">
              {CITATION_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                    style === s.id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-neutral-700 bg-neutral-900/5 border border-neutral-200 rounded-xl px-4 py-3 break-words whitespace-pre-wrap font-body">
              {text}
            </p>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-3 rounded-full text-[14px] font-bold text-white bg-neutral-900 hover:bg-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Copied!' : style === 'bibtex' ? 'Copy BibTeX' : 'Copy citation'}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                title={style === 'bibtex' ? 'Download .bib file' : 'Download .txt file'}
                className="w-12 h-12 shrink-0 self-center rounded-full bg-neutral-100 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-full text-[14px] font-medium bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
