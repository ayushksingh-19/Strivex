import { motion } from 'framer-motion';
import { useState } from 'react';
import { Clock, Flame, Dumbbell, Activity, ArrowRight, Menu, Star, Check } from 'lucide-react';

// ============== NAV ==============
function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-lime rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-night" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl md:text-2xl text-white tracking-tight">
            STRIVEX
          </span>
        </a>

        {/* Nav links — center */}
        <div className="hidden md:flex items-center gap-1 bg-slate/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-line">
          {['Home', 'About', 'Programs', 'Trainers', 'Pricing'].map((l, i) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className={`px-4 py-1.5 text-sm rounded-full transition ${
                i === 0 ? 'bg-white/10 text-white' : 'text-mute hover:text-white'
              }`}
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-2 bg-lime text-night px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white transition"
          >
            Get Started
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 border border-lime/40 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-lime/10 transition"
          >
            Contact
          </a>
          <button className="md:hidden w-10 h-10 border border-line rounded-full flex items-center justify-center">
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ============== HERO ==============
const STAT_CARDS = [
  { icon: Clock, label: 'Hours', value: '1.5', pos: 'top-1/4 left-[8%]', delay: 0.6 },
  { icon: Activity, label: 'Poses', value: '20', pos: 'top-1/4 right-[8%]', delay: 0.8 },
  { icon: Flame, label: 'Kcal', value: '550', pos: 'bottom-[28%] left-[10%]', delay: 1.0 },
  { icon: Dumbbell, label: 'Sets', value: '5', pos: 'bottom-[28%] right-[10%]', delay: 1.2 },
];

function Hero() {
  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=2200&q=85&auto=format&fit=crop"
          alt="Gym workout background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlays — vignette + lime glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/50 to-night" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/60 via-transparent to-night/60" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-lime/10 blur-[120px] rounded-full" />
      </div>

      {/* PREV / NEXT side text */}
      <div className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-1.5 [writing-mode:vertical-rl] rotate-180 text-mute text-xs tracking-[0.4em]">
        <span>P</span><span>R</span><span>E</span><span>V</span>
      </div>
      <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-1.5 [writing-mode:vertical-rl] text-mute text-xs tracking-[0.4em]">
        <span>N</span><span>E</span><span>X</span><span>T</span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col pt-32 md:pt-36 pb-32 px-5 md:px-10">
        {/* Massive headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold text-white text-center leading-[0.95] tracking-tight max-w-6xl mx-auto"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 7.5rem)' }}
        >
          <span className="text-lime">Strivex</span> Your Body,<br />
          Elevate Your <span className="text-lime italic font-normal">Spirit</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 md:mt-8 text-center text-mute text-base md:text-lg max-w-2xl mx-auto"
        >
          Build strength. Train smart. Live louder. India's most modern training studio — for everyone from first-rep beginners to seasoned lifters.
        </motion.p>

        {/* Stat cards */}
        {STAT_CARDS.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: s.delay, ease: 'backOut' }}
            className={`hidden md:flex absolute ${s.pos} flex-col items-center gap-1.5 bg-slate/60 backdrop-blur-md border border-line rounded-3xl px-5 py-4 w-24`}
          >
            <div className="w-8 h-8 bg-lime/20 rounded-full flex items-center justify-center">
              <s.icon className="w-4 h-4 text-lime" strokeWidth={2} />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-mute">{s.label}</span>
            <span className="font-display font-bold text-2xl text-white">{s.value}</span>
          </motion.div>
        ))}

        {/* Bottom row: social proof + CTA */}
        <div className="mt-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex items-center gap-3"
          >
            <div className="flex -space-x-3">
              {[
                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=120&q=80&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=120&q=80&auto=format&fit=crop',
              ].map((src, i) => (
                <img key={i} src={src} alt="" className="w-10 h-10 rounded-full border-2 border-night object-cover" />
              ))}
            </div>
            <div>
              <p className="font-display font-bold text-xl md:text-2xl text-white leading-none">12k+</p>
              <p className="text-xs text-mute mt-1">Active members</p>
            </div>
          </motion.div>

          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            href="#programs"
            className="group inline-flex items-center gap-3 bg-lime text-night px-7 py-4 rounded-full font-semibold hover:gap-4 transition-all"
          >
            Let's Start
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.a>
        </div>
      </div>
    </section>
  );
}

