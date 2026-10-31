import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

const ROLES = [
  { id: 'student', label: 'Student', icon: 'school' },
  { id: 'faculty', label: 'Faculty / Adviser', icon: 'co_present' },
];

const PROGRAMS = [
  { id: 'BSIT', label: 'BSIT', sub: 'Info Tech', icon: 'terminal' },
  { id: 'BSCpE', label: 'BSCpE', sub: 'Comp Eng', icon: 'memory' },
  { id: 'BSECE', label: 'BSECE', sub: 'ECE', icon: 'electric_bolt' },
];

const formVariants = {
  enter: (d) => ({ opacity: 0, x: 36 * d }),
  center: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: -36 * d }),
};

const PANEL_PROGRAMS = [
  { label: 'BS Information Technology', icon: 'terminal' },
  { label: 'BS Computer Engineering', icon: 'memory' },
  { label: 'BS Electronics Engineering', icon: 'electric_bolt' },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [program, setProgram] = useState('BSIT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingMsg, setPendingMsg] = useState('');
  const [dir, setDir] = useState(1);
  const [step, setStep] = useState(1);
  const [stepDir, setStepDir] = useState(1);
  const [studentId, setStudentId] = useState('');

  const FLOW = role === 'student'
    ? [
        { key: 'account', label: 'Account' },
        { key: 'role', label: 'Role' },
        { key: 'student', label: 'Student ID' },
        { key: 'department', label: 'Department' },
      ]
    : [
        { key: 'account', label: 'Account' },
        { key: 'role', label: 'Role' },
        { key: 'department', label: 'Department' },
      ];
  const totalSteps = FLOW.length;
  const currentKey = FLOW[Math.min(step, totalSteps) - 1].key;
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const homeFor = (r) => {
    if (r === 'admin') return '/admin';
    if (r === 'faculty') return '/portal';
    return '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMsg('');
    setSubmitting(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register({
            name,
            email,
            password,
            role,
            program,
            studentId: role === 'student' ? studentId : '',
          });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Registration received — account stays pending until faculty/admin approval
      if (result.pending) {
        setPendingMsg(result.message);
        return;
      }

      navigate(homeFor(result.user.role));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (login) => {
    setDir(login ? -1 : 1);
    setIsLogin(login);
    setError('');
    setStep(1);
    setStepDir(1);
  };

  const nextStep = () => {
    const form = document.getElementById('auth-form');
    if (form && !form.reportValidity()) return;
    setStepDir(1);
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const prevStep = () => {
    setStepDir(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  const pickRole = (id) => {
    setRole(id);
    if (id !== 'student') setStep((s) => Math.min(s, 3));
  };

  const labelCls = 'block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5';
  const inputCls =
    'w-full bg-transparent border-0 border-b-2 border-neutral-200 focus:border-neutral-900 outline-none transition-colors text-[16px] text-neutral-900 placeholder:text-neutral-300 py-2.5 pl-9 pr-2 rounded-none';
  const iconCls = 'material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[20px] text-neutral-300 pointer-events-none';

  return (
    <motion.div
      className="max-w-[1120px] mx-auto px-4 md:px-12 py-6 md:py-8"
      variants={pageVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-neutral-900 rounded-[24px] overflow-hidden bg-background md:h-[calc(100vh-9rem)] md:min-h-[560px]">
        {/* Ink brand panel */}
        <div className="relative bg-neutral-950 text-white p-8 md:p-10 flex flex-col justify-between overflow-hidden min-h-[320px]">
          <span
            aria-hidden
            className="absolute -bottom-8 -right-4 font-display font-bold text-[26vw] md:text-[180px] leading-none text-white/[0.04] select-none pointer-events-none"
          >
            C
          </span>

          <div className="relative">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
              Wesleyan University Philippines — CECT
            </p>
            <p className="mt-4 font-display text-[52px] md:text-[64px] font-bold leading-none tracking-tight">
              CREST
            </p>
            <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 leading-relaxed">
              Capstone Research Electronic
              <br />
              Storage and Tracking
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={isLogin ? 'login-copy' : 'register-copy'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-6 max-w-xs text-[14px] leading-relaxed text-white/60"
              >
                {isLogin
                  ? 'Sign in to submit manuscripts, track reviews, and manage your shelf in the archive.'
                  : 'Register for a members account to submit capstones and join the CECT research collection.'}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="relative mt-10">
            <div className="space-y-2.5">
              {PANEL_PROGRAMS.map((p) => (
                <div key={p.label} className="flex items-center gap-3 text-white/70">
                  <span className="material-symbols-outlined text-[18px] text-white/40">{p.icon}</span>
                  <span className="text-[13px] font-semibold">{p.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                Members ledger
              </span>
              <Link
                to="/browse"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white/75 hover:text-white transition-colors"
              >
                Browse as guest
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="p-8 md:p-10 md:flex md:flex-col md:overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              No. WU-CECT-MBR
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Open
            </span>
          </div>

          {/* Segmented mode switch */}
          <div className="mt-4 grid grid-cols-2 border-b-2 border-neutral-900">
            {[
              { login: true, label: 'Sign in' },
              { login: false, label: 'Register' },
            ].map((m) => {
              const active = isLogin === m.login;
              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => switchMode(m.login)}
                  className={`py-3 font-mono text-[12px] font-bold uppercase tracking-[0.2em] border-b-[3px] -mb-[2.5px] transition-all ${
                    active ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-300 hover:text-neutral-600'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={pendingMsg ? 'pending' : isLogin ? 'login' : 'register'}
              custom={dir}
              variants={formVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="md:m-auto md:w-full flex flex-col justify-center"
            >
          <h2 className="mt-6 font-display text-[26px] md:text-[30px] font-bold text-neutral-900 leading-tight">
            {pendingMsg ? 'Account submitted' : isLogin ? 'WELCOME' : 'Create account'}
          </h2>
          <p className="mt-1.5 text-[14px] text-neutral-500">
            {pendingMsg
              ? 'Your registration is awaiting confirmation.'
              : isLogin
                ? 'Access the Wesleyan CECT Research Repository.'
                : 'Join the CECT platform — accounts activate after approval.'}
          </p>

          {/* Pending approval notice */}
          {pendingMsg && (
            <div className="mt-7 border-2 border-amber-500/40 bg-amber-50 rounded-2xl p-6 text-center">
              <span className="material-symbols-outlined text-amber-600 text-[36px]">pending_actions</span>
              <p className="mt-2 text-[14px] text-amber-800 leading-relaxed">{pendingMsg}</p>
              <button
                onClick={() => { setPendingMsg(''); setIsLogin(true); }}
                className="mt-4 w-full border-2 border-neutral-900 py-3 rounded-full text-[13px] font-bold text-neutral-900 hover:bg-neutral-900 hover:text-white active:scale-95 transition-all"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {!pendingMsg && (
            <motion.form
              id="auth-form"
              key={isLogin ? 'login' : `register-${step}`}
              initial={{ opacity: 0, x: 24 * stepDir }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              {!isLogin && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                      Step {step} of {totalSteps}
                    </span>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900">
                      {FLOW[step - 1].label}
                    </span>
                  </div>
                  <div className={`mt-2 grid gap-1.5 ${totalSteps === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    {FLOW.map((s) => (
                      <div
                        key={s.key}
                        className={`h-1 rounded-full transition-all duration-300 ${FLOW.indexOf(s) < step ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {!isLogin && currentKey === 'account' && (
                <div>
                  <label className={labelCls}>Full Name</label>
                  <div className="relative">
                    <span className={iconCls}>person</span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputCls}
                      placeholder="Juan Dela Cruz"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Institutional Email</label>
                <div className="relative">
                  <span className={iconCls}>email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="juan.delacruz@wesleyan.edu.ph"
                  />
                </div>
                {isLogin && (
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                    Demo accounts (pw: <code className="text-neutral-900 font-bold">password123</code>): admin@wesleyan.edu.ph · maria.reyes@wesleyan.edu.ph (BSIT) · joshua.ramos@wesleyan.edu.ph (BSCpE) · miguel.torres@wesleyan.edu.ph (BSECE)
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <span className={iconCls}>lock</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>
              </div>

          {!isLogin && currentKey === 'role' && (
            <>
              <div>
                <label className={labelCls}>I am a…</label>
                    <div className="grid grid-cols-2 gap-2.5 mt-1">
                      {ROLES.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => pickRole(r.id)}
                          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-full border-2 text-[13px] font-bold transition-all ${
                            role === r.id
                              ? 'border-neutral-900 bg-neutral-900 text-white'
                              : 'border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                          {r.label}
                        </button>
                      ))}
                </div>
              </div>
            </>
          )}

          {!isLogin && currentKey === 'student' && (
            <>
              <div>
                <label className={labelCls}>Student ID</label>
                <div className="relative">
                  <span className={iconCls}>badge</span>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className={`${inputCls} font-mono tracking-wider`}
                    placeholder="23-1037-310"
                    pattern="[0-9]{2}-[0-9]{4}-[0-9]{3}"
                    title="Student ID format: 23-1037-310"
                  />
                </div>
              </div>
            </>
          )}

          {!isLogin && currentKey === 'department' && (
            <>
              <div>
                <label className={labelCls}>Department</label>
                    <div className="grid grid-cols-3 gap-2.5 mt-1">
                      {PROGRAMS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setProgram(p.id)}
                          className={`flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-2xl border-2 transition-all ${
                            program === p.id
                              ? 'border-neutral-900 bg-neutral-900 text-white'
                              : 'border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                          <span className="text-[13px] font-bold leading-none mt-1">{p.label}</span>
                          <span className={`text-[10px] font-semibold ${program === p.id ? 'text-white/60' : 'text-neutral-300'}`}>
                            {p.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error && (
                <p className="text-red-700 text-[13px] font-semibold bg-red-50 px-4 py-3 rounded-xl border-l-4 border-red-500">
                  {error}
                </p>
              )}

              {isLogin ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-neutral-900 text-white py-4 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {submitting ? 'Please wait…' : 'Sign In'}
                  {!submitting && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center gap-1.5 px-5 py-4 rounded-full text-[14px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      Back
                    </button>
                  )}
                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-neutral-900 text-white py-4 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
                    >
                      Continue
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-neutral-900 text-white py-4 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {submitting ? 'Please wait…' : 'Create Account'}
                      {!submitting && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                    </button>
                  )}
                </div>
              )}

              <p className="text-center text-[13px] text-neutral-400">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => switchMode(!isLogin)}
                  className="font-bold text-neutral-900 underline decoration-neutral-300 decoration-2 underline-offset-4 hover:decoration-neutral-900 transition-all"
                >
                  {isLogin ? 'Register' : 'Sign In'}
                </button>
              </p>
            </motion.form>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
