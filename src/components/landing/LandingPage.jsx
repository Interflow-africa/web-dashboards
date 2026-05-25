import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import Icon from '@/components/common/Icon';
import './Landing.css';

/* ─── Brand colours ────────────────────────────────────────────── */
const GOLD      = '#8D5D1D';
const GOLD_HOVER = '#7A4E16';
const GOLD_GLOW  = 'rgba(228,187,133,0.45)';

/* ─── Scroll-reveal wrapper ─────────────────────────────────────── */
const Reveal = ({ children, className = '', delay = 0, style = {} }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-up ${visible ? 'in-view' : ''} ${className}`}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
};

/* ─── Reusable CTA button ──────────────────────────────────────── */
const GoldBtn = ({ children, onClick, outline = false, className = '' }) => (
  <button
    onClick={onClick}
    style={outline ? {} : { boxShadow: `0 4px 20px ${GOLD_GLOW}` }}
    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold transition-all hover:scale-105 active:scale-95 ${
      outline
        ? `border-2 border-[${GOLD}] text-[${GOLD}] hover:bg-[${GOLD}]/8`
        : `bg-[#8D5D1D] text-white hover:bg-[#7A4E16]`
    } ${className}`}
  >
    {children}
  </button>
);

/* ─── Navbar ────────────────────────────────────────────────────── */
const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const NAV_LINKS = [
    { href: '#about',    label: 'Artists' },
    { href: '#features', label: 'Organizations' },
    { href: '#stats',    label: 'Resources' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8] transition-shadow duration-300"
      style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.10)' : '0 1px 0 #E8E8E8' }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 flex items-center justify-between" style={{ height: 72 }}>

        {/* Logo */}
        <img src="/assets/icons/interflow-logo.svg" alt="Interflow" style={{ height: 44, width: 'auto' }} />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-12">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[15px] font-medium text-[#1A1A1A] hover:text-[#8D5D1D] transition-colors relative group"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#8D5D1D] transition-all duration-200 group-hover:w-full rounded-full" />
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl border-2 border-[#1A1A1A] text-[#1A1A1A] text-[14.5px] font-semibold hover:bg-[#F5F5F5] transition-colors"
          >
            Log In
          </Link>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2.5 rounded-xl text-white text-[14.5px] font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: GOLD, boxShadow: `0 4px 20px ${GOLD_GLOW}` }}
            onMouseEnter={e => e.currentTarget.style.background = GOLD_HOVER}
            onMouseLeave={e => e.currentTarget.style.background = GOLD}
          >
            Sign up
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`mobile-nav-drawer md:hidden bg-white border-t border-[#E8E8E8] ${menuOpen ? 'open' : ''}`}>
        <div className="px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[15px] font-medium text-[#1A1A1A] hover:text-[#8D5D1D] transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="flex gap-3 pt-2 border-t border-[#E8E8E8]">
            <Link
              to="/login"
              className="flex-1 text-center py-2.5 rounded-xl border-2 border-[#1A1A1A] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F5F5F5] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Log In
            </Link>
            <button
              onClick={() => { navigate('/register'); setMenuOpen(false); }}
              className="flex-1 py-2.5 rounded-xl text-white text-[14px] font-semibold"
              style={{ background: GOLD }}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

/* ─── Hero ──────────────────────────────────────────────────────── */
const HERO_PHOTOS = [
  { src: '/assets/images/landing/hero-1.png', alt: 'Singer',          fallback: '#1a0e05' },
  { src: '/assets/images/landing/hero-2.png', alt: 'Dancer',          fallback: '#0e0e14' },
  { src: '/assets/images/landing/hero-3.png', alt: 'Guitarist',       fallback: '#1a1200' },
  { src: '/assets/images/landing/hero-4.png', alt: 'Carnival dancer', fallback: '#1a0505' },
  { src: '/assets/images/landing/hero-5.png', alt: 'Musician',        fallback: '#0a0a14' },
];

const Hero = () => {
  const navigate = useNavigate();
  const leftRingRef  = useRef(null);
  const rightRingRef = useRef(null);

  /* Subtle parallax on the decorative rings */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY * 0.18;
      if (leftRingRef.current)  leftRingRef.current.style.transform  = `translateY(calc(-60% + ${y}px))`;
      if (rightRingRef.current) rightRingRef.current.style.transform = `translateY(calc(-60% + ${y}px))`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      className="relative bg-[#0A0A0A] text-white flex flex-col"
      style={{ minHeight: '100vh', paddingTop: 72, overflow: 'hidden' }}
    >
      {/* Decorative gold rings — parallax */}
      <div
        ref={leftRingRef}
        className="absolute pointer-events-none"
        style={{ left: -220, top: '50%', transform: 'translateY(-60%)', width: 500, height: 500 }}
      >
        <div className="ring-spin">
          <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
            <circle cx="250" cy="250" r="240" stroke="#8D5D1D" strokeWidth="1.5" strokeOpacity="0.55" />
            <circle cx="250" cy="250" r="190" stroke="#8D5D1D" strokeWidth="1"   strokeOpacity="0.3"  />
          </svg>
        </div>
      </div>
      <div
        ref={rightRingRef}
        className="absolute pointer-events-none"
        style={{ right: -220, top: '50%', transform: 'translateY(-60%)', width: 500, height: 500 }}
      >
        <div className="ring-spin-reverse">
          <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
            <circle cx="250" cy="250" r="240" stroke="#8D5D1D" strokeWidth="1.5" strokeOpacity="0.55" />
            <circle cx="250" cy="250" r="190" stroke="#8D5D1D" strokeWidth="1"   strokeOpacity="0.3"  />
          </svg>
        </div>
      </div>

      {/* Text content */}
      <Reveal className="relative z-10 flex flex-col items-center text-center px-6 pt-12 md:pt-16 pb-10">
        <h1
          className="text-white leading-tight mb-5"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 70px)' }}
        >
          Empowering Artists<br />
          Connecting Opportunities
        </h1>
        <p
          className="text-white/65 mb-10 max-w-[560px] leading-relaxed"
          style={{ fontSize: 'clamp(14px, 2vw, 15.5px)', fontWeight: 400 }}
        >
          Build your personalized portfolio and find your next best opportunity with Interflow
        </p>
        <button
          onClick={() => navigate('/register')}
          className="flex items-center gap-3 bg-white text-[#1A1A1A] rounded-full pl-7 pr-2 py-2 hover:bg-white/90 hover:scale-105 active:scale-95 transition-all"
          style={{ fontWeight: 600, fontSize: 15 }}
        >
          Get started
          <span className="w-9 h-9 bg-[#1A1A1A] rounded-full flex items-center justify-center shrink-0">
            <ArrowRight size={16} className="text-white" />
          </span>
        </button>
      </Reveal>

      {/* Photo fan cards */}
      <div className="relative z-10 flex-1 flex items-end w-full overflow-hidden">
        <div className="hero-fan w-full">
          {HERO_PHOTOS.map((p, i) => (
            <div key={i} className="hero-fan-card">
              <img
                src={p.src}
                alt={p.alt}
                onError={e => {
                  e.currentTarget.parentElement.style.background = p.fallback;
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── About ─────────────────────────────────────────────────────── */
const About = () => {
  const navigate = useNavigate();
  const SECTION_PAD = 220;
  const RING = 560;

  return (
    <section
      id="about"
      className="relative bg-white overflow-hidden"
      style={{ paddingTop: SECTION_PAD, paddingBottom: SECTION_PAD }}
    >
      {/* Corner rings — alternating spin directions */}
      {[
        { pos: { top: 0,    left:  0   }, tx: 'translate(-50%, -50%)', spin: 'ring-spin' },
        { pos: { top: 0,    right: 0   }, tx: 'translate( 50%, -50%)', spin: 'ring-spin-reverse' },
        { pos: { bottom: 0, left:  0   }, tx: 'translate(-50%,  50%)', spin: 'ring-spin-reverse' },
        { pos: { bottom: 0, right: 0   }, tx: 'translate( 50%,  50%)', spin: 'ring-spin' },
      ].map(({ pos, tx, spin }, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{ ...pos, width: RING, height: RING, zIndex: 0, transform: tx }}
        >
          <div className={spin}>
            <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} fill="none">
              <circle cx={RING/2} cy={RING/2} r={RING/2 - 10}  stroke="#8D5D1D" strokeWidth="1.5" strokeOpacity="0.55" />
              <circle cx={RING/2} cy={RING/2} r={RING/2 - 70}  stroke="#8D5D1D" strokeWidth="1"   strokeOpacity="0.3"  />
            </svg>
          </div>
        </div>
      ))}

      {/* Solid gradient circle */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 640, height: 640, background: 'linear-gradient(to right, #8D5D1D, #271A08)', zIndex: 0 }}
      />

      {/* Beige strip */}
      <div className="relative w-full" style={{ background: '#E8DDD0', zIndex: 1 }}>
        <div
          className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-14"
          style={{ padding: '56px 24px' }}
        >
          {/* Laptop image */}
          <Reveal className="relative shrink-0 w-full md:w-auto" style={{ maxWidth: 520 }}>
            <img
              src="/assets/images/landing/about-laptop.png"
              alt="Interflow platform on laptop"
              className="w-full h-auto"
              style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.22))' }}
              onError={e => {
                e.currentTarget.style.display = 'none';
                const fb = e.currentTarget.nextElementSibling;
                if (fb) fb.style.display = 'flex';
              }}
            />
            <div className="hidden w-full rounded-2xl items-center justify-center bg-[#d6ccbe]" style={{ height: 320 }}>
              <img src="/assets/icons/interflow-logo.svg" alt="Interflow" style={{ height: 48, width: 'auto', opacity: 0.4 }} />
            </div>
          </Reveal>

          {/* Text content */}
          <Reveal delay={150} className="flex-1">
            <h2
              className="font-bold text-[#1A1A1A] leading-tight mb-5"
              style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(24px, 3vw, 30px)' }}
            >
              About Interflow
            </h2>
            <p className="text-[#333] text-[15px] leading-relaxed mb-4">
              Interflow is an Artist's exchange platform where creativity meets opportunity
            </p>
            <p className="text-[#444] text-[15px] leading-relaxed mb-9">
              Artists can build dynamic portfolios, showcase their talent, grow their skills and connect with organizations ………
            </p>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-3 rounded-full pl-7 pr-2 py-2 hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
              style={{ background: GOLD, boxShadow: `0 4px 20px ${GOLD_GLOW}` }}
            >
              <span className="text-white font-semibold" style={{ fontSize: 15 }}>Read more</span>
              <span className="w-9 h-9 bg-[#1A1A1A] rounded-full flex items-center justify-center shrink-0">
                <ArrowRight size={16} className="text-white" />
              </span>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ─── Features ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    img: '/assets/images/landing/feature-1.png',
    title: 'Showcase your Achievements Your Way',
    desc: 'Control what the world see. Add new achievements automatically and choose what to showcase.',
  },
  {
    img: '/assets/images/landing/feature-2.png',
    title: 'Discover and Apply for Global Opportunities',
    desc: 'Find and apply to creative jobs, exhibitions, collaborations, residencies and grants, all in one place.',
  },
  {
    img: '/assets/images/landing/feature-3.png',
    title: 'Built for Creatives Worldwide',
    desc: 'Join a global platform without borders.',
  },
  {
    img: '/assets/images/landing/feature-4.png',
    title: 'Instantly Share your Portfolio',
    desc: 'Control achievements and choose what to showcase.',
  },
];
const FEAT_FALLBACKS = ['#2d1500', '#001a2d', '#1a002d', '#002d1a'];

const FeatureCard = ({ img, title, desc, fallback }) => (
  <div
    className="relative feature-card-lift"
    style={{ width: 370, flexShrink: 0, paddingBottom: 28 }}
  >
    {/* Gradient circle behind card */}
    <div
      className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
      style={{ width: 260, height: 260, bottom: 0, zIndex: 0, background: 'linear-gradient(to right, #8D5D1D, #271A08)' }}
    />
    {/* Card */}
    <div
      className="relative overflow-hidden bg-white"
      style={{ height: 460, borderRadius: 20, zIndex: 1, boxShadow: '0 4px 28px rgba(0,0,0,0.10)' }}
    >
      <div className="overflow-hidden shrink-0" style={{ height: 236, background: '#1a1a1a' }}>
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover"
          onError={e => {
            e.currentTarget.parentElement.style.background = fallback;
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="overflow-hidden" style={{ padding: '22px 26px 24px', height: 224 }}>
        <h3
          className="text-[#1A1A1A] font-bold leading-snug mb-3"
          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 22 }}
        >
          {title}
        </h3>
        <p className="text-[#555] leading-relaxed" style={{ fontSize: 14 }}>{desc}</p>
      </div>
    </div>
  </div>
);

const Features = () => (
  <section id="features" className="relative bg-white overflow-hidden" style={{ paddingTop: 80, paddingBottom: 100 }}>

    {/* Bottom-left ring */}
    <div className="pointer-events-none absolute" style={{ bottom: 0, left: 0, transform: 'translate(-50%, 50%)', width: 480, height: 480, zIndex: 0 }}>
      <div className="ring-spin">
        <svg width="480" height="480" viewBox="0 0 480 480" fill="none">
          <circle cx="240" cy="240" r="226" stroke="#E0D5C8" strokeWidth="1.5" />
          <circle cx="240" cy="240" r="178" stroke="#E8E0D6" strokeWidth="1"   />
        </svg>
      </div>
    </div>

    {/* Bottom-right ring */}
    <div className="pointer-events-none absolute" style={{ bottom: 0, right: 0, transform: 'translate(50%, 50%)', width: 480, height: 480, zIndex: 0 }}>
      <div className="ring-spin-reverse">
        <svg width="480" height="480" viewBox="0 0 480 480" fill="none">
          <circle cx="240" cy="240" r="226" stroke="#E0D5C8" strokeWidth="1.5" />
          <circle cx="240" cy="240" r="178" stroke="#E8E0D6" strokeWidth="1"   />
        </svg>
      </div>
    </div>

    {/* Heading */}
    <Reveal className="relative z-10 text-center mb-14 px-6">
      <h2
        className="font-bold text-[#1A1A1A] leading-tight"
        style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(26px, 4vw, 36px)' }}
      >
        Kickstart your Experience<br />
        with <span style={{ color: '#0197F6' }}>Interflow</span>
      </h2>
      <p className="text-[#888] text-[15px] mt-4 max-w-[500px] mx-auto leading-relaxed">
        Interflow helps you showcase your achievements in your own way, discover and
        apply for global opportunities and share your portfolio
      </p>
    </Reveal>

    {/* Marquee */}
    <div className="relative z-10">
      <div className="features-marquee-track">
        {[...FEATURES, ...FEATURES].map((f, i) => (
          <FeatureCard
            key={i}
            img={f.img}
            title={f.title}
            desc={f.desc}
            fallback={FEAT_FALLBACKS[i % FEATURES.length]}
          />
        ))}
      </div>
    </div>
  </section>
);

/* ─── Stats / Why Interflow Matters ─────────────────────────────── */
const STATS = [
  { num: '$2T',  sup: '+',  label: '$2T+ Creative Economy',    sub: 'Fuelling innovation and culture worldwide (UNCTAD, 2022)' },
  { num: '20%',  sup: null, label: '20% of Creative Employers.', sub: 'Prefer candidates with dynamic online portfolios (AIGA/Behance 2022)' },
  { num: '$13B', sup: '+',  label: '$13B+ Untapped Revenue',   sub: 'Untapped revenue potential in the Nigeria arts sector.' },
  { num: '48%',  sup: null, label: '48% Loose Opportunity',   sub: 'Loose opportunity due to lack of digital visibility (Arts council, 2021)' },
];

const StatCard = ({ num, sup, label, sub }) => (
  <div
    className="bg-white flex flex-col stat-card-lift"
    style={{
      width: '100%',
      maxWidth: 290,
      height: 370,
      borderRadius: 30,
      border: '4px solid #8D5D1D',
      padding: '28px 22px 24px',
      flexShrink: 0,
    }}
  >
    <div className="relative flex items-center justify-center mb-5" style={{ height: 164 }}>
      <div className="absolute rounded-full" style={{ width: 156, height: 156, background: '#E8DDD0' }} />
      <p
        className="relative z-10 font-black text-[#1A1A1A] leading-none"
        style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 44 }}
      >
        {num}
        {sup && <sup style={{ fontSize: '0.5em', verticalAlign: 'super', fontWeight: 900 }}>{sup}</sup>}
      </p>
    </div>
    <h3
      className="font-bold text-[#1A1A1A] leading-snug mb-2"
      style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 17 }}
    >
      {label}
    </h3>
    <p className="text-[#666] leading-relaxed" style={{ fontSize: 14 }}>{sub}</p>
  </div>
);

