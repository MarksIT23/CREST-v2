import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { getPaperById } from '../../services/data';
import useSavedPapers from '../../hooks/useSavedPapers';

function InputField({ label, children }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Saved papers (localStorage bookmarks, account-scoped) ─────────
function SavedPapers() {
  const { ids, remove } = useSavedPapers();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setPapers([]);
      return;
    }
    let cancelled = false;
    const resolve = async () => {
      setLoading(true);
      const results = await Promise.all(ids.map((id) => getPaperById(id).catch(() => null)));
      if (cancelled) return;
      const found = [];
      results.forEach((paper, i) => {
        if (paper) found.push(paper);
        else remove(ids[i]); // prune dead ids (removed / inaccessible)
      });
      setPapers(found);
      setLoading(false);
    };
    resolve();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|')]);

  return (
    <section className="glass-card rounded-3xl p-8 md:p-10">
      <div className="flex items-center gap-3 pb-5 border-b border-neutral-200">
        <div className="w-10 h-10 rounded-xl bg-neutral-900/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-neutral-900 text-[22px]">bookmark</span>
        </div>
        <div>
          <h2 className="font-display text-[18px] font-bold text-neutral-900">
            Saved Papers {ids.length > 0 && <span className="text-neutral-400">({ids.length})</span>}
          </h2>
          <p className="text-[13px] text-neutral-500">Your reading list, on every device you sign into.</p>
        </div>
      </div>

      <div className="pt-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-[36px] text-neutral-300 mb-2 block">bookmark_add</span>
            <p className="text-[14px] font-medium text-neutral-500">Nothing saved yet.</p>
            <p className="text-[13px] text-neutral-400 mt-1">
              Tap the bookmark icon on any paper to build your reading list.
            </p>
            <Link
              to="/browse"
              className="inline-block mt-4 px-6 py-2.5 rounded-full bg-neutral-900 text-white text-[13px] font-bold hover:bg-neutral-700 active:scale-95 transition-all"
            >
              Browse repository
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {papers.map((paper) => (
              <li key={paper.id} className="flex items-start gap-3 py-4 first:pt-1 last:pb-0">
                <Link to={`/research/${paper.id}`} className="min-w-0 flex-1 group">
                  <div className="font-bold text-[14px] text-neutral-900 group-hover:underline line-clamp-2 leading-snug">
                    {paper.title}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[12px] text-neutral-500">
                    {paper.program && (
                      <span className="px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider text-[10px] bg-neutral-100 border border-neutral-200">
                        {paper.program}
                      </span>
                    )}
                    {paper.year && <span className="font-mono">{paper.year}</span>}
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => remove(paper.id)}
                  title="Remove from library"
                  aria-label={`Remove ${paper.title} from library`}
                  className="material-symbols-outlined text-[20px] text-neutral-300 hover:text-neutral-900 transition-colors shrink-0 mt-0.5"
                >
                  bookmark_remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'library', label: 'Library', icon: 'bookmark' },
  { id: 'security', label: 'Security', icon: 'lock' },
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { count: savedCount } = useSavedPapers();
  const [tab, setTab] = useState('profile');

  // ── Profile form ──────────────────────────────────────────────
  const [form, setForm] = useState({
    name:      user?.name      || '',
    studentId: user?.studentId || '',
    bio:       user?.bio       || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setProfileSaved(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    await updateProfile(form);
    setProfileSaved(true);
    setProfileSaving(false);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // ── Change Password form ──────────────────────────────────────
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  const setPwField = (key, value) => {
    setPw((p) => ({ ...p, [key]: value }));
    setPwError('');
    setPwSuccess('');
  };

  const validatePw = () => {
    if (!pw.current) return 'Please enter your current password.';
    if (!pw.next)    return 'Please enter a new password.';
    if (pw.next.length < 8) return 'New password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(pw.next)) return 'New password must contain at least one letter.';
    if (pw.next !== pw.confirm) return 'Passwords do not match.';
    return null;
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const err = validatePw();
    if (err) { setPwError(err); return; }

    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: pw.next,
      });
      if (error) {
        setPwError(error.message || 'Failed to change password.');
      } else {
        setPwSuccess('Password changed successfully!');
        setPw({ current: '', next: '', confirm: '' });
      }
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Shared styles ─────────────────────────────────────────────
  const inputCls =
    'w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all';

  const passwordStrength = (p) => {
    if (!p) return null;
    let score = 0;
    if (p.length >= 8)            score++;
    if (p.length >= 12)           score++;
    if (/[A-Z]/.test(p))          score++;
    if (/[0-9]/.test(p))          score++;
    if (/[^A-Za-z0-9]/.test(p))   score++;
    if (score <= 1) return { label: 'Weak',   color: 'bg-red-500',    width: 'w-1/4' };
    if (score <= 2) return { label: 'Fair',   color: 'bg-amber-500',  width: 'w-2/4' };
    if (score <= 3) return { label: 'Good',   color: 'bg-yellow-400', width: 'w-3/4' };
    return             { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = passwordStrength(pw.next);
  const displayName = form.name || user?.email || 'Your Profile';
  const initials = (form.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[720px] mx-auto px-4 md:px-12 py-12"
    >
      {/* ── Identity header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-8 md:p-10">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/[0.06]" />
        <div className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-white/[0.04]" />
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 shrink-0 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-display font-bold text-[26px]">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-[24px] md:text-[30px] font-bold leading-tight truncate">{displayName}</h1>
            <p className="text-white/50 text-[14px] truncate">{user?.email}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {user?.role && (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/10 text-white/80 capitalize">
                  {user.role}
                </span>
              )}
              {user?.program && (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/10 text-white/80">
                  {user.program}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-6 flex gap-1 rounded-full border border-neutral-200 bg-white p-1.5">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="relative flex-1 rounded-full px-4 py-2.5 text-[13px] font-bold transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="profile-tab"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-neutral-900"
                />
              )}
              <span className={`relative z-10 flex items-center justify-center gap-1.5 ${active ? 'text-white' : 'text-neutral-500 hover:text-neutral-900'}`}>
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                {t.label}
                {t.id === 'library' && savedCount > 0 && (
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                    {savedCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Panels ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          {tab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="glass-card rounded-3xl p-8 md:p-10 space-y-5">
              <div className="pb-5 border-b border-neutral-200">
                <h2 className="font-display text-[18px] font-bold text-neutral-900">Account details</h2>
                <p className="text-[13px] text-neutral-500">How you appear across the repository.</p>
              </div>

              <InputField label="Full Name">
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
              </InputField>

              {user?.role === 'student' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-1">
                      <InputField label="Student ID">
                        <input value={form.studentId} onChange={(e) => set('studentId', e.target.value)} placeholder="BSIT-2022-000" className={inputCls} />
                      </InputField>
                    </div>
                  </div>
                </>
              )}

              <InputField label="Bio">
                <textarea
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell the repository community about yourself..."
                  className={inputCls}
                />
              </InputField>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-neutral-900 text-white px-8 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
                {profileSaved && (
                  <span className="text-emerald-600 text-[13px] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Profile updated
                  </span>
                )}
              </div>
            </form>
          )}

          {tab === 'library' && <SavedPapers />}

          {tab === 'security' && (
            <form onSubmit={handlePwSubmit} className="glass-card rounded-3xl p-8 md:p-10 space-y-5">
              <div className="flex items-center gap-3 pb-5 border-b border-neutral-200">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600 text-[22px]">lock_reset</span>
                </div>
                <div>
                  <h2 className="font-display text-[18px] font-bold text-neutral-900">Change Password</h2>
                  <p className="text-[13px] text-neutral-500">Use a strong password you don't use elsewhere.</p>
                </div>
              </div>

              {/* Current password */}
              <InputField label="Current Password">
                <div className="relative">
                  <input
                    type={showPw.current ? 'text' : 'password'}
                    value={pw.current}
                    onChange={(e) => setPwField('current', e.target.value)}
                    placeholder="Your current password"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPw.current ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </InputField>

              {/* New password */}
              <InputField label="New Password">
                <div className="relative">
                  <input
                    type={showPw.next ? 'text' : 'password'}
                    value={pw.next}
                    onChange={(e) => setPwField('next', e.target.value)}
                    placeholder="At least 8 characters"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPw.next ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {/* Strength meter */}
                {pw.next && strength && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className={`text-[11px] font-bold ${
                      strength.label === 'Weak' ? 'text-red-500' :
                      strength.label === 'Fair' ? 'text-amber-500' :
                      strength.label === 'Good' ? 'text-yellow-600' : 'text-emerald-600'
                    }`}>{strength.label} password</p>
                  </div>
                )}
              </InputField>

              {/* Confirm password */}
              <InputField label="Confirm New Password">
                <div className="relative">
                  <input
                    type={showPw.confirm ? 'text' : 'password'}
                    value={pw.confirm}
                    onChange={(e) => setPwField('confirm', e.target.value)}
                    placeholder="Re-enter new password"
                    className={`${inputCls} pr-12 ${
                      pw.confirm && pw.next !== pw.confirm ? 'border-red-400 focus:border-red-500 focus:ring-red-200' :
                      pw.confirm && pw.next === pw.confirm ? 'border-emerald-400' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPw.confirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  {pw.confirm && (
                    <span className={`absolute right-10 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] ${
                      pw.next === pw.confirm ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {pw.next === pw.confirm ? 'check_circle' : 'cancel'}
                    </span>
                  )}
                </div>
                {pw.confirm && pw.next !== pw.confirm && (
                  <p className="text-[12px] text-red-500 mt-1">Passwords do not match.</p>
                )}
              </InputField>

              {/* Error / Success */}
              {pwError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[13px]">
                  <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-[13px] font-medium">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {pwSuccess}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="bg-amber-500 text-white px-8 py-3 rounded-full text-[14px] font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50"
                >
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
