import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getStudents, updateStudentAccountStatus, addStudent } from '../../services/data';
import SearchBar from '../../components/SearchBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const STATUS_TABS = [
  { id: 'pending',  label: 'Pending Approval', icon: 'pending_actions' },
  { id: 'active',   label: 'Active',            icon: 'check_circle'   },
  { id: 'rejected', label: 'Deactivated',       icon: 'person_off'     },
];

const PROGRAMS = [
  { value: 'BSIT', label: 'Information Technology (BSIT)' },
  { value: 'BSCpE', label: 'Computer Engineering (BSCpE)' },
  { value: 'BSECE', label: 'Electronics Engineering (BSECE)' },
];

const PROGRAM_BADGE = {
  BSIT:  'bg-neutral-900/5 text-neutral-900 border border-neutral-200',
  BSCpE: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30',
  BSECE: 'bg-neutral-900/5 text-neutral-900 border border-neutral-200',
};

const EMPTY_FORM = { name: '', email: '', studentId: '', program: 'BSIT' };

export default function FacultyStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pending, setPending] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents({ accountStatus: tab });
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const runPending = async () => {
    if (!pending) return;
    setConfirming(true);
    try {
      await pending.onConfirm();
    } finally {
      setConfirming(false);
      setPending(null);
    }
  };

  const doApprove = async (id, name) => {
    await updateStudentAccountStatus(id, 'active', user?.name);
    showToast(`✓ ${name}'s account has been approved.`);
    refresh();
  };

  const doReject = async (id, name) => {
    await updateStudentAccountStatus(id, 'rejected', user?.name);
    showToast(`${name}'s account has been deactivated.`);
    refresh();
  };

  const doReinstate = async (id, name) => {
    await updateStudentAccountStatus(id, 'active', user?.name);
    showToast(`✓ ${name}'s account has been reactivated.`);
    refresh();
  };

  const detailOf = (s) => [s.studentId, s.program].filter(Boolean).join(' · ');

  const askApprove = (s) => setPending({
    tone: 'approve',
    icon: 'check_circle',
    title: `Approve ${s.name}?`,
    message: 'Approving activates the account immediately. The student will be able to sign in and submit capstones.',
    detail: detailOf(s),
    confirmLabel: 'Approve account',
    onConfirm: () => doApprove(s.id, s.name),
  });

  const askReject = (s) => {
    setPending({
      tone: 'danger',
      icon: 'person_off',
      title: `Deactivate ${s.name}'s account?`,
      message: 'The student will be blocked from signing in until the account is reactivated.',
      detail: detailOf(s),
      confirmLabel: 'Deactivate account',
      onConfirm: () => doReject(s.id, s.name),
    });
  };

  const askReinstate = (s) => setPending({
    tone: 'neutral',
    icon: 'replay',
    title: `Reactivate ${s.name}?`,
    message: 'The account will be reactivated with full student access.',
    detail: detailOf(s),
    confirmLabel: 'Reactivate account',
    onConfirm: () => doReinstate(s.id, s.name),
  });

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await addStudent({ ...form, creator: user?.name || 'Faculty' });
      setShowForm(false);
      setForm(EMPTY_FORM);
      showToast('✓ Student added and automatically approved.');
      setTab('active');
      refresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add student.');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.program && s.program.toLowerCase().includes(search.toLowerCase())) ||
      (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase()))
  );

  const currentTab = STATUS_TABS.find((t) => t.id === tab);

  const inputCls =
    'w-full bg-white px-4 py-2.5 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-xl text-[14px] font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-display text-[28px] font-bold text-neutral-900">Student Account Management</h1>
        <p className="text-neutral-500 text-[14px] mt-1">
          Review and approve student registrations or add students manually for the CECT department.
        </p>
      </div>

      {/* Search & Add Action */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search students..." className="md:max-w-sm" />
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }}
          className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Student
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all ${
              tab === t.id
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Add Student Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <form onSubmit={handleAddStudent} className="relative bg-surface w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-4">
            <h3 className="font-display text-[20px] font-bold">Add Student Account</h3>
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input required type="email" placeholder="Institutional email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Student ID (e.g. BSIT-2022-014)" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className={inputCls} />
              <div>
                <select
                  required
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                  className={inputCls}
                >
                  {PROGRAMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-neutral-900 text-white py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 transition-all">
                Add Student
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-full text-[14px] font-medium bg-neutral-100 text-neutral-500 hover:text-neutral-900">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="min-h-[250px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-card rounded-3xl py-20 text-center">
          <span className="material-symbols-outlined text-[48px] text-neutral-300 mb-3 block">
            {currentTab?.icon || 'inbox'}
          </span>
          <p className="font-display text-[18px] font-bold mb-1 text-neutral-900">
            {tab === 'rejected' ? 'No deactivated accounts found' : `No ${tab} accounts found`}
          </p>
          <p className="text-neutral-500 text-[13px]">
            {tab === 'pending'
              ? 'No student registrations are waiting for approval.'
              : search
              ? `No matching student accounts found for "${search}".`
              : tab === 'rejected'
              ? 'No deactivated student accounts found.'
              : `No ${tab} student accounts found.`}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 text-[12px] uppercase tracking-wider text-neutral-500">
                  <th className="px-6 py-4 font-bold">Student ID</th>
                  <th className="px-6 py-4 font-bold">Name</th>
                  <th className="px-4 py-4 font-bold">Program</th>
                  <th className="px-4 py-4 font-bold">Registered</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-[13px] font-mono font-bold text-neutral-700">{s.studentId || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[14px] text-neutral-900">{s.name}</div>
                      <div className="text-[12px] text-neutral-500">{s.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${PROGRAM_BADGE[s.program] || 'bg-neutral-100 text-neutral-500'}`}>
                        {s.program || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-neutral-500">
                      {new Date(s.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tab === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => askApprove(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[12px] font-bold hover:bg-emerald-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Approve
                          </button>
                          <button
                            onClick={() => askReject(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-200 rounded-lg text-[12px] font-bold hover:bg-red-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_off</span>
                            Deactivate
                          </button>
                        </div>
                      )}
                      {tab === 'active' && (
                        <button
                          onClick={() => askReject(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-200 rounded-lg text-[12px] font-bold hover:bg-red-50 transition-colors ml-auto"
                          title="Deactivate Account"
                        >
                          <span className="material-symbols-outlined text-[16px]">person_off</span>
                          Deactivate
                        </button>
                      )}
                      {tab === 'rejected' && (
                        <button
                          onClick={() => askReinstate(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-full text-[12px] font-bold hover:bg-neutral-700 transition-colors ml-auto"
                        >
                          <span className="material-symbols-outlined text-[16px]">replay</span>
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog pending={pending} busy={confirming} onCancel={() => setPending(null)} onConfirm={runPending} />
    </motion.div>
  );
}
