import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategories, getFaculty, submitPaper, saveDraft, uploadPdf } from '../../services/data';
import { useAuth } from '../../contexts/AuthContext';

const STEPS = [
  { label: 'Paper Details', icon: 'description' },
  { label: 'Authors', icon: 'group' },
  { label: 'Review & Submit', icon: 'task_alt' },
];

export default function SubmitResearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    title: '',
    thesisNumber: '',
    program: user?.program || 'BSIT',
    abstract: '',
    category: '',
    year: new Date().getFullYear(),
    keywords: '',
    advisor: '',
    sourceUrl: '',
    pdfUrl: '',
    pdfFileName: '',
    pdfFileSize: '',
    authors: [user?.name || ''],
  });

  useEffect(() => {
    getCategories({ program: form.program }).then(setCategories);
  }, [form.program]);

  useEffect(() => {
    getFaculty()
      .then((data) => setFacultyList(Array.isArray(data) ? data : []))
      .catch(() => setFacultyList([]))
      .finally(() => setFacultyLoading(false));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setAuthor = (i, value) =>
    setForm((f) => {
      const authors = [...f.authors];
      authors[i] = value;
      return { ...f, authors };
    });

  const addAuthor = () => setForm((f) => ({ ...f, authors: [...f.authors, ''] }));
  const removeAuthor = (i) => setForm((f) => ({ ...f, authors: f.authors.filter((_, idx) => idx !== i) }));

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files (.pdf) are supported.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('PDF file exceeds maximum allowed size (25MB).');
      return;
    }

    setError('');
    setUploadingPdf(true);
    try {
      const res = await uploadPdf(file);
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setForm((f) => ({
        ...f,
        pdfUrl: res.url,
        pdfFileName: file.name,
        pdfFileSize: sizeStr,
      }));
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to upload PDF manuscript. Please try again.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim() || !form.abstract.trim() || !form.category) {
        setError('Please fill in the paper title, abstract, and select a research track.');
        return false;
      }
      if (!form.thesisNumber.trim()) {
        setError('Please enter the thesis number for this capstone.');
        return false;
      }
      if (!form.advisor) {
        setError('Please select a research adviser for this capstone.');
        return false;
      }
    }
    if (step === 1) {
      if (!form.authors.some((a) => a.trim())) {
        setError('Add at least one author for this research.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSaveDraft = async () => {
    await saveDraft({
      submittedBy: user?.email,
      title: form.title,
      thesisNumber: form.thesisNumber,
      program: form.program,
      abstract: form.abstract,
      category: form.category,
      year: form.year,
      keywords: form.keywords,
      advisor: form.advisor,
      sourceUrl: form.sourceUrl,
      authors: form.authors.filter((a) => a.trim()),
    });
    setError('');
    navigate('/dashboard', { state: { toast: 'Draft saved. You can continue anytime.' } });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await submitPaper({
        title: form.title.trim(),
        thesisNumber: form.thesisNumber.trim(),
        program: form.program,
        abstract: form.abstract.trim(),
        category: form.category,
        year: Number(form.year),
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        advisor: form.advisor,
        sourceUrl: form.sourceUrl.trim(),
        pdfUrl: form.pdfUrl || '#',
        authors: form.authors.map((a) => a.trim()).filter(Boolean),
        submittedBy: user?.email,
      });
      setDone(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit paper. Please ensure the server is connected.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full bg-white px-4 py-3 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all';

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[640px] mx-auto px-4 py-24 text-center"
      >
        <div className="glass-card rounded-3xl p-12">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-emerald-600 text-[40px]">task_alt</span>
          </div>
          <h2 className="font-display text-[28px] font-bold mb-3">Submission Received!</h2>
          <p className="text-neutral-500 text-[14px] mb-8 max-w-sm mx-auto">
            Your paper is now queued for faculty adviser review ({form.program}). You can track its status from your student dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-neutral-900 text-white px-8 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 transition-all"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setForm({
                  title: '',
                  thesisNumber: '',
                  program: user?.program || 'BSIT',
                  abstract: '',
                  category: '',
                  year: new Date().getFullYear(),
                  keywords: '',
                  advisor: '',
                  sourceUrl: '',
                  pdfUrl: '',
                  pdfFileName: '',
                  pdfFileSize: '',
                  authors: [user?.name || ''],
                });
                setStep(0);
                setDone(false);
              }}
              className="px-8 py-3 rounded-full text-[14px] font-medium bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto px-4 md:px-12 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">Contribute</p>
        <h1 className="mt-2 font-display text-[28px] md:text-[36px] font-bold mb-2 text-neutral-900">Submit CECT Research Paper</h1>
        <p className="text-neutral-500 text-[15px] mb-10">
          Upload and register your capstone thesis manuscript for faculty review.
        </p>
      </motion.div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                i === step
                  ? 'bg-neutral-900 text-white'
                  : i < step
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-neutral-100/50 text-neutral-500'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{i < step ? 'check' : s.icon}</span>
              <span className="text-[13px] font-bold hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-emerald-500/40' : 'bg-neutral-200'}`} />}
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="glass-card rounded-3xl p-8 md:p-10"
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <div className="space-y-5">
              {/* Program Selector */}
              <div>
                <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Degree Program *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      set('program', 'BSIT');
                      set('category', '');
                    }}
                    className={`py-3 px-4 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      form.program === 'BSIT'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">terminal</span>
                    BS Information Technology
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      set('program', 'BSCpE');
                      set('category', '');
                    }}
                    className={`py-3 px-4 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      form.program === 'BSCpE'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">memory</span>
                    BS Computer Engineering
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      set('program', 'BSECE');
                      set('category', '');
                    }}
                    className={`py-3 px-4 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      form.program === 'BSECE'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
                    BS Electronics Engineering
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Paper Title *</label>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Edge AI-Powered Autonomous Agricultural Drone" className={inputCls} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Thesis Number *</label>
                  <input
                    value={form.thesisNumber}
                    onChange={(e) => set('thesisNumber', e.target.value)}
                    placeholder={form.program === 'BSCpE' ? 'e.g. WU-CECT-CPE-2025-001' : form.program === 'BSECE' ? 'e.g. WU-CECT-ECE-2025-001' : 'e.g. WU-CECT-IT-2025-001'}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Research Track / Category *</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                    <option value="">Select track...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Abstract *</label>
                <textarea value={form.abstract} onChange={(e) => set('abstract', e.target.value)} rows={5} placeholder="Summarize your research problem, methodology, and key experimental findings..." className={inputCls} />
              </div>

              {/* PDF Document Upload Zone */}
              <div>
                <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Capstone Manuscript (PDF)
                </label>
                {form.pdfUrl && form.pdfUrl !== '#' ? (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-emerald-950">{form.pdfFileName || 'manuscript.pdf'}</div>
                        <div className="text-[12px] text-emerald-700">{form.pdfFileSize} · Ready to submit</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, pdfUrl: '', pdfFileName: '', pdfFileSize: '' }))}
                      className="text-[12px] font-bold text-red-600 hover:underline px-3 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      Change PDF
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 rounded-2xl cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-all">
                    <span className="material-symbols-outlined text-[36px] text-neutral-900 mb-2">cloud_upload</span>
                    <span className="text-[14px] font-bold text-neutral-900">Click to select or drag & drop PDF</span>
                    <span className="text-[12px] text-neutral-500 mt-1">Maximum file size: 25MB (PDF only)</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      disabled={uploadingPdf}
                      onChange={handleFileUpload}
                    />
                    {uploadingPdf && <span className="text-[12px] text-neutral-900 font-bold mt-2">Uploading manuscript...</span>}
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Research Adviser *</label>
                  <select
                    value={form.advisor}
                    onChange={(e) => set('advisor', e.target.value)}
                    className={inputCls}
                    disabled={facultyLoading}
                  >
                    <option value="">{facultyLoading ? 'Loading advisers...' : 'Select adviser...'}</option>
                    {[...facultyList]
                      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                      .map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name}{f.department ? ` — ${f.department}` : ''}
                        </option>
                      ))}
                    <option value="To be assigned">To be assigned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Publication Year</label>
                  <input type="number" min={2000} max={2100} value={form.year} onChange={(e) => set('year', e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Keywords (comma separated)</label>
                <input value={form.keywords} onChange={(e) => set('keywords', e.target.value)} placeholder="e.g. Robotics, IoT, Jetson Nano, Precision Agriculture" className={inputCls} />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Source Code Repository URL</label>
                <input value={form.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} placeholder="e.g. https://github.com/wup-cect/drone-system" className={inputCls} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Authors *</label>
                <p className="text-[12px] text-neutral-500 mb-4">Add every researcher involved in this capstone. The first author is designated as primary lead.</p>
              </div>
              {form.authors.map((author, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <span className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(i, e.target.value)}
                    placeholder={i === 0 ? 'Primary researcher name' : 'Co-author name'}
                    className={inputCls}
                  />
                  {form.authors.length > 1 && (
                    <button onClick={() => removeAuthor(i)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 hover:bg-red-100 transition-colors" title="Remove">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addAuthor}
                className="flex items-center gap-2 text-[13px] font-bold text-neutral-900 hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add co-author
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-display text-[20px] font-bold text-neutral-900">Review Your Submission</h3>
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Title</div>
                  <div className="text-[16px] font-bold">{form.title}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Program</div>
                    <div className="font-bold text-neutral-900">{form.program === 'BSCpE' ? 'BS Computer Engineering (BSCpE)' : form.program === 'BSECE' ? 'BS Electronics Engineering (BSECE)' : 'BS Information Technology (BSIT)'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Category / Track</div>
                    <div>{form.category}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Thesis Number</div>
                    <div className="font-mono">{form.thesisNumber}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Publication Year</div>
                    <div>{form.year}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Authors</div>
                    <div>{form.authors.filter((a) => a.trim()).join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Adviser</div>
                    <div>{form.advisor}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Manuscript (PDF)</div>
                  {form.pdfUrl && form.pdfUrl !== '#' ? (
                    <div className="text-[13px] text-emerald-700 font-medium flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      {form.pdfFileName || 'Attached and ready for upload'}
                    </div>
                  ) : (
                    <div className="text-[13px] text-amber-600 font-medium flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      No PDF attached (metadata only)
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Abstract</div>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">{form.abstract}</p>
                </div>

                {form.keywords && (
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {form.keywords.split(',').map((k) => k.trim()).filter(Boolean).map((k) => (
                        <span key={k} className="px-3 py-1 bg-neutral-100 rounded-full text-[12px] text-neutral-600">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[12px] text-neutral-500">
                Submitting places your paper into the <span className="font-bold text-neutral-900">CECT Pending Review</span> queue. An assigned faculty reviewer will evaluate your manuscript.
              </p>
            </div>
          )}
        </AnimatePresence>

        {error && <p className="text-red-600 text-[13px] font-medium mt-5 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200/20">
          {step > 0 ? (
            <button onClick={back} className="px-6 py-3 rounded-full text-[14px] font-medium bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors">
              Back
            </button>
          ) : (
            <button onClick={handleSaveDraft} className="px-6 py-3 rounded-full text-[14px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              Save Draft
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="bg-neutral-900 text-white px-8 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all">
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-neutral-900 text-white px-8 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              Submit Paper
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