const Stats = () => (
  <section id="stats" className="relative overflow-hidden" style={{ background: '#E8DDD0', padding: '80px 0 96px' }}>
    <div className="max-w-[1160px] mx-auto px-6 md:px-10">

      <Reveal>
        <h2
          className="font-bold text-[#1A1A1A] mb-12 text-center"
          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(26px, 4vw, 32px)' }}
        >
          Why <span style={{ color: '#0197F6' }}>Interflow</span> Matters
        </h2>
      </Reveal>

      <div className="flex flex-col md:flex-row gap-10 md:gap-12 items-center">

        {/* Photo column */}
        <Reveal delay={100} className="relative shrink-0 self-center w-full md:w-auto" style={{ maxWidth: 400, paddingTop: 18, paddingLeft: 18 }}>
          <div
            className="absolute rounded-2xl pointer-events-none"
            style={{ top: 0, left: 0, right: 18, bottom: 18, borderRadius: 20, background: 'linear-gradient(to right, #8D5D1D, #271A08)', zIndex: 0 }}
          />
          <img
            src="/assets/images/landing/stats-person.png"
            alt="Creative professional"
            className="relative w-full object-cover"
            style={{ borderRadius: 20, display: 'block', zIndex: 1 }}
            onError={e => {
              e.currentTarget.style.display = 'none';
              const fb = e.currentTarget.nextElementSibling;
              if (fb) fb.style.display = 'flex';
            }}
          />
          <div className="hidden relative w-full rounded-2xl items-center justify-center bg-[#c8b89a]" style={{ height: 480, zIndex: 1 }}>
            <img src="/assets/icons/interflow-logo.svg" alt="Interflow" style={{ height: 48, width: 'auto', opacity: 0.4 }} />
          </div>
        </Reveal>

        {/* Stat cards — 2×2 grid, responsive */}
        <Reveal delay={200} className="w-full">
          <div
            className="grid gap-4 md:gap-5 justify-center md:justify-start"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 290px))' }}
          >
            {STATS.map((s, i) => <StatCard key={i} {...s} />)}
          </div>
        </Reveal>

      </div>
    </div>
  </section>
);

