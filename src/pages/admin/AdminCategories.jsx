import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCategories, addCategory, deleteCategory } from '../../services/data';

const EMPTY_FORM = { name: '', description: '', color: '#171717' };
const COLORS = ['#171717', '#525252', '#943700', '#ba1a1a', '#006a5c', '#7c4d00', '#5d0091', '#4a4a4a'];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState('');

  const refresh = async () => {
    setCategories(await getCategories());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addCategory(form);
    setShowForm(false);
    setForm(EMPTY_FORM);
    showToast('Category added.');
    refresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    const ok = await deleteCategory(id);
    showToast(ok ? 'Category deleted.' : 'Cannot delete — papers still use this category.');
    refresh();
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

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <p className="text-[14px] text-neutral-500">
          Research categories organize the repository. Categories with papers cannot be deleted.
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Category
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <form onSubmit={handleSubmit} className="relative bg-surface w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-4">
            <h3 className="font-display text-[20px] font-bold">New Category</h3>
            <input required placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <textarea placeholder="Short description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
            <div>
              <div className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Color</div>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-neutral-900 text-white py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 transition-all">
                Add Category
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {categories.map((c) => (
            <div key={c.id} className="glass-card rounded-3xl p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${c.color}18` }}>
                  <span className="material-symbols-outlined" style={{ color: c.color }}>category</span>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
              <h3 className="font-bold text-[16px] text-neutral-900">{c.name}</h3>
              <p className="text-[12px] text-neutral-500 mt-1 line-clamp-2 min-h-[32px]">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