// ============== BRAND MARQUEE ==============
function BrandMarquee() {
  const brands = ['UNDER ARMOUR', 'REEBOK', 'ADIDAS', 'PUMA', 'THE NORTH FACE', 'NIKE', 'GYMSHARK', 'NEW BALANCE'];
  return (
    <section className="bg-night border-y border-line py-8 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...brands, ...brands].map((b, i) => (
          <span key={i} className="font-display font-bold text-2xl md:text-3xl mx-10 text-mute hover:text-lime transition-colors">
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

// ============== FEATURES ==============
const FEATURES = [
  { icon: '🏋️', title: 'Personal Coaching', text: 'One-on-one programming with certified strength coaches. We don\'t do generic.' },
  { icon: '📊', title: 'Live Progress Tracking', text: 'Every lift logged, every PR tracked. See your strength curve in real-time.' },
  { icon: '🥗', title: 'Nutrition That Works', text: 'Personalized macro plans built around your goals, food preferences, and lifestyle.' },
  { icon: '🔥', title: 'Group Classes', text: 'HIIT, mobility, powerlifting clinics. Energy that lifts everyone in the room.' },
];

function Features() {
  return (
    <section id="about" className="relative py-24 md:py-32 px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16 md:mb-20 max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-lime mb-4">— Why Strivex</p>
          <h2 className="font-display font-bold text-white leading-[1.05] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Built for athletes,<br />
            <span className="text-lime italic font-normal">priced for everyone.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-slate border border-line rounded-3xl p-6 hover:border-lime/40 transition-colors group"
            >
              <div className="w-14 h-14 bg-lime/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-lime/20 transition">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{f.title}</h3>
              <p className="text-sm text-mute leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============== PROGRAMS ==============
const PROGRAMS = [
  {
    name: 'STRENGTH',
    desc: 'Big lifts. Real numbers. Build the foundation.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1000&q=85&auto=format&fit=crop',
    sessions: '4× / week',
  },
  {
    name: 'HYPERTROPHY',
    desc: 'Volume + intensity. Built for visible change.',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1000&q=85&auto=format&fit=crop',
    sessions: '5× / week',
  },
  {
    name: 'CONDITIONING',
    desc: 'Cardio that doesn\'t kill your gains. Smart energy systems.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1000&q=85&auto=format&fit=crop',
    sessions: '3× / week',
  },
];

function Programs() {
  return (
    <section id="programs" className="relative py-24 md:py-32 px-5 md:px-10 bg-slate/30">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-lime mb-4">— Programs</p>
            <h2 className="font-display font-bold text-white leading-[1.05] tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
              Three pillars.<br /><span className="text-lime italic font-normal">One goal.</span>
            </h2>
          </div>
          <p className="text-mute max-w-md">
            Every program is built around progressive overload, recovery science, and athlete-grade coaching.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROGRAMS.map((p, i) => (
            <motion.a
              key={p.name}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group block rounded-3xl overflow-hidden border border-line bg-slate hover:border-lime/40 transition-all"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent" />
                <div className="absolute top-4 right-4 bg-lime text-night px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {p.sessions}
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-2 tracking-tight">{p.name}</h3>
                  <p className="text-sm text-mute leading-relaxed">{p.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm text-lime font-semibold opacity-0 group-hover:opacity-100 transition">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============== TRAINERS ==============
const TRAINERS = [
  { name: 'Arjun Kapoor', role: 'Head Strength Coach', image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=85&auto=format&fit=crop' },
  { name: 'Meera Singh', role: 'Hypertrophy Specialist', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=85&auto=format&fit=crop' },
  { name: 'Vikram Rao', role: 'Powerlifting Coach', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=85&auto=format&fit=crop' },
  { name: 'Tara Iyer', role: 'Nutrition Lead', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=85&auto=format&fit=crop' },
];

function Trainers() {
  return (
    <section id="trainers" className="relative py-24 md:py-32 px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 md:mb-16 max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-lime mb-4">— Meet The Coaches</p>
          <h2 className="font-display font-bold text-white leading-[1.05] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Trained by the<br /><span className="text-lime italic font-normal">best in the country.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {TRAINERS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate border border-line">
                <img src={t.image} alt={t.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display font-bold text-base md:text-lg text-white">{t.name}</h3>
                  <p className="text-xs text-lime mt-0.5">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============== PRICING ==============
const PLANS = [
  {
    name: 'STARTER',
    price: '1,999',
    perks: ['Gym floor access', 'Basic group classes', 'Locker + shower', 'Mobile app access'],
    cta: 'Start training',
    highlight: false,
  },
  {
    name: 'PRO',
    price: '4,499',
    perks: ['Everything in Starter', 'Personal coach (4× / month)', 'All group classes', 'Nutrition consult', 'Recovery zone'],
    cta: 'Go Pro',
    highlight: true,
  },
  {
    name: 'ELITE',
    price: '8,999',
    perks: ['Everything in Pro', 'Unlimited 1-on-1 coaching', 'Custom meal plans', 'Performance testing', 'Priority booking'],
    cta: 'Talk to us',
    highlight: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 px-5 md:px-10 bg-slate/30">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 md:mb-16 text-center max-w-3xl mx-auto"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-lime mb-4">— Membership</p>
          <h2 className="font-display font-bold text-white leading-[1.05] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Simple pricing.<br /><span className="text-lime italic font-normal">Serious results.</span>
          </h2>
          <p className="mt-6 text-mute">Cancel anytime. No joining fee. No surprises.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 border ${
                p.highlight ? 'bg-lime text-night border-lime' : 'bg-slate text-white border-line'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-night text-lime text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className={`font-display font-bold text-2xl tracking-tight ${p.highlight ? 'text-night' : 'text-white'}`}>{p.name}</h3>
              <div className="mt-4 mb-6 flex items-baseline gap-1">
                <span className={`text-sm ${p.highlight ? 'text-night/60' : 'text-mute'}`}>₹</span>
                <span className="font-display font-bold text-5xl">{p.price}</span>
                <span className={`text-sm ${p.highlight ? 'text-night/60' : 'text-mute'}`}>/ mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? 'text-night' : 'text-lime'}`} strokeWidth={3} />
                    <span className={p.highlight ? 'text-night/80' : 'text-mute'}>{perk}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-full font-semibold text-sm transition ${
                  p.highlight
                    ? 'bg-night text-lime hover:bg-night/80'
                    : 'bg-lime text-night hover:bg-white'
                }`}
              >
                {p.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============== TESTIMONIAL ==============
function Testimonial() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-lime text-lime" />
            ))}
          </div>
          <blockquote className="font-display font-bold text-2xl md:text-4xl text-white leading-tight tracking-tight">
            "Lost 14 kg in 6 months. But more than that — I finally know <span className="text-lime italic font-normal">why</span> I lift the way I do."
          </blockquote>
          <p className="mt-8 text-mute">Priya Sharma · Member since 2024</p>
        </motion.div>
      </div>
    </section>
  );
}

// ============== CTA ==============
function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-24 md:py-32 px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-lime rounded-[2.5rem] p-10 md:p-20 overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-night/10 rounded-full blur-3xl" />
          <h2 className="font-display font-bold text-night leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
            Ready for Strivex?
          </h2>
          <p className="mt-6 text-night/80 text-lg max-w-xl mx-auto">
            First class is on us. Book a free trial session and meet your coach.
          </p>
          {!submitted ? (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email.includes('@')) setSubmitted(true); }}
              className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 bg-night/10 border border-night/20 text-night placeholder:text-night/40 px-5 py-3.5 rounded-full text-sm font-medium outline-none focus:border-night transition"
              />
              <button type="submit" className="bg-night text-lime px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-night/80 transition inline-flex items-center justify-center gap-2">
                Book trial <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="mt-10 inline-block bg-night text-lime px-7 py-3.5 rounded-full font-semibold text-sm">
              ✓ Booked — we'll be in touch within 24 hours
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ============== FOOTER ==============
function Footer() {
  return (
    <footer className="border-t border-line py-12 px-5 md:px-10">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-lime rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-night" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-2xl text-white">STRIVEX</span>
          </div>
          <p className="text-sm text-mute max-w-sm">
            India's most modern training studio. Built for athletes, priced for everyone.
          </p>
        </div>
        {[
          { title: 'Studio', links: ['Home', 'About', 'Programs', 'Trainers'] },
          { title: 'Connect', links: ['Contact', 'Instagram', 'YouTube', 'Newsletter'] },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-[11px] uppercase tracking-widest text-lime mb-3">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}><a href="#" className="text-sm text-mute hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1400px] mx-auto mt-12 pt-6 border-t border-line flex flex-col md:flex-row justify-between gap-3 text-xs text-mute">
        <span>© 2026 STRIVEX · Mumbai · Bengaluru · Delhi</span>
        <span>Built by Ayush Kumar</span>
      </div>
    </footer>
  );
}

// ============== ROOT ==============
export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <BrandMarquee />
      <Features />
      <Programs />
      <Trainers />
      <Pricing />
      <Testimonial />
      <CTA />
      <Footer />
    </main>
  );
}