/* ─── Footer heading + gold rule ─────────────────────────────────── */
const FooterHeading = ({ children }) => (
  <div className="mb-6">
    <h3
      style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 22, color: GOLD }}
      className="font-bold leading-tight mb-3"
    >
      {children}
    </h3>
    <div style={{ width: 52, height: 2.5, background: GOLD, borderRadius: 2 }} />
  </div>
);

/* ─── Footer pill button ──────────────────────────────────────────── */
const FooterBtn = ({ children, onClick, outline = false }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 font-semibold transition-all hover:scale-105 active:scale-95 hover:opacity-90"
    style={{
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 15,
      height: 52,
      paddingLeft: 28,
      paddingRight: 20,
      borderRadius: 999,
      background: outline ? 'transparent' : '#FFFFFF',
      color: outline ? '#FFFFFF' : '#0A0A0A',
      border: outline ? '2px solid #FFFFFF' : 'none',
      flexShrink: 0,
    }}
  >
    {children}
    <span
      className="flex items-center justify-center rounded-full"
      style={{ width: 32, height: 32, background: outline ? '#FFFFFF' : '#0A0A0A', flexShrink: 0 }}
    >
      <ArrowRight size={16} color={outline ? '#0A0A0A' : '#FFFFFF'} />
    </span>
  </button>
);

