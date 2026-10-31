import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getFaculty, addFaculty, updateFaculty, deleteFaculty } from '../../services/data';
import SearchBar from '../../components/SearchBar';

const DEPARTMENTS = ['Information Technology', 'Computer Engineering'];
const EMPTY_FORM = { name: '', email: '', department: 'Information Technology', specialization: '', bio: '' };

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState('');

  const refresh = async () => {
    const data = await getFaculty();
    setFaculty(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const filtered = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateFaculty(editingId, form);
      showToast('Faculty updated.');
    } else {
      await addFaculty(form);
      showToast('Faculty added.');
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    refresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this faculty member?')) return;
    await deleteFaculty(id);
    showToast('Faculty removed.');
    refresh();
  };

  const startEdit = (f) => {
    setEditingId(f.id);
    setForm({ name: f.name, email: f.email, department: f.department || 'Information Technology', specialization: f.specialization, bio: f.bio });
    setShowForm(true);
  };

  const inputCls =
    'w-full bg-white px-4 py-2.5 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-xl text-[14px] font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search faculty..." className="md:max-w-sm" />
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
          className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Faculty
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <form onSubmit={handleSubmit} className="relative bg-surface w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-4">
            <h3 className="font-display text-[20px] font-bold">{editingId ? 'Edit Faculty' : 'Add Faculty Member'}</h3>
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            <div>
              <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Department</label>
              <select
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={inputCls}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <input required placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={inputCls} />
            <textarea placeholder="Short bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputCls} />
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-neutral-900 text-white py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 transition-all">
                {editingId ? 'Save Changes' : 'Add Faculty'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-full text-[14px] font-medium bg-neutral-100 text-neutral-500 hover:text-neutral-900">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((f) => (
            <div key={f.id} className="glass-card rounded-3xl p-6 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center text-white font-bold text-[16px]">
                  {f.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[15px] truncate text-neutral-900">{f.name}</h3>
                  <p className="text-[12px] text-neutral-500 truncate">{f.department}</p>
                </div>
              </div>
              <p className="text-[12px] text-neutral-500 mb-3">
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">workspace_premium</span>
                {f.specialization}
              </p>
              <div className="flex items-center justify-end pt-4 border-t border-neutral-200">
                <div className="flex gap-2">
                  <button onClick={() => startEdit(f)} className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-900 text-neutral-500 hover:text-white flex items-center justify-center transition-colors" title="Edit">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors" title="Delete">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
