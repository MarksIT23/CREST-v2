import { motion, AnimatePresence } from 'framer-motion';

const TONES = {
  approve: {
    icon: 'check_circle',
    iconCls: 'bg-emerald-500/15 text-emerald-600',
    btnCls: 'bg-emerald-500 hover:bg-emerald-600',
  },
  danger: {
    icon: 'warning',
    iconCls: 'bg-red-500/10 text-red-600',
    btnCls: 'bg-red-500 hover:bg-red-600',
  },
  neutral: {
    icon: 'help',
    iconCls: 'bg-neutral-900/5 text-neutral-900',
    btnCls: 'bg-neutral-900 hover:bg-neutral-700',
  },
};

/**
 * Shared confirmation dialog for account decisions (approve / reject /
 * reinstate / remove). Rendered when `pending` is set:
 * { tone, icon, title, message, detail?, confirmLabel, onConfirm }
 */
export default function ConfirmDialog({ pending, busy, onConfirm, onCancel }) {
  const tone = TONES[pending?.tone] || TONES.neutral;
  return (
    <AnimatePresence>
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => { if (!busy) onCancel(); }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-background w-full max-w-md rounded-3xl p-8 shadow-2xl"
          >
            <span className={`material-symbols-outlined w-11 h-11 rounded-2xl flex items-center justify-center text-[24px] ${tone.iconCls}`}>
              {pending.icon || tone.icon}
            </span>
            <h3 className="mt-4 font-display text-[20px] font-bold text-neutral-900">{pending.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{pending.message}</p>
            {pending.detail && (
              <p className="mt-3 font-mono text-[12px] text-neutral-500 bg-neutral-900/5 border border-neutral-200 rounded-xl px-3 py-2 break-words">
                {pending.detail}
              </p>
            )}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                disabled={busy}
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-full text-[14px] font-bold text-white active:scale-[0.98] transition-all disabled:opacity-50 ${tone.btnCls}`}
              >
                {busy ? 'Please wait…' : pending.confirmLabel || 'Confirm'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className="px-6 py-3 rounded-full text-[14px] font-medium bg-neutral-100 text-neutral-500 hover:text-neutral-900 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
