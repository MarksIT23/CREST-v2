import { useState } from 'react';
import { Link } from 'react-router-dom';

const APPROVE_CHECKS = [
  { id: 'manuscript', label: 'Manuscript complete and readable', hint: 'Full document opens, all sections present' },
  { id: 'metadata', label: 'Title, authors, and adviser verified', hint: 'Names, thesis number, and program match the record' },
  { id: 'originality', label: 'Originality cleared', hint: 'Plagiarism / similarity check reviewed' },
];

const PENDING_REASONS = [
  'Incomplete submission',
  'Scope / quality concerns',
  'Metadata issues',
  'Other',
];

/**
 * Stepped review gate for approve / pending decisions.
 * Approve: verify checklist -> record (approver + remarks) -> type-to-confirm.
 * Pending: reason (category + details) -> confirm.
 * The dialog composes an audit note; the parent persists it via updatePaperStatus.
 */
export default function ReviewDecisionDialog({ paper, decision, reviewerName, onClose, onConfirm }) {
  const isApprove = decision === 'approved';
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState({ manuscript: false, metadata: false, originality: false });
  const [remarks, setRemarks] = useState('');
  const [typed, setTyped] = useState('');
  const [reasonCategory, setReasonCategory] = useState(PENDING_REASONS[0]);
  const [reasonDetails, setReasonDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const allChecked = Object.values(checks).every(Boolean);
  const reasonValid = reasonDetails.trim().length >= 10;
  const confirmTyped = typed.trim().toUpperCase() === 'APPROVED';

  const steps = isApprove ? ['Verify', 'Record', 'Confirm'] : ['Remark', 'Confirm'];
  const lastStep = steps.length - 1;

  const canNext = () => {
    if (isApprove) return step === 0 ? allChecked : true;
    return step === 0 ? reasonValid : true;
  };

  const buildNote = () => {
    if (isApprove) {
      const base = `Verified: manuscript, metadata, originality. Decision by ${reviewerName}.`;
      return remarks.trim() ? `${base} Remarks: ${remarks.trim()}` : base;
    }
    return `Decision by ${reviewerName}. Pending reason [${reasonCategory}]: ${reasonDetails.trim()}`;
  };

  // The student-visible remark (stored as review_note in research_records)
  const buildPendingRemark = () => {
    if (isApprove) return null;
    return `[${reasonCategory}] ${reasonDetails.trim()}`;
  };

  const handleConfirm = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm(buildNote(), buildPendingRemark());
      onClose();
    } catch {
      setError('Could not record the decision. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const toggleCheck = (id) => setChecks((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isApprove ? 'Review for approval' : 'Review for pending'}
    >
      <div
        className="w-full max-w-lg bg-background rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 md:px-8 pt-6 pb-5 border-b border-neutral-200">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
            {isApprove ? 'Approval review' : 'Pending review'}
          </p>
          <h2 className="mt-1 font-display text-[22px] font-bold text-neutral-900">
            {isApprove ? 'Approve this capstone?' : 'Mark as Pending?'}
          </h2>
          {/* Stepper */}
          <div className="mt-4 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    i === step ? 'bg-neutral-900 text-white' : i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {i + 1}. {s}
                </span>
                {i < steps.length - 1 && <span className="w-4 h-px bg-neutral-300" />}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 md:px-8 py-6 max-h-[55vh] overflow-y-auto">
          {/* Paper recap — always visible */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 mb-6">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              {paper.thesisNumber || 'Unnumbered'} · {paper.program} · {paper.category} · {paper.year}
            </div>
            <div className="font-display text-[16px] font-bold text-neutral-900 leading-snug">{paper.title}</div>
            <div className="text-[13px] text-neutral-600 mt-1">{(paper.authors || []).join(', ')}</div>
            <Link
              to={`/research/${paper.id}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-neutral-900 underline decoration-neutral-300 decoration-2 underline-offset-4 hover:decoration-neutral-900"
            >
              Open full record
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </Link>
          </div>

          {isApprove && step === 0 && (
            <div className="space-y-3">
              <p className="text-[14px] text-neutral-600">Confirm each item before this work enters the public archive:</p>
              {APPROVE_CHECKS.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                    checks[c.id] ? 'border-neutral-900 bg-neutral-900/[0.03]' : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checks[c.id]}
                    onChange={() => toggleCheck(c.id)}
                    className="mt-1 h-4 w-4 accent-neutral-900"
                  />
                  <span>
                    <span className="block text-[14px] font-bold text-neutral-900">{c.label}</span>
                    <span className="block text-[12px] text-neutral-500 mt-0.5">{c.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {isApprove && step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Reviewing as
                </label>
                <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] font-bold text-neutral-900">
                  {reviewerName}
                </div>
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Approval remarks <span className="text-neutral-400 font-medium normal-case tracking-normal">(optional — kept in the activity log)</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="e.g. Panel grade 1.25. Cleared for public archiving."
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 outline-none focus:border-neutral-900 resize-none"
                />
              </div>
            </div>
          )}

          {isApprove && step === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-[13px] leading-relaxed text-emerald-900">
                <span className="font-bold">This will publish</span> “{paper.title}” to the public archive as approved by {reviewerName}. Verified: manuscript, metadata, originality.
                {remarks.trim() && <span className="block mt-1">Remarks: {remarks.trim()}</span>}
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Type APPROVED to confirm
                </label>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="APPROVED"
                  autoComplete="off"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 font-mono text-[14px] font-bold uppercase tracking-widest text-neutral-900 outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          )}

          {!isApprove && step === 0 && (
            <div className="space-y-4">
              <p className="text-[14px] text-neutral-600">
                A pending remark is <span className="font-bold text-neutral-900">required</span> — it is shown to the student and logged for revision guidance.
              </p>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Reason category
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 outline-none focus:border-neutral-900"
                >
                  {PENDING_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Remark <span className="text-neutral-400 font-medium normal-case tracking-normal">(min. 10 characters — visible to student)</span>
                </label>
                <textarea
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  rows={4}
                  placeholder="Explain what must change before this paper can be approved…"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 outline-none focus:border-neutral-900 resize-none"
                />
              </div>
            </div>
          )}

          {!isApprove && step === 1 && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-[13px] leading-relaxed text-amber-900">
              <span className="font-bold">This will mark as pending</span> “{paper.title}” as decided by {reviewerName}.
              <span className="block mt-1">Pending Reason [{reasonCategory}]: {reasonDetails.trim()}</span>
            </div>
          )}

          {error && <p className="mt-4 text-[13px] font-bold text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-5 border-t border-neutral-200 flex items-center justify-between gap-3 bg-white/60">
          <div>
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={busy}
                className="text-[13px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-50"
              >
                ← Back
              </button>
            ) : (
              <button
                onClick={onClose}
                disabled={busy}
                className="text-[13px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
          {step < lastStep ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext() || busy}
              className="px-6 py-3 rounded-full text-[13px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100"
            >
              Continue
            </button>
          ) : isApprove ? (
            <button
              onClick={handleConfirm}
              disabled={!confirmTyped || busy}
              className="px-6 py-3 rounded-full text-[13px] font-bold bg-emerald-700 text-white hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100"
            >
              {busy ? 'Publishing…' : 'Publish to archive'}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={busy}
              className="px-6 py-3 rounded-full text-[13px] font-bold bg-amber-600 text-white hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-40"
            >
              {busy ? 'Recording…' : 'Mark as Pending'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
