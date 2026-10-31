import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getPapers, updatePaperStatus, updatePaper, archivePaper } from '../../services/data';
import ReviewDecisionDialog from '../../components/admin/ReviewDecisionDialog';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/SearchBar';

const TABS = [
  { id: '', label: 'All Statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'archived', label: 'Archived' },
  { id: 'rejected', label: 'Rejected' },
];

const PROGRAMS = [
  { id: '', label: 'All CECT' },
  { id: 'BSIT', label: 'BSIT' },
  { id: 'BSCpE', label: 'BSCpE' },
  { id: 'BSECE', label: 'BSECE' },
];

export default function AdminPapers() {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('');
  const [program, setProgram] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [toast, setToast] = useState('');
  const [dialog, setDialog] = useState(null);

  const refresh = useCallback(async () => {
    const data = await getPapers({ search, status: tab || undefined, program: program || undefined });
    setPapers(data);
    setLoading(false);
  }, [search, tab, program]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const confirmDecision = async (note, pendingRemark) => {
    if (!dialog) return;
    await updatePaperStatus(dialog.paper.id, dialog.decision, user?.name || 'Administrator', pendingRemark || note);
    showToast(dialog.decision === 'approved' ? 'Paper approved and published.' : 'Paper marked as pending — remark logged.');
    refresh();
  };

  const handleArchive = async (id, title) => {
    if (!window.confirm(`Archive "${title}"? It will no longer be publicly visible but all data is preserved.`)) return;
    await archivePaper(id);
    showToast('Paper archived.');
    refresh();
  };

  const startEdit = (paper) => {
    setEditing(paper.id);
    setEditForm({
      title: paper.title,
      thesisNumber: paper.thesisNumber || '',
      program: paper.program || 'BSIT',
      abstract: paper.abstract,
      year: paper.year,
      category: paper.category,
      keywords: (paper.keywords || []).join(', '),
      sourceUrl: paper.sourceUrl || '',
    });
  };

  const saveEdit = async () => {
    if (!editForm) return;
    await updatePaper(editing, {
      ...editForm,
      year: Number(editForm.year) || new Date().getFullYear(),
      keywords: editForm.keywords.split(',').map((k) => k.trim()).filter(Boolean),
    });
    setEditing(null);
    setEditForm(null);
    showToast('Paper updated.');
    refresh();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-xl text-[14px] font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold text-neutral-900">Research Papers Management</h1>
          <p className="text-neutral-500 text-[14px]">Review, approve, edit metadata, or archive CECT capstone manuscripts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/submit"
            className="bg-neutral-900 text-white px-5 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-neutral-700 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Submission
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <SearchBar value={search} onChange={setSearch} placeholder="Search title, author, thesis #..." />
        </div>

        {/* Program Filter Chips */}
        <div className="flex gap-2">
          {PROGRAMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProgram(p.id)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                program === p.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-3 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${
              tab === t.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="min-h-[250px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : papers.length === 0 ? (
        <div className="border-t-2 border-neutral-900 pt-8 pb-4 text-neutral-500">
          <span className="material-symbols-outlined text-[48px] mb-3 block">inbox</span>
          <p className="text-[14px] font-medium">No papers match this view.</p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 text-[12px] uppercase tracking-wider text-neutral-500">
                  <th className="px-6 py-4 font-bold">Title</th>
                  <th className="px-4 py-4 font-bold">Program</th>
                  <th className="px-4 py-4 font-bold">Thesis No.</th>
                  <th className="px-4 py-4 font-bold">Category</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper) => (
                  <tr key={paper.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 max-w-sm">
                      {editing === paper.id ? (
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full bg-white px-3 py-2 rounded-lg border border-neutral-200 text-[13px] font-medium outline-none focus:border-neutral-900 text-neutral-900"
                        />
                      ) : (
                        <div>
                          <Link to={`/research/${paper.id}`} className="font-display font-bold text-[14px] text-neutral-900 hover:underline transition-colors">
                            {paper.title}
                          </Link>
                          <div className="text-[11px] text-neutral-500 mt-0.5">{paper.authors.join(', ')}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {editing === paper.id ? (
                        <select
                          value={editForm.program}
                          onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                          className="bg-white px-2 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-bold outline-none text-neutral-900"
                        >
                          <option value="BSIT">BSIT</option>
                          <option value="BSCpE">BSCpE</option>
                          <option value="BSECE">BSECE</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
                            paper.program === 'BSCpE'
                              ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                              : 'bg-neutral-900/5 text-neutral-700 border border-neutral-200'
                          }`}
                        >
                          {paper.program || 'BSIT'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-neutral-500 font-mono">
                      {editing === paper.id ? (
                        <input
                          value={editForm.thesisNumber || ''}
                          onChange={(e) => setEditForm({ ...editForm, thesisNumber: e.target.value })}
                          className="w-full bg-white px-3 py-2 rounded-lg border border-neutral-200 text-[13px] outline-none focus:border-neutral-900 text-neutral-900"
                        />
                      ) : (
                        paper.thesisNumber || '—'
                      )}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-neutral-500">{paper.category}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={paper.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editing === paper.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={saveEdit} className="text-[12px] font-bold text-neutral-900 hover:underline">
                            Save
                          </button>
                          <button onClick={() => setEditing(null)} className="text-[12px] text-neutral-500 hover:underline">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          {paper.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setDialog({ paper, decision: 'approved' })}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              </button>
                              <button
                                onClick={() => setDialog({ paper, decision: 'pending' })}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Mark as Pending (with remark)"
                              >
                                <span className="material-symbols-outlined text-[18px]">pending</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => startEdit(paper)}
                            className="p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg transition-colors"
                            title="Edit metadata"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleArchive(paper.id, paper.title)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Archive (hide from public, data preserved)"
                          >
                            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {dialog && (
        <ReviewDecisionDialog
          paper={dialog.paper}
          decision={dialog.decision}
          reviewerName={user?.name || 'Administrator'}
          onClose={() => setDialog(null)}
          onConfirm={confirmDecision}
        />
      )}
    </motion.div>
  );
}