/* ─── Footer ─────────────────────────────────────────────────────── */
const CONTACT_ITEMS = [
  { icon: 'location', text: 'Plot 413, Lighthouse City Estate, Abuja' },
  { icon: 'email',    text: 'interflow@gmail.com' },
  { icon: 'phone',    text: '+234 708 009 8343' },
];

const SOCIAL_ICONS = ['facebook', 'twitter', 'linkedin', 'instagram'];

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer style={{ background: '#0D0D0D', color: '#FFFFFF' }}>

      {/* Main columns */}
      <div
        className="mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-8"
        style={{ maxWidth: 1180, padding: '64px 24px 56px' }}
      >
        {/* Col 1 — About */}
        <Reveal className="w-full md:max-w-[360px]">
          <FooterHeading>About Interflow</FooterHeading>
          <p
            className="leading-relaxed mb-10"
            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.78)' }}
          >
            Interflow is an Artist's exchange platform where creativity meets opportunity.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <FooterBtn onClick={() => navigate('/register')}>Sign up today</FooterBtn>
            <FooterBtn onClick={() => navigate('/login')} outline>Sign In</FooterBtn>
          </div>
        </Reveal>

        {/* Col 2 — Shortcuts */}
        <Reveal delay={100}>
          <FooterHeading>Shortcuts</FooterHeading>
          <ul className="flex flex-col" style={{ gap: 18 }}>
            {['About Interflow', 'Artists', 'Organizations', 'Resources'].map(link => (
              <li key={link}>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.78)' }}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Col 3 — Contact */}
        <Reveal delay={200} className="md:max-w-[300px]">
          <FooterHeading>Our Contact</FooterHeading>
          <ul className="flex flex-col" style={{ gap: 22 }}>
            {CONTACT_ITEMS.map(({ icon, text }) => (
              <li key={icon} className="flex items-start gap-3">
                <Icon name={icon} color={GOLD} size={22} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* Gold divider + bottom bar */}
      <div style={{ borderTop: `1.5px solid ${GOLD}` }}>
        <div
          className="mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-4"
          style={{ maxWidth: 1180, padding: '18px 24px' }}
        >
          <p
            className="flex-1 text-center"
            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}
          >
            © Interflow 2025 , All Rights Reserved
          </p>
          <div className="flex items-center" style={{ gap: 20 }}>
            {SOCIAL_ICONS.map(name => (
              <a key={name} href="#" className="transition-all hover:opacity-70 hover:scale-110" aria-label={name}>
                <Icon name={name} color="#FFFFFF" size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

/* ─── Page ───────────────────────────────────────────────────────── */
const LandingPage = () => (
  <div className="font-sans">
    <Navbar />
    <Hero />
    <About />
    <Features />
    <Stats />
    <Footer />
  </div>
);

export default LandingPage;
