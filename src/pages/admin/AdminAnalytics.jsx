import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAnalytics } from '../../services/data';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then((a) => {
      setData(a);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const maxYear = Math.max(...(data.byYear || []).map((d) => d.count), 1);
  const maxCat = Math.max(...(data.byCategory || []).map((d) => d.count), 1);
  const maxViews = Math.max(...(data.topPapers || []).map((p) => p.views), 1);

  const bsitStats = data.byProgram?.BSIT || { count: 0, views: 0, approved: 0 };
  const bscpeStats = data.byProgram?.BSCpE || { count: 0, views: 0, approved: 0 };
  const bseceStats = data.byProgram?.BSECE || { count: 0, views: 0, approved: 0 };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Program Distribution Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 border-l-4 border-l-neutral-900 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-neutral-900 text-[20px]">terminal</span>
              <h3 className="font-display text-[16px] font-bold text-neutral-900">BS Information Technology</h3>
            </div>
            <p className="text-[12px] text-neutral-500">Software, Networks, Analytics, Cybersecurity</p>
            <div className="flex gap-4 mt-3 text-[13px]">
              <div><span className="font-bold text-neutral-900">{bsitStats.count}</span> <span className="text-neutral-500">Papers</span></div>
              <div><span className="font-bold text-neutral-900">{bsitStats.views.toLocaleString()}</span> <span className="text-neutral-500">Views</span></div>
              <div><span className="font-bold text-emerald-600">{bsitStats.approved}</span> <span className="text-neutral-500">Approved</span></div>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-neutral-900/5 text-neutral-900 flex items-center justify-center font-display font-bold text-[20px]">
            {data.totalPapers ? `${Math.round((bsitStats.count / data.totalPapers) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border-l-4 border-l-emerald-600 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">memory</span>
              <h3 className="font-display text-[16px] font-bold text-neutral-900">BS Computer Engineering</h3>
            </div>
            <p className="text-[12px] text-neutral-500">Robotics, IoT, FPGA Hardware, Mechatronics</p>
            <div className="flex gap-4 mt-3 text-[13px]">
              <div><span className="font-bold text-neutral-900">{bscpeStats.count}</span> <span className="text-neutral-500">Papers</span></div>
              <div><span className="font-bold text-neutral-900">{bscpeStats.views.toLocaleString()}</span> <span className="text-neutral-500">Views</span></div>
              <div><span className="font-bold text-emerald-600">{bscpeStats.approved}</span> <span className="text-neutral-500">Approved</span></div>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-display font-bold text-[20px]">
            {data.totalPapers ? `${Math.round((bscpeStats.count / data.totalPapers) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border-l-4 border-l-neutral-900 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-neutral-900 text-[20px]">electric_bolt</span>
              <h3 className="font-display text-[16px] font-bold text-neutral-900">BS Electronics Engineering</h3>
            </div>
            <p className="text-[12px] text-neutral-500">Telecoms, Power Systems, Signal Processing</p>
            <div className="flex gap-4 mt-3 text-[13px]">
              <div><span className="font-bold text-neutral-900">{bseceStats.count}</span> <span className="text-neutral-500">Papers</span></div>
              <div><span className="font-bold text-neutral-900">{bseceStats.views.toLocaleString()}</span> <span className="text-neutral-500">Views</span></div>
              <div><span className="font-bold text-emerald-600">{bseceStats.approved}</span> <span className="text-neutral-500">Approved</span></div>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-neutral-900/5 text-neutral-900 flex items-center justify-center font-display font-bold text-[20px]">
            {data.totalPapers ? `${Math.round((bseceStats.count / data.totalPapers) * 100)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Submissions per year */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <h2 className="font-display text-[18px] font-bold mb-2 text-neutral-900">Submissions per Year</h2>
        <p className="text-[13px] text-neutral-500 mb-8">Total papers catalogued by publication year across CECT.</p>
        <div className="flex items-end gap-4 md:gap-8 h-48">
          {data.byYear.map((d) => (
            <div key={d.year} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[12px] font-bold text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.count / maxYear) * 120, 8)}px` }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                className="w-full max-w-[72px] rounded-t-xl bg-gradient-to-t from-neutral-900 to-neutral-500 group-hover:brightness-110 transition-all"
              />
              <div className="text-[13px] font-bold text-neutral-500">{d.year}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories breakdown */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <h2 className="font-display text-[18px] font-bold mb-8 text-neutral-900">Papers by Research Track</h2>
          <div className="space-y-5">
            {data.byCategory.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-[13px] font-medium mb-1.5 text-neutral-900">
                  <span className="flex items-center gap-1.5">
                    {c.name}
                    {c.program && c.program !== 'Both' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
                        {c.program}
                      </span>
                    )}
                  </span>
                  <span className="text-neutral-500">{c.count} papers</span>
                </div>
                <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.count / maxCat) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 150, damping: 24 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top viewed papers */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <h2 className="font-display text-[18px] font-bold mb-8 text-neutral-900">Top Papers by Views</h2>
          <div className="space-y-5">
            {data.topPapers.map((p, i) => (
              <div key={p.id}>
                <div className="flex justify-between items-center text-[13px] mb-1.5 gap-4">
                  <Link to={`/research/${p.id}`} className="font-medium truncate text-neutral-900 hover:text-neutral-500 transition-colors flex items-center gap-1.5">
                    <span className="text-neutral-400 font-bold">#{i + 1}</span>
                    <span className="truncate">{p.title}</span>
                  </Link>
                  <span className="text-neutral-500 shrink-0">{p.views.toLocaleString()} views</span>
                </div>
                <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.views / maxViews) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 150, damping: 24 }}
                    className="h-full rounded-full bg-gradient-to-r from-neutral-700 to-neutral-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { label: 'Total Papers', value: data.totalPapers, icon: 'description' },
          { label: 'Approval Rate', value: data.totalPapers ? `${Math.round((data.approvedCount / data.totalPapers) * 100)}%` : '0%', icon: 'task_alt' },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-3xl p-6 text-center">
            <span className="material-symbols-outlined text-neutral-900 text-[24px] mb-2 block">{s.icon}</span>
            <div className="font-display text-[24px] font-bold text-neutral-900">{s.value}</div>
            <div className="text-[12px] text-neutral-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
