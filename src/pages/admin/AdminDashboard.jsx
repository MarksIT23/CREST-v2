import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getAnalytics, getActivities, getPapers, updatePaperStatus } from '../../services/data';
import ReviewDecisionDialog from '../../components/admin/ReviewDecisionDialog';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const KPI_STYLES = [
  { icon: 'description', label: 'Total Papers', key: 'totalPapers', color: 'text-neutral-900 bg-neutral-900/5' },
  { icon: 'hourglass_top', label: 'Pending Review', key: 'pendingCount', color: 'text-amber-600 bg-amber-500/10' },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    Promise.all([getAnalytics(), getActivities(8), getPapers({ status: 'pending' })]).then(
      ([a, acts, pendingPapers]) => {
        setAnalytics(a);
        setActivities(acts);
        setPending(pendingPapers);
        setLoading(false);
      }
    );
  }, []);

  const confirmDecision = async (note, pendingRemark) => {
    if (!dialog) return;
    await updatePaperStatus(dialog.paper.id, dialog.decision, user?.name || 'Administrator', pendingRemark || note);
    const [a, acts, pendingPapers] = await Promise.all([getAnalytics(), getActivities(8), getPapers({ status: 'pending' })]);
    setAnalytics(a);
    setActivities(acts);
    setPending(pendingPapers);
  };

  if (loading || !analytics) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* KPI cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {KPI_STYLES.map((kpi) => (
          <motion.div key={kpi.key} variants={itemVariants} className="glass-card p-6 rounded-3xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color}`}>
              <span className="material-symbols-outlined text-[24px]">{kpi.icon}</span>
            </div>
            <div>
              <div className="font-display text-[28px] font-bold leading-tight text-neutral-900">
                {analytics[kpi.key]?.toLocaleString() ?? 0}
              </div>
              <div className="text-[12px] text-neutral-500 font-medium">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Submission pipeline */}
        <motion.div variants={itemVariants} className="xl:col-span-3 glass-card rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-[18px] font-bold text-neutral-900">Submission Pipeline</h2>
            <Link to="/admin/papers" className="text-[13px] font-bold text-neutral-900 underline decoration-neutral-300 decoration-2 underline-offset-4 hover:decoration-neutral-900 transition-all">
              Manage all papers
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <span className="material-symbols-outlined text-[40px] mb-3 block">inbox</span>
              <p className="text-[14px] font-medium">All caught up — no pending submissions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((paper) => (
                <div key={paper.id} className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[11px] font-semibold rounded-full">
                        {paper.category}
                      </span>
                      {paper.thesisNumber && <span className="text-[11px] text-neutral-500">{paper.thesisNumber}</span>}
                      <span className="text-[11px] text-neutral-500">{paper.authors.join(', ')}</span>
                    </div>
                    <h3 className="font-bold text-[15px] truncate text-neutral-900">{paper.title}</h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/research/${paper.id}`}
                      className="px-4 py-2 rounded-full text-[13px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setDialog({ paper, decision: 'pending' })}
                      className="px-4 py-2 rounded-full text-[13px] font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setDialog({ paper, decision: 'approved' })}
                      className="px-4 py-2 rounded-full text-[13px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 transition-all"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={itemVariants} className="xl:col-span-2 glass-card rounded-3xl p-6 md:p-8">
          <h2 className="font-display text-[18px] font-bold mb-6 text-neutral-900">Recent Activity</h2>
          <div className="space-y-5">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-neutral-700 text-[16px]">
                    {act.type === 'approval' ? 'task_alt' : act.type === 'rejection' ? 'cancel' : 'note_add'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug text-neutral-700">
                    <span className="font-bold text-neutral-900">{act.user}</span> — {act.detail}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{timeAgo(act.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

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
