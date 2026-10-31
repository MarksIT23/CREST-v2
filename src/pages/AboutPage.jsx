import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const viewportOnce = { once: true, margin: '-80px' };

const staggerReveal = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const railRise = {
  hidden: { y: '100%' },
  show: { y: '0%', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const railRule = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -36 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } },
};

const slideRight = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } },
};

const PROGRAMS = [
  {
    abbr: 'BSIT',
    name: 'BS Information Technology',
    icon: 'terminal',
    tags: ['Software Development', 'Networks', 'Data & Systems'],
    text: 'IT is about making computing work for people and organizations — the software they run on, the networks that connect them, and the data they decide with. Capstones from the IT program lean applied: working systems, administered networks, and data put to real use.',
  },
  {
    abbr: 'BSCpE',
    name: 'BS Computer Engineering',
    icon: 'memory',
    tags: ['Embedded Systems', 'Hardware Design', 'Automation'],
    text: 'Computer Engineering lives where hardware meets software — the chips, boards, and devices that carry code into the physical world. CpE capstones run toward embedded builds, instrumentation, and intelligent machines.',
  },
  {
    abbr: 'BSECE',
    name: 'BS Electronics Engineering',
    icon: 'electric_bolt',
    tags: ['Telecommunications', 'Power Systems', 'Electronics'],
    text: 'Electronics Engineering works the layer underneath it all — communications, power, and electronic systems. ECE capstones center on telecom applications, power and control, and electronics design.',
  },
];

function ChapterRail({ eyebrow, title }) {
  return (
    <div className="md:col-span-4">
      <div>
        <motion.p variants={fadeUp} className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
          {eyebrow}
        </motion.p>
        <motion.div variants={railRule} className="mt-3 h-[2px] w-12 origin-left bg-neutral-900" />
        <div className="overflow-hidden">
          <motion.h2 variants={railRise} className="mt-3 font-display text-[28px] font-bold leading-tight text-neutral-900 md:text-[36px]">
            {title}
          </motion.h2>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* Masthead — hero-echo ink block */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden bg-neutral-950 text-white"
      >


        <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-14 pt-[140px] md:px-0 md:pb-16 md:pt-[168px]">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Wesleyan University Philippines — CECT
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-4xl font-poster uppercase text-[60px] font-semibold leading-[0.95] tracking-[0.01em] md:text-[110px]"
            >
              About CREST
            </motion.h1>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            className="mt-6 h-px w-24 origin-left bg-white/40"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 font-mono text-[12px] font-semibold uppercase tracking-[0.3em] text-white/60"
          >
            CREST — Capstone Research Electronic Storage and Tracking
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 max-w-2xl text-[16px] leading-relaxed text-white/70 md:text-[17px]"
          >
            The institutional memory of CECT capstones — peer-reviewed student research,
            verified by faculty, and kept citable for the researchers who come next.
          </motion.p>
        </div>
      </motion.section>

      {/* Chapters */}
      <div className="bg-background px-4 py-16 text-neutral-900 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1280px]">
          {/* 01 — The System */}
          <motion.section
            variants={staggerReveal}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid grid-cols-1 gap-10 md:grid-cols-12"
          >
            <ChapterRail eyebrow="The system" title="One Pipeline, From Draft to Archive" />
            <motion.div variants={fadeUp} className="md:col-span-8 md:pt-[44px]">
              <p className="max-w-3xl text-[16px] leading-relaxed text-neutral-600 md:text-[17px]">
                CREST — Capstone Research Electronic Storage and Tracking — is where CECT
                capstones are submitted, reviewed, graded, and preserved. Less a folder of
                PDFs, more the college long-term memory: every approved entry stays
                searchable, trackable, and citable.
              </p>
            </motion.div>
          </motion.section>

          {/* 02 — The Programs */}
          <motion.section
            variants={staggerReveal}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-28 grid grid-cols-1 gap-10 md:mt-36 md:grid-cols-12"
          >
            <ChapterRail eyebrow="The programs" title="Three Programs, One Archive" />
            <div className="md:col-span-8">
              {PROGRAMS.map((p, i) => (
                <motion.div
                  key={p.abbr}
                  variants={i % 2 === 0 ? slideLeft : slideRight}
                  className={`relative overflow-hidden py-8 ${i > 0 ? 'border-t border-neutral-200' : ''}`}
                >
                  <span className="pointer-events-none absolute -top-2 right-0 font-display text-[72px] font-bold leading-none text-neutral-900/[0.09] select-none md:text-[110px]" aria-hidden="true">
                    {p.abbr}
                  </span>
                  <div className="relative">
                    <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                      {p.abbr}
                    </div>
                    <div className="mt-1 text-[22px] font-bold text-neutral-900 md:text-[26px]">{p.name}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <span key={t} className="rounded-full border border-neutral-300 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-600">{p.text}</p>
                    <Link to={`/browse?program=${p.abbr}`} className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-neutral-900 transition-all hover:gap-3">
                      Browse {p.abbr} papers
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 03 — The College */}
          <motion.section
            variants={staggerReveal}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-28 grid grid-cols-1 gap-10 md:mt-36 md:grid-cols-12"
          >
            <ChapterRail eyebrow="The college" title="The Institutional Memory of CECT" />
            <motion.div variants={fadeUp} className="md:col-span-8 md:pt-[44px]">
              <p className="max-w-3xl text-[16px] leading-relaxed text-neutral-600 md:text-[17px]">
                The College of Engineering and Computer Technology is home to the
                three programs above, and CREST is where their capstone work lives on. One
                college, one archive: every cohort adds to a record the next one can stand on.
              </p>
              <div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
                {[
                  { icon: 'how_to_reg', title: 'Approved membership', text: 'Student accounts activate after faculty or admin approval; faculty accounts after admin approval.' },
                  { icon: 'fact_check', title: 'Reviewed publication', text: 'Submissions queue for faculty verification and grading before joining the public collection.' },
                  { icon: 'format_quote', title: 'Citable by default', text: 'Every entry carries authors, year, abstract, and document — ready to reference in future work.' },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-4 py-5">
                    <span className="material-symbols-outlined mt-0.5 text-[24px] text-neutral-900">{f.icon}</span>
                    <div>
                      <div className="text-[15px] font-bold text-neutral-900">{f.title}</div>
                      <p className="mt-1 text-[14px] leading-relaxed text-neutral-600">{f.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.section>

          {/* Closer — bordered ivory CTA */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-28 rounded-[24px] border-2 border-neutral-900 px-6 py-12 text-center md:mt-36 md:py-16"
          >
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
              Wesleyan University Philippines — CECT
            </p>
            <h2 className="mx-auto mt-3 max-w-xl font-display text-[28px] font-bold leading-tight text-neutral-900 md:text-[40px]">
              Start with the archive
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-neutral-600">
              Browse approved capstones, or meet the advisers behind them.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/browse"
                className="rounded-xl bg-neutral-900 px-8 py-4 text-[14px] font-bold text-white shadow-xl transition-all hover:bg-neutral-700 active:scale-95"
              >
                Database
              </Link>
              <Link
                to="/faculty"
                className="rounded-xl border-2 border-neutral-900 px-8 py-[14px] text-[14px] font-bold text-neutral-900 transition-all hover:bg-neutral-900 hover:text-white active:scale-95"
              >
                Faculties
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
