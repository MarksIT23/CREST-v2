import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPapers, getCategories } from '../services/data';
import ResearchCard from '../components/ui/ResearchCard';
import heroPoster from '../assets/hero.png';

// ---------------------------------------------------------------------------
// Hero media switch — hero-only. Change `type` to swap background without
// restructuring layout. GIF is treated as an image. Video mutes/loops inline.
// Theme-independent: hero owns a neutral black/white palette.
// ---------------------------------------------------------------------------
const BASE = import.meta.env.BASE_URL;

const HERO_MEDIA = {
  type: 'video', // 'image' | 'gif' | 'video'
  image: heroPoster,
  gif: heroPoster,
  video: `${BASE}videos/hero-2.mp4`,
  // Playlist: videos play one after another, looping forever. Served from /public/videos/
  // with immutable edge CDN caching and smart lazy-preloading to minimize egress.
  videos: [
    `${BASE}videos/hero-2.mp4`,
    `${BASE}videos/hero-1.mp4`,
    `${BASE}videos/hero-3.mp4`,
    `${BASE}videos/hero-4.mp4`,
  ],
  poster: heroPoster,
  fallbackImage:
    'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000&auto=format&fit=crop',
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const viewportOnce = { once: true, margin: '-80px' };

const staggerReveal = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: 'easeOut' } },
};

const pop = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -36 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } },
};

const slideRight = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } },
};

const CATEGORY_ICONS = {
  'Software Engineering': 'terminal',
  'Network Administration': 'dns',
  'Data Analytics': 'query_stats',
  Cybersecurity: 'security',
  Coding: 'code',
  'Ethical Hacking': 'bug_report',
  IoT: 'sensors',
  Networking: 'lan',
  Robotics: 'smart_toy',
  Theories: 'psychology',
};

const DISCIPLINE_BLURBS = {
  Coding: 'Software builds, apps, and development craft',
  'Ethical Hacking': 'Offensive security and penetration testing',
  IoT: 'Connected devices and embedded systems',
  Networking: 'Infrastructure, protocols, and administration',
  Robotics: 'Automation, control, and intelligent machines',
  Theories: 'Foundations, models, and computing concepts',
};

export default function HomePage() {
  const [papers, setPapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Promise.all([getPapers({ status: 'approved' }), getCategories()]).then(([papers, cats]) => {
      setPapers(papers);
      setCategories(cats);
      setSelectedDiscipline((prev) => prev ?? cats[0]?.name ?? null);
    });
  }, []);

  const activeDiscipline = selectedDiscipline ?? categories[0]?.name ?? null;
  const disciplinePapers = papers.filter((p) => p.category === activeDiscipline).slice(0, 3);

  const heroType = HERO_MEDIA.type;
  const heroImageSrc = heroType === 'gif' ? HERO_MEDIA.gif : HERO_MEDIA.image;
  const heroVideos = HERO_MEDIA.videos?.length ? HERO_MEDIA.videos : [HERO_MEDIA.video];
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  const heroSectionRef = useRef(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  // Egress optimization: pause playback when hero is scrolled out of view or tab is hidden
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroSectionRef.current) {
      observer.observe(heroSectionRef.current);
    }

    const handleVisibility = () => {
      if (document.hidden) {
        setIsHeroVisible(false);
      } else if (heroSectionRef.current) {
        const rect = heroSectionRef.current.getBoundingClientRect();
        setIsHeroVisible(rect.bottom > 0 && rect.top < window.innerHeight);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const active = videoIndex % heroVideos.length;
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && isHeroVisible) {
        v.play().catch(() => { });
      } else {
        v.pause();
      }
    });
  }, [videoIndex, heroVideos.length, isHeroVisible]);

  return (
    <>
      <AnimatePresence>
        {!introDone && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950 text-white"
            exit={{ y: '-100%', transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
            onClick={() => setIntroDone(true)}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-[11px] font-mono font-semibold uppercase tracking-[0.3em] text-white/50"
            >
              Wesleyan University Philippines — CECT
            </motion.p>
            <div className="mt-4 flex overflow-hidden">
              {'CREST'.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-[56px] font-bold tracking-tight md:text-[84px]"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: 'easeInOut' }}
              className="mt-6 h-px w-48 origin-left bg-white/60"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.section
        ref={heroSectionRef}
        variants={itemVariants}
        initial="hidden"
        animate={introDone ? 'show' : 'hidden'}
        exit="exit"
        className="relative w-full h-[100svh] min-h-[640px] overflow-hidden bg-neutral-950 text-white"
      >
        <div className="absolute inset-0">
          {heroType === 'video' ? (
            heroVideos.map((src, i) => {
              const activeIndex = videoIndex % heroVideos.length;
              const nextIndex = (activeIndex + 1) % heroVideos.length;
              const isActive = i === activeIndex;
              const isNext = i === nextIndex;
              // Egress guard: only mount network src for active video and immediately next item
              const shouldMountSrc = isActive || isNext;
              const preloadMode = isActive ? 'auto' : isNext ? 'metadata' : 'none';

              return (
                <video
                  key={src}
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  src={shouldMountSrc ? src : undefined}
                  poster={HERO_MEDIA.poster}
                  muted
                  playsInline
                  preload={preloadMode}
                  onEnded={() => setVideoIndex((v) => (v + 1) % heroVideos.length)}
                  onError={() => setVideoIndex((v) => (v + 1) % heroVideos.length)}
                />
              );
            })
          ) : (
            <img
              className="h-full w-full object-cover"
              src={heroImageSrc}
              alt=""
              onError={(e) => {
                e.currentTarget.src = HERO_MEDIA.fallbackImage;
              }}
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={introDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Wesleyan University Philippines
          </motion.p>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '100%' }}
              animate={introDone ? { y: '0%' } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl font-poster uppercase text-[46px] font-semibold leading-[0.95] tracking-[0.01em] md:text-[88px]"
            >
              The CECT Capstone Repository
            </motion.h1>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={introDone ? { scaleX: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            className="mt-6 h-px w-24 bg-white/40 origin-center"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={introDone ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 font-mono text-[12px] font-semibold uppercase tracking-[0.3em] text-white/60"
          >
            CREST — Capstone Research Electronic Storage and Tracking
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={introDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/browse"
              className="rounded-xl bg-white px-8 py-4 text-[14px] font-bold text-neutral-900 shadow-xl transition-all hover:bg-white/90 active:scale-95"
            >
              Database
            </Link>
            <Link
              to="/faculty"
              className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-[14px] font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
            >
              Faculties
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={introDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[13px] text-white/70"
          >
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-white/80">verified</span>
              Peer-reviewed Archive
            </span>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-white/80">school</span>
              BSIT + BSCpE + BSECE Coverage
            </span>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-white/80">public</span>
              Open to All
            </span>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Scroll</span>
          <span className="material-symbols-outlined animate-bounce text-[24px]">expand_more</span>
        </div>
      </motion.section>
      <motion.div
        className="relative w-full overflow-hidden bg-background text-neutral-900 px-4 md:px-12 pt-16 pb-24"
      >
        {/* Decorative wavy linework — faint topographic flow behind the content */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <svg
            className="h-full w-full"
            viewBox="0 0 1440 1200"
            preserveAspectRatio="none"
            fill="none"
          >
            {[
              { y: 40, o: 0.03 },
              { y: 120, o: 0.02 },
              { y: 200, o: 0.035 },
              { y: 280, o: 0.02 },
              { y: 360, o: 0.03 },
              { y: 440, o: 0.018 },
              { y: 520, o: 0.03 },
              { y: 600, o: 0.02 },
              { y: 680, o: 0.035 },
              { y: 760, o: 0.018 },
              { y: 840, o: 0.03 },
              { y: 920, o: 0.02 },
              { y: 1000, o: 0.03 },
              { y: 1080, o: 0.018 },
              { y: 1160, o: 0.025 },
            ].map(({ y, o }) => (
              <path
                key={y}
                d={`M0,${y} C180,${y - 60} 360,${y - 60} 540,${y} S900,${y + 60} 1080,${y} S1380,${y - 60} 1440,${y}`}
                stroke="currentColor"
                className="text-neutral-900"
                strokeOpacity={0.05}
                strokeWidth="1.5"
              />
            ))}
          </svg>
          <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-neutral-200/60 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto">

          {/* Discipline Marquee */}
          <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="marquee relative mb-24 overflow-hidden border-y border-neutral-200 py-5">
            <div className="animate-marquee flex w-max items-center gap-16 py-2">
              {[...categories, ...categories, ...categories, ...categories].map((c, i) => (
                <Link
                  key={`${c.id}-${i}`}
                  to={`/browse?category=${encodeURIComponent(c.name)}`}
                  className="flex items-center gap-3 group"
                >
                  <span className="material-symbols-outlined text-neutral-400 text-[18px]">{CATEGORY_ICONS[c.name] || 'category'}</span>
                  <span className="text-[15px] font-semibold text-neutral-700 group-hover:text-neutral-900 transition-colors whitespace-nowrap">
                    {c.name}
                  </span>
                  <span className="text-[13px] text-neutral-400 font-medium">{c.count} papers</span>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Asymmetric Repository Browsing */}
          <motion.section variants={staggerReveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-28 md:mt-36">
            <motion.div variants={fadeUp} className="mb-12">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">The Collection</p>
                <h2 className="mt-2 font-display text-[28px] font-bold text-neutral-900 md:text-[40px]">
                  Start with a Discipline,<br className="hidden md:block" /> End with a Discovery
                </h2>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Disciplines (Left Column) */}
              <motion.div variants={staggerReveal} className="lg:col-span-4">
                <h2 className="font-display text-[24px] font-bold px-2 mb-2 text-neutral-900">Disciplines</h2>
                <div className="max-h-[380px] divide-y divide-neutral-200 overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#d4d4d4_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300">
                  {categories.map((c) => {
                    const active = c.name === activeDiscipline;
                    return (
                      <motion.div
                        key={c.id}
                        variants={pop}
                      >
                        <button
                          onClick={() => setSelectedDiscipline(c.name)}
                          aria-pressed={active}
                          className={`group flex w-full items-center gap-4 px-2 py-5 text-left transition-all hover:pl-4 ${active ? 'pl-4' : ''}`}
                        >
                          <span className={`material-symbols-outlined text-[22px] transition-colors ${active ? 'text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-900'}`}>{CATEGORY_ICONS[c.name] || 'category'}</span>
                          <div className="flex-grow">
                            <div className="text-[15px] font-bold text-neutral-900">{c.name}</div>
                            <div className="text-[12px] text-neutral-500 mt-0.5">
                              {DISCIPLINE_BLURBS[c.name] || 'Capstone projects and research'}
                              {c.count > 0 && <span className="font-semibold text-neutral-700"> · {c.count} {c.count === 1 ? 'paper' : 'papers'}</span>}
                            </div>
                          </div>
                          <span className={`material-symbols-outlined text-[20px] transition-all ${active ? 'text-neutral-900 translate-x-1' : 'text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1'}`}>arrow_forward</span>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Discipline Preview (Right Column) */}
              <motion.div variants={staggerReveal} className="lg:col-span-8">
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-[20px] font-bold text-neutral-900">
                    Latest in {activeDiscipline || 'the archive'}
                  </h3>
                  {activeDiscipline && (
                    <Link
                      to={`/browse?category=${encodeURIComponent(activeDiscipline)}`}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-neutral-500 hover:text-neutral-900 hover:gap-2 transition-all"
                    >
                      View all
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  )}
                </div>
                {disciplinePapers.length > 0 ? (
                  <motion.div
                    key={activeDiscipline}
                    variants={staggerReveal}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10"
                  >
                    {disciplinePapers.map((paper) => (
                      <motion.div key={paper.id} variants={pop}>
                        <ResearchCard
                          paper={paper}
                          to={`/research/${paper.id}`}
                          bare
                          footer={
                            <span className="text-neutral-900 text-[14px] font-medium flex items-center gap-1">
                              Read Full Paper
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </span>
                          }
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key={activeDiscipline} variants={pop} initial="hidden" animate="show" className="border-t-2 border-neutral-900 pt-8">
                    <p className="font-display text-[22px] font-bold text-neutral-900">Nothing published here yet.</p>
                    <p className="mt-2 max-w-md text-[14px] leading-relaxed text-neutral-600">
                      No approved papers in {activeDiscipline || 'this discipline'} so far — yours could be the first one on the shelf.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                      <Link
                        to="/submit"
                        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[13px] font-bold text-white transition-all hover:bg-neutral-700 active:scale-95"
                      >
                        Submit your capstone
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                      <Link
                        to="/browse"
                        className="text-[13px] font-bold text-neutral-900 underline decoration-neutral-300 decoration-2 underline-offset-8 hover:decoration-neutral-900 transition-all"
                      >
                        Browse everything instead
                      </Link>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.section>

          {/* How CREST Works */}
          <motion.section variants={staggerReveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-28 md:mt-36">
            <motion.p variants={fadeUp} className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              How it works
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-2 font-display text-[28px] font-bold text-neutral-900 md:text-[40px]">
              From Submission to Searchable Archive
            </motion.h2>
            <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
              {[
                { num: '01', icon: 'search', step: 'Discover', text: 'Browse approved capstones by program, discipline, adviser, or thesis number. Every paper carries its abstract, authors, and full document.' },
                { num: '02', icon: 'upload', step: 'Submit', text: 'Students submit capstone details and documents through the guided submission form. Entries queue for faculty review before going live.' },
                { num: '03', icon: 'verified', step: 'Review', text: 'Faculty verify, grade, and approve submissions in the portal. Approved work joins the public archive for the whole university.' },
              ].map((s) => (
                <motion.div key={s.step} variants={pop} className="relative border-t-2 border-neutral-900 pt-8">
                  <span className="pointer-events-none absolute -top-1 right-0 font-display text-[72px] font-bold leading-none text-neutral-900/[0.07] select-none" aria-hidden="true">{s.num}</span>
                  <span className="material-symbols-outlined text-[28px] text-neutral-900">{s.icon}</span>
                  <div className="mt-4 text-[17px] font-bold text-neutral-900">{s.step}</div>
                  <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{s.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Programs */}
          <motion.section variants={staggerReveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-28 md:mt-36">
            <motion.div variants={fadeUp} className="mb-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">Programs</p>
              <h2 className="mt-2 font-display text-[28px] font-bold text-neutral-900 md:text-[40px]">
                Three Programs, One Archive
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-0 md:divide-x md:divide-neutral-200">
              {[
                { abbr: 'BSIT', name: 'BS Information Technology', text: 'Systems, software, networks, and data projects from the IT program.', dx: 'right-32' },
                { abbr: 'BSECE', name: 'BS Electronics Engineering', text: 'Telecommunications, power systems, and electronics design capstones.', dx: 'right-0' },
              ].map((p, i) => (
                <motion.div key={p.abbr} variants={i === 0 ? slideLeft : slideRight} className="relative overflow-hidden py-4 md:px-12 md:first:pl-0 md:last:pr-0">
                  <span className={`pointer-events-none absolute -top-2 ${p.dx} font-display text-[84px] md:text-[112px] font-bold leading-none text-neutral-900/[0.15] select-none`} aria-hidden="true">{p.abbr}</span>
                  <div className="relative">
                    <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-neutral-400">{p.abbr}</div>
                    <div className="text-[22px] font-bold text-neutral-900 md:text-[26px]">{p.name}</div>
                    <p className="mt-4 max-w-md text-[15px] leading-relaxed text-neutral-600">{p.text}</p>
                    <Link to={`/browse?program=${p.abbr}`} className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-neutral-900 hover:gap-3 transition-all">
                      Browse {p.abbr} papers
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 md:mt-14 md:border-t md:border-neutral-200 md:pt-14">
              <div className="relative overflow-hidden py-4 md:mx-auto md:max-w-2xl">
                <span className="pointer-events-none absolute -top-2 right-24 font-display text-[84px] md:text-[112px] font-bold leading-none text-neutral-900/[0.15] select-none" aria-hidden="true">BSCpE</span>
                <div className="relative">
                  <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-neutral-400">BSCpE</div>
                  <div className="text-[22px] font-bold text-neutral-900 md:text-[26px]">BS Computer Engineering</div>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-neutral-600">Hardware, embedded systems, and engineering design capstones.</p>
                  <Link to="/browse?program=BSCpE" className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-neutral-900 hover:gap-3 transition-all">
                    Browse BSCpE papers
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>

          {/* About the Archive */}
          <motion.section variants={staggerReveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-28 md:mt-36 grid grid-cols-1 gap-10 md:grid-cols-12">
            <motion.div variants={fadeUp} className="md:col-span-5">
              <div className="md:sticky md:top-28">
                <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">About the archive</p>
                <h2 className="mt-2 font-display text-[28px] font-bold leading-tight text-neutral-900 md:text-[40px]">
                  The Institutional Memory of CECT Capstones
                </h2>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="md:col-span-7">
              <p className="max-w-3xl text-[16px] leading-relaxed text-neutral-600 md:text-[17px]">
                CREST (Capstone Research Electronic Storage and Tracking) preserves peer-reviewed capstone work from the College of Engineering and Computer Technology at
                Wesleyan University Philippines. Each entry is verified by faculty before publication, so students,
                advisers, and future researchers can build on real, citable work instead of starting from zero.
              </p>
              <div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
                {[
                  'Faculty-verified before every paper goes public',
                  'Searchable by title, author, adviser, year, and discipline',
                  'Full documents attached to every approved entry',
                  'Submission tracking from draft to approval',
                ].map((t) => (
                  <div key={t} className="flex items-center gap-4 py-4 text-[15px] font-medium text-neutral-800">
                    <span className="material-symbols-outlined text-[22px] text-neutral-400">check_circle</span>
                    {t}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.section>

          {/* Final CTA */}
          <motion.section variants={staggerReveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-28 md:mt-36 border-t-2 border-neutral-900 pt-12 md:pt-16">
            <motion.p variants={fadeUp} className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Get started
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 max-w-4xl font-display text-[40px] font-bold leading-[1.02] tracking-tight text-neutral-900 md:text-[72px]">
              Your Capstone Belongs Here.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[16px] leading-relaxed text-neutral-600">
              Search the full database of peer-reviewed work — or submit your own capstone for faculty review and take your place in the archive.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                to="/browse"
                className="group inline-flex items-center gap-3 rounded-full bg-neutral-900 px-8 py-4 text-[14px] font-bold text-white transition-all hover:bg-neutral-700 active:scale-95"
              >
                Database
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
              <Link
                to="/submit"
                className="group inline-flex items-center gap-2 text-[15px] font-bold text-neutral-900 underline decoration-neutral-300 decoration-2 underline-offset-8 hover:decoration-neutral-900 transition-all"
              >
                Submit your Capstone
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_outward</span>
              </Link>
            </motion.div>
          </motion.section>

          {/* Floating Action Button */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Link
              to="/submit"
              className="fixed bottom-8 right-8 w-14 h-14 bg-neutral-900 text-white rounded-full shadow-xl shadow-black/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
            >
              <span className="material-symbols-outlined text-[28px]">add</span>
              <div className="absolute right-20 bg-neutral-900 px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-white text-[14px] font-bold border border-white/10">
                New Submission
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
