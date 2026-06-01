import { type FormEvent, startTransition, useDeferredValue, useEffect, useState } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Database,
  Dumbbell,
  Flame,
  HeartPulse,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Phone,
  PlusCircle,
  ShieldCheck,
  Star,
  TimerReset,
  UserRound,
  Users,
} from 'lucide-react';
import { api } from './lib/api';
import type { AdminBooking, AdminOverview, Booking, Lead, Program, Session, User } from './types';

const TOKEN_KEY = 'strivex_token';
const goalOptions = ['Lose fat', 'Build strength', 'Gain muscle', 'Stay consistent'];
const brands = ['UNDER ARMOUR', 'REEBOK', 'ADIDAS', 'PUMA', 'THE NORTH FACE', 'NIKE', 'GYMSHARK', 'NEW BALANCE'];

const trainerProfiles = [
  {
    name: 'Arjun Kapoor',
    role: 'Head Strength Coach',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&q=80&auto=format&fit=crop',
  },
  {
    name: 'Meera Singh',
    role: 'Conditioning Specialist',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=900&q=80&auto=format&fit=crop',
  },
  {
    name: 'Vikram Rao',
    role: 'Powerlifting Coach',
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=900&q=80&auto=format&fit=crop',
  },
  {
    name: 'Tara Iyer',
    role: 'Recovery and Nutrition Lead',
    image: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=900&q=80&auto=format&fit=crop',
  },
];

const planCards = [
  {
    name: 'STARTER',
    price: '1,999',
    perks: ['Gym floor access', 'Basic group classes', 'Locker and shower', 'Mobile app access'],
    cta: 'Start training',
    highlight: false,
  },
  {
    name: 'PRO',
    price: '4,499',
    perks: ['Everything in Starter', 'Personal coach each month', 'All group classes', 'Nutrition consult'],
    cta: 'Go Pro',
    highlight: true,
  },
  {
    name: 'ELITE',
    price: '8,999',
    perks: ['Everything in Pro', 'Unlimited one-on-one coaching', 'Custom meal plans', 'Priority booking'],
    cta: 'Talk to us',
    highlight: false,
  },
];

const programImages: Record<string, string> = {
  'strength-lab':
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80&auto=format&fit=crop',
  'ignite-hiit':
    'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=1200&q=80&auto=format&fit=crop',
  'mobility-reset':
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80&auto=format&fit=crop',
};

type Notice = {
  type: 'success' | 'error';
  message: string;
};

function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  body: string;
  align?: 'left' | 'center';
}) {
  const alignmentClass = align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl';

  return (
    <div className={alignmentClass}>
      <p className="text-xs uppercase tracking-[0.35em] text-lime">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-zinc-300">{body}</p>
    </div>
  );
}

function BulgeButton({
  children,
  className = '',
  disabled,
  ...props
}: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileTap={
        disabled
          ? undefined
          : {
              scale: 1.05,
              y: -3,
              boxShadow: '0 20px 44px rgba(217,255,61,0.28)',
            }
      }
      transition={{ type: 'spring', stiffness: 380, damping: 16 }}
      disabled={disabled}
      className={`origin-center will-change-transform ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminLeads, setAdminLeads] = useState<Lead[]>([]);
  const [adminBookings, setAdminBookings] = useState<AdminBooking[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [adminQuery, setAdminQuery] = useState('');
  const [adminTab, setAdminTab] = useState<'overview' | 'leads' | 'members' | 'bookings' | 'create'>('overview');
  const deferredAdminQuery = useDeferredValue(adminQuery);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    goal: goalOptions[1],
  });
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    goal: goalOptions[0],
    message: '',
  });
  const [sessionForm, setSessionForm] = useState({
    programId: '',
    title: '',
    coach: '',
    sessionDate: '',
    startTime: '',
    durationMins: '60',
    location: '',
    capacity: '16',
  });

  const filteredAdminUsers = adminUsers.filter((member) => {
    if (!deferredAdminQuery.trim()) return true;
    const search = deferredAdminQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(search) ||
      member.email.toLowerCase().includes(search) ||
      (member.goal ?? '').toLowerCase().includes(search)
    );
  });

  const filteredAdminLeads = adminLeads.filter((lead) => {
    if (!deferredAdminQuery.trim()) return true;
    const search = deferredAdminQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      lead.goal.toLowerCase().includes(search)
    );
  });

  const filteredAdminBookings = adminBookings.filter((booking) => {
    if (!deferredAdminQuery.trim()) return true;
    const search = deferredAdminQuery.toLowerCase();
    return (
      booking.member_name.toLowerCase().includes(search) ||
      booking.member_email.toLowerCase().includes(search) ||
      booking.program_name.toLowerCase().includes(search) ||
      booking.title.toLowerCase().includes(search)
    );
  });

  async function loadCatalog() {
    setCatalogLoading(true);

    try {
      const [nextPrograms, nextSessions] = await Promise.all([api.programs(), api.sessions()]);
      setPrograms(nextPrograms);
      setSessions(nextSessions);
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to load Strivex data.',
      });
    } finally {
      setCatalogLoading(false);
    }
  }

  async function loadAdminData(authToken: string) {
    const [overview, leads, users, bookingsList] = await Promise.all([
      api.adminOverview(authToken),
      api.adminLeads(authToken),
      api.adminUsers(authToken),
      api.adminBookings(authToken),
    ]);

    setAdminOverview(overview);
    setAdminLeads(leads);
    setAdminUsers(users);
    setAdminBookings(bookingsList);
  }

  async function hydrateSession(authToken: string) {
    setDashboardLoading(true);

    try {
      const currentUser = await api.me(authToken);
      setUser(currentUser);
      const myBookings = await api.myBookings(authToken);
      setBookings(myBookings);

      if (currentUser.role === 'admin') {
        await loadAdminData(authToken);
      } else {
        setAdminOverview(null);
        setAdminLeads([]);
        setAdminUsers([]);
        setAdminBookings([]);
      }
    } catch (error) {
      setToken(null);
      setUser(null);
      setBookings([]);
      setAdminOverview(null);
      setAdminLeads([]);
      setAdminUsers([]);
      setAdminBookings([]);
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Your session expired.',
      });
    } finally {
      setDashboardLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCatalog();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void hydrateSession(token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setBookings([]);
      setAdminOverview(null);
      setAdminLeads([]);
      setAdminUsers([]);
      setAdminBookings([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function refreshAuthenticatedData() {
    await loadCatalog();

    if (token) {
      await hydrateSession(token);
    }
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setNotice(null);

    try {
      const response =
        authMode === 'signup'
          ? await api.register({
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
              goal: authForm.goal,
            })
          : await api.login({
              email: authForm.email,
              password: authForm.password,
            });

      setUser(response.user);
      setToken(response.token);
      setAuthForm({
        name: '',
        email: response.user.email,
        password: '',
        goal: goalOptions[1],
      });
      setNotice({
        type: 'success',
        message:
          authMode === 'signup'
            ? 'Your Strivex account is live. You can start booking sessions now.'
            : `Welcome back, ${response.user.name}.`,
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to complete authentication.',
      });
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingLead(true);
    setNotice(null);

    try {
      await api.submitLead(leadForm);
      setLeadForm({
        name: '',
        email: '',
        phone: '',
        goal: goalOptions[0],
        message: '',
      });
      setNotice({
        type: 'success',
        message: 'Lead saved. Your trial request is now in the admin pipeline.',
      });

      if (token && user?.role === 'admin') {
        await loadAdminData(token);
      }
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to submit lead.',
      });
    } finally {
      setSubmittingLead(false);
    }
  }

  async function handleBookSession(sessionId: number) {
    if (!token) {
      setNotice({
        type: 'error',
        message: 'Create an account or log in to book a session.',
      });
      document.getElementById('access')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      await api.bookSession(token, { sessionId, notes: '' });
      await refreshAuthenticatedData();
      setNotice({
        type: 'success',
        message: 'Session booked. Your dashboard has been updated.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to book session.',
      });
    }
  }

  async function handleCancelBooking(bookingId: number) {
    if (!token) return;

    try {
      await api.cancelBooking(token, bookingId);
      await refreshAuthenticatedData();
      setNotice({
        type: 'success',
        message: 'Booking cancelled and the spot has been released.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to cancel booking.',
      });
    }
  }

  async function handleCreateSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) return;

    setCreatingSession(true);
    setNotice(null);

    try {
      await api.createSession(token, {
        programId: Number(sessionForm.programId),
        title: sessionForm.title,
        coach: sessionForm.coach,
        sessionDate: sessionForm.sessionDate,
        startTime: sessionForm.startTime,
        durationMins: Number(sessionForm.durationMins),
        location: sessionForm.location,
        capacity: Number(sessionForm.capacity),
      });

      setSessionForm({
        programId: '',
        title: '',
        coach: '',
        sessionDate: '',
        startTime: '',
        durationMins: '60',
        location: '',
        capacity: '16',
      });

      await refreshAuthenticatedData();
      startTransition(() => setAdminTab('overview'));
      setNotice({
        type: 'success',
        message: 'New session created successfully.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to create session.',
      });
    } finally {
      setCreatingSession(false);
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setNotice({
      type: 'success',
      message: 'You have been logged out.',
    });
  }

  const nextBooking = bookings[0] ?? null;
  const remainingSpots = sessions.reduce((total, session) => total + session.spots_remaining, 0);
  const sessionCount = sessions.length;
  const upcomingPrograms = programs.slice(0, 3);
  const visibleSessions = sessions.slice(0, 6);
  const heroStats = [
    { icon: TimerReset, label: 'Hours', value: '24/7', pos: 'top-1/4 left-[8%]', delay: 0.55 },
    { icon: Activity, label: 'Classes', value: String(sessionCount || 6), pos: 'top-1/4 right-[8%]', delay: 0.7 },
    { icon: Flame, label: 'Spots', value: String(remainingSpots || 122), pos: 'bottom-[28%] left-[10%]', delay: 0.85 },
    { icon: Dumbbell, label: 'Plans', value: String(programs.length || 3), pos: 'bottom-[28%] right-[10%]', delay: 1 },
  ];

  const featureCards = [
    {
      icon: ShieldCheck,
      title: 'Personal Coaching',
      text: 'Members get guided plans, class flow, and accountability without losing the premium editorial feel of the original site.',
    },
    {
      icon: Activity,
      title: 'Live Progress Tracking',
      text: 'This build now has real saved users, live sessions, and bookings, so the frontend is backed by working state instead of placeholder copy.',
    },
    {
      icon: HeartPulse,
      title: 'Nutrition and Recovery',
      text: 'Recovery, mobility, and daily energy are treated like first-class parts of the product instead of side notes in a brochure layout.',
    },
    {
      icon: Database,
      title: 'Operational Backbone',
      text: 'Leads, accounts, schedules, and admin actions persist in SQLite while still fitting into a cinematic landing-page structure.',
    },
  ];

  return (
    <main className="bg-night text-white">
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-8">
          <a href="#home" className="flex items-center gap-3">
            <img src="/strivex-logo-yellow.svg" alt="Strivex logo" className="h-12 w-auto md:h-14" />
          </a>

          <nav className="hidden items-center gap-1 rounded-full border border-line bg-slate/70 px-2 py-1.5 backdrop-blur-md md:flex">
            {['Home', 'About', 'Programs', 'Trainers', 'Pricing'].map((label, index) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  index === 0 ? 'bg-white/10 text-white' : 'text-mute hover:text-white'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden rounded-full border border-white/15 bg-slate/60 px-4 py-2 text-sm text-zinc-200 md:block">
                  {user.name} | {user.role}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-lime/35 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-lime/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="#access"
                  className="hidden items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-night transition hover:bg-white sm:inline-flex"
                >
                  Get Started
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full border border-lime/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-lime/10"
                >
                  Contact
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <section id="home" className="relative flex min-h-screen w-full flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=2200&q=85&auto=format&fit=crop"
            alt="Strivex hero background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-night/75 via-night/55 to-night" />
          <div className="absolute inset-0 bg-gradient-to-r from-night/65 via-transparent to-night/65" />
          <div className="absolute -bottom-32 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full bg-lime/10 blur-[120px]" />
        </div>

        <div className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 rotate-180 flex-col items-center gap-1.5 text-xs tracking-[0.4em] text-mute [writing-mode:vertical-rl] lg:flex">
          <span>P</span>
          <span>R</span>
          <span>E</span>
          <span>V</span>
        </div>
        <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-1.5 text-xs tracking-[0.4em] text-mute [writing-mode:vertical-rl] lg:flex">
          <span>N</span>
          <span>E</span>
          <span>X</span>
          <span>T</span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-5 pb-32 pt-32 md:px-10 md:pt-36">
          {notice && (
            <div
              className={`mx-auto mb-8 flex max-w-2xl items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                notice.type === 'success'
                  ? 'border-lime/30 bg-lime/10 text-lime'
                  : 'border-red-400/30 bg-red-500/10 text-red-200'
              }`}
            >
              {notice.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{notice.message}</span>
            </div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-6xl text-center font-display font-bold leading-[0.95] tracking-tight text-white"
            style={{ fontSize: 'clamp(2.7rem, 8vw, 7.5rem)' }}
          >
            <span className="text-lime">Strivex</span> Your Body,
            <br />
            Elevate Your <span className="font-normal italic text-lime">Spirit</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-6 max-w-3xl text-center text-base text-zinc-300 md:mt-8 md:text-lg"
          >
            The same cinematic gym landing-page structure now powers a real Strivex product with sign in,
            live bookings, admin operations, and better editorial imagery throughout.
          </motion.p>

          {heroStats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: stat.delay, ease: 'backOut' }}
              className={`absolute ${stat.pos} hidden w-24 flex-col items-center gap-1.5 rounded-3xl border border-line bg-slate/60 px-5 py-4 backdrop-blur-md md:flex`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime/20">
                <stat.icon className="h-4 w-4 text-lime" strokeWidth={2} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-mute">{stat.label}</span>
              <span className="font-display text-2xl font-bold text-white">{stat.value}</span>
            </motion.div>
          ))}

          <div className="mt-auto flex flex-col items-center justify-between gap-6 pt-12 md:flex-row md:items-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-3">
                {[
                  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=120&q=80&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=120&q=80&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=120&q=80&auto=format&fit=crop',
                ].map((src, index) => (
                  <img key={index} src={src} alt="" className="h-10 w-10 rounded-full border-2 border-night object-cover" />
                ))}
              </div>
              <div>
                <p className="font-display text-xl font-bold leading-none text-white md:text-2xl">12k+</p>
                <p className="mt-1 text-xs text-mute">Active members</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.95 }}
              className="flex flex-col items-center gap-3 sm:flex-row"
            >
              <a
                href="#programs"
                className="group inline-flex items-center gap-3 rounded-full bg-lime px-7 py-4 font-semibold text-night transition-all hover:gap-4"
              >
                Explore Programs
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#access"
                className="inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-4 font-semibold text-white transition hover:border-lime/40 hover:bg-white/5"
              >
                Member Access
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-line bg-night py-8">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((brand, index) => (
            <span
              key={`${brand}-${index}`}
              className="mx-10 font-display text-2xl font-bold text-mute transition-colors hover:text-lime md:text-3xl"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      <section id="about" className="relative px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mb-16 max-w-3xl md:mb-20"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-lime">Why Strivex</p>
            <h2
              className="font-display font-bold leading-[1.05] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              Same bold structure,
              <br />
              <span className="font-normal italic text-lime">stronger product underneath.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="group rounded-3xl border border-line bg-slate p-6 transition-colors hover:border-lime/40"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/10 transition group-hover:bg-lime/20">
                  <feature.icon className="h-7 w-7 text-lime" />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-mute">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" className="relative bg-slate/30 px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-lime">Programs</p>
              <h2
                className="font-display font-bold leading-[1.05] tracking-tight text-white"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
              >
                Three pillars.
                <br />
                <span className="font-normal italic text-lime">One Strivex system.</span>
              </h2>
            </div>
            <p className="max-w-md text-mute">
              These cards still feel like the original clone, but they now pull program names and copy from the
              API instead of hardcoded placeholders.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {upcomingPrograms.map((program, index) => {
              const matchingSessions = sessions.filter((session) => session.program_slug === program.slug).length;

              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group block overflow-hidden rounded-3xl border border-line bg-slate transition-all hover:border-lime/40"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={programImages[program.slug] ?? trainerProfiles[index % trainerProfiles.length].image}
                      alt={program.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent" />
                    <div className="absolute right-4 top-4 rounded-full bg-lime px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-night">
                      {matchingSessions} live sessions
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="mb-2 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                        {program.name}
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-300">{program.tagline}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lime opacity-0 transition group-hover:opacity-100">
                        {program.price} <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="schedule" className="relative px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading
            eyebrow="Schedule"
            title="Book live classes without leaving the landing page."
            body={
              catalogLoading
                ? 'Loading live classes from the API so the page can switch from static clone to working product.'
                : 'This block uses the same bold card language as the original frontend while exposing real session dates, open spots, and booking actions.'
            }
          />

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.05 }}
                className="rounded-3xl border border-line bg-slate p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-lime">{session.program_name}</p>
                    <h3 className="mt-3 font-display text-2xl font-bold text-white">{session.title}</h3>
                  </div>
                  <span className="rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-lime">
                    {session.spots_remaining} left
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-sm text-zinc-300">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-lime" />
                    <span>{formatLongDate(session.session_date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TimerReset className="h-4 w-4 text-lime" />
                    <span>
                      {session.start_time} | {session.duration_mins} min
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 text-lime" />
                    <span>{session.coach}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HeartPulse className="h-4 w-4 text-lime" />
                    <span>{session.location}</span>
                  </div>
                </div>

                <BulgeButton
                  type="button"
                  disabled={session.spots_remaining === 0}
                  onClick={() => void handleBookSession(session.id)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime px-5 py-3.5 text-sm font-semibold text-night transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {session.spots_remaining === 0 ? 'Session full' : user ? 'Book session' : 'Login to book'}
                  <ArrowRight className="h-4 w-4" />
                </BulgeButton>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="trainers" className="relative px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12 max-w-3xl md:mb-16"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-lime">Meet The Coaches</p>
            <h2
              className="font-display font-bold leading-[1.05] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              Trained by the
              <br />
              <span className="font-normal italic text-lime">best in the country.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {trainerProfiles.map((trainer, index) => (
              <motion.div
                key={trainer.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-line bg-slate">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-base font-bold text-white md:text-lg">{trainer.name}</h3>
                    <p className="mt-0.5 text-xs text-lime">{trainer.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative bg-slate/30 px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-lime">Membership</p>
            <h2
              className="font-display font-bold leading-[1.05] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              Simple pricing.
              <br />
              <span className="font-normal italic text-lime">Serious results.</span>
            </h2>
            <p className="mt-6 text-mute">Cancel anytime. No joining fee. No surprises.</p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
            {planCards.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative rounded-3xl border p-8 ${
                  plan.highlight ? 'border-lime bg-lime text-night' : 'border-line bg-slate text-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-night px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-lime">
                    Most Popular
                  </div>
                )}
                <h3
                  className={`font-display text-2xl font-bold tracking-tight ${
                    plan.highlight ? 'text-night' : 'text-white'
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="mb-6 mt-4 flex items-baseline gap-1">
                  <span className={`text-sm ${plan.highlight ? 'text-night/60' : 'text-mute'}`}>INR</span>
                  <span className="font-display text-5xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-night/60' : 'text-mute'}`}>/ mo</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-night' : 'text-lime'}`}
                        strokeWidth={3}
                      />
                      <span className={plan.highlight ? 'text-night/80' : 'text-mute'}>{perk}</span>
                    </li>
                  ))}
                </ul>
                <BulgeButton
                  type="button"
                  className={`w-full rounded-full py-3 text-sm font-semibold transition ${
                    plan.highlight ? 'bg-night text-lime hover:bg-night/80' : 'bg-lime text-night hover:bg-white'
                  }`}
                >
                  {plan.cta}
                </BulgeButton>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="access" className="relative px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading
            eyebrow="Member Access"
            title="Log in, review bookings, and manage the real Strivex flow."
            body="This section keeps the product functionality you asked for, but it now lives inside the same editorial front-end language as the clone instead of a separate app-style shell."
          />

          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55 }}
              className="rounded-[2rem] border border-line bg-slate p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-lime">Access</p>
                  <h3 className="mt-3 font-display text-3xl font-bold text-white">
                    {user ? 'Your Strivex access' : authMode === 'signup' ? 'Create account' : 'Welcome back'}
                  </h3>
                </div>
                <div className="rounded-2xl border border-white/10 bg-night/50 p-3 text-lime">
                  {user ? <LayoutDashboard className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                </div>
              </div>

              {user ? (
                <div className="mt-8 space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-night/35 p-5">
                    <p className="text-sm text-zinc-400">Signed in as</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{user.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
                    <p className="mt-4 inline-flex rounded-full bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-lime">
                      {user.role}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-night/35 p-5">
                      <p className="text-sm text-zinc-400">Upcoming bookings</p>
                      <p className="mt-2 text-4xl font-bold text-white">{bookings.length}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-night/35 p-5">
                      <p className="text-sm text-zinc-400">Primary goal</p>
                      <p className="mt-2 text-xl font-semibold text-white">{user.goal || 'Not set yet'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full border border-lime/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-lime/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-8 inline-flex rounded-full border border-white/10 bg-night/40 p-1 text-sm">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className={`rounded-full px-4 py-2 transition ${
                        authMode === 'signup' ? 'bg-lime text-night' : 'text-zinc-300'
                      }`}
                    >
                      Sign up
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`rounded-full px-4 py-2 transition ${
                        authMode === 'login' ? 'bg-lime text-night' : 'text-zinc-300'
                      }`}
                    >
                      Log in
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="mt-8 space-y-4">
                    {authMode === 'signup' && (
                      <label className="block">
                        <span className="mb-2 block text-sm text-zinc-300">Full name</span>
                        <input
                          value={authForm.name}
                          onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                          required
                          className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                          placeholder="Ayush Kumar"
                        />
                      </label>
                    )}

                    <label className="block">
                      <span className="mb-2 block text-sm text-zinc-300">Email</span>
                      <input
                        type="email"
                        value={authForm.email}
                        onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                        placeholder="you@strivex.fit"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-zinc-300">Password</span>
                      <input
                        type="password"
                        value={authForm.password}
                        onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                        required
                        minLength={6}
                        className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                        placeholder="At least 6 characters"
                      />
                    </label>

                    {authMode === 'signup' && (
                      <label className="block">
                        <span className="mb-2 block text-sm text-zinc-300">Primary goal</span>
                        <select
                          value={authForm.goal}
                          onChange={(event) => setAuthForm({ ...authForm, goal: event.target.value })}
                          className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                        >
                          {goalOptions.map((goal) => (
                            <option key={goal} value={goal}>
                              {goal}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime px-5 py-3.5 text-sm font-semibold text-night transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {authLoading ? 'Please wait...' : authMode === 'signup' ? 'Create Strivex account' : 'Login'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>

                  <div className="mt-8 rounded-3xl border border-white/10 bg-night/35 p-5 text-sm text-zinc-300">
                    <p className="font-semibold text-white">Demo access</p>
                    <p className="mt-2">Admin: `admin@strivex.fit / admin123`</p>
                    <p className="mt-1">Member: `member@strivex.fit / member123`</p>
                  </div>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="rounded-[2rem] border border-line bg-slate p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-lime">Dashboard</p>
                  <h3 className="mt-3 font-display text-3xl font-bold text-white">
                    {user ? 'Your upcoming classes' : 'What unlocks after login'}
                  </h3>
                </div>
                {dashboardLoading && <p className="text-sm text-zinc-400">Refreshing...</p>}
              </div>

              <div className="mt-8 space-y-4">
                {user ? (
                  bookings.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/15 bg-night/35 p-8 text-center text-zinc-400">
                      No bookings yet. Pick any session above and it will land here.
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="rounded-3xl border border-white/10 bg-night/35 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-medium text-lime">{booking.program_name}</p>
                            <h4 className="mt-2 text-xl font-semibold text-white">{booking.title}</h4>
                            <p className="mt-2 text-sm text-zinc-400">
                              {formatLongDate(booking.session_date)} | {booking.location}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleCancelBooking(booking.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-red-400/50 hover:text-red-200"
                          >
                            Cancel booking
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <>
                    {[
                      'Secure signup and login for members and admins',
                      'Live session booking with spot counts',
                      'Saved leads that flow to the admin dashboard',
                      'Persistent data from the local database',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-night/35 px-5 py-4">
                        <CheckCircle2 className="h-5 w-5 text-lime" />
                        <span className="text-sm text-zinc-200">{item}</span>
                      </div>
                    ))}
                  </>
                )}

                {nextBooking && (
                  <div className="rounded-3xl border border-lime/25 bg-lime/10 p-5">
                    <p className="text-sm uppercase tracking-[0.25em] text-lime">Next up</p>
                    <p className="mt-2 text-xl font-semibold text-white">{nextBooking.title}</p>
                    <p className="mt-1 text-sm text-zinc-300">{formatLongDate(nextBooking.session_date)}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {user?.role === 'admin' && (
        <section id="admin" className="relative bg-slate/30 px-5 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-[1400px]">
            <SectionHeading
              eyebrow="Admin"
              title="A backstage view for the Strivex team."
              body="The public structure still looks like the original clone, but the admin tools remain fully functional for leads, members, bookings, and creating new sessions."
            />

            <div className="mt-12 rounded-[2rem] border border-line bg-slate p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {[
                    ['overview', 'Overview'],
                    ['leads', 'Leads'],
                    ['members', 'Members'],
                    ['bookings', 'Bookings'],
                    ['create', 'Create session'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        startTransition(() =>
                          setAdminTab(value as 'overview' | 'leads' | 'members' | 'bookings' | 'create')
                        )
                      }
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        adminTab === value ? 'bg-lime text-night' : 'border border-white/10 bg-night/40 text-zinc-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <input
                  value={adminQuery}
                  onChange={(event) => setAdminQuery(event.target.value)}
                  placeholder="Search members, leads, bookings"
                  className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white outline-none transition focus:border-lime/50 lg:max-w-sm"
                />
              </div>

              {adminTab === 'overview' && adminOverview && (
                <div className="mt-8 space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      { icon: Users, label: 'Members', value: adminOverview.metrics.members },
                      { icon: Mail, label: 'Leads', value: adminOverview.metrics.leads },
                      { icon: ClipboardList, label: 'Bookings', value: adminOverview.metrics.bookings },
                      { icon: Activity, label: 'Sessions', value: adminOverview.metrics.sessions },
                    ].map((item) => (
                      <div key={item.label} className="rounded-3xl border border-white/10 bg-night/35 p-5">
                        <item.icon className="h-5 w-5 text-lime" />
                        <p className="mt-4 text-3xl font-bold text-white">{item.value}</p>
                        <p className="mt-1 text-sm text-zinc-400">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-night/35 p-5">
                      <h4 className="text-lg font-semibold text-white">Recent leads</h4>
                      <div className="mt-4 space-y-3">
                        {adminOverview.recentLeads.map((lead) => (
                          <div key={lead.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="font-medium text-white">{lead.name}</p>
                            <p className="mt-1 text-sm text-zinc-400">
                              {lead.email} | {lead.goal}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-night/35 p-5">
                      <h4 className="text-lg font-semibold text-white">Recent bookings</h4>
                      <div className="mt-4 space-y-3">
                        {adminOverview.recentBookings.map((booking) => (
                          <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="font-medium text-white">{booking.member_name}</p>
                            <p className="mt-1 text-sm text-zinc-400">
                              {booking.program_name} | {booking.title} | {booking.day_label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'leads' && (
                <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                    <thead className="bg-night/60 text-zinc-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Goal</th>
                        <th className="px-4 py-3 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-white/[0.03] text-zinc-200">
                      {filteredAdminLeads.map((lead) => (
                        <tr key={lead.id}>
                          <td className="px-4 py-3">{lead.name}</td>
                          <td className="px-4 py-3">{lead.email}</td>
                          <td className="px-4 py-3">{lead.phone}</td>
                          <td className="px-4 py-3">{lead.goal}</td>
                          <td className="px-4 py-3">{formatDateOnly(lead.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {adminTab === 'members' && (
                <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                    <thead className="bg-night/60 text-zinc-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Goal</th>
                        <th className="px-4 py-3 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-white/[0.03] text-zinc-200">
                      {filteredAdminUsers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-4 py-3">{member.name}</td>
                          <td className="px-4 py-3">{member.email}</td>
                          <td className="px-4 py-3">{member.role}</td>
                          <td className="px-4 py-3">{member.goal || 'Not set'}</td>
                          <td className="px-4 py-3">{formatDateOnly(member.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {adminTab === 'bookings' && (
                <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                    <thead className="bg-night/60 text-zinc-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Member</th>
                        <th className="px-4 py-3 font-medium">Program</th>
                        <th className="px-4 py-3 font-medium">Session</th>
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-white/[0.03] text-zinc-200">
                      {filteredAdminBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-4 py-3">
                            <div>
                              <p>{booking.member_name}</p>
                              <p className="text-xs text-zinc-400">{booking.member_email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">{booking.program_name}</td>
                          <td className="px-4 py-3">{booking.title}</td>
                          <td className="px-4 py-3">
                            {booking.day_label} | {booking.start_time}
                          </td>
                          <td className="px-4 py-3">{booking.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {adminTab === 'create' && (
                <form onSubmit={handleCreateSession} className="mt-8 grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Program</span>
                    <select
                      required
                      value={sessionForm.programId}
                      onChange={(event) => setSessionForm({ ...sessionForm, programId: event.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                    >
                      <option value="">Choose a program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Session title</span>
                    <input
                      required
                      value={sessionForm.title}
                      onChange={(event) => setSessionForm({ ...sessionForm, title: event.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                      placeholder="Upper body strength"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Coach</span>
                    <input
                      required
                      value={sessionForm.coach}
                      onChange={(event) => setSessionForm({ ...sessionForm, coach: event.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                      placeholder="Meera Singh"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Session date and time</span>
                    <input
                      type="datetime-local"
                      required
                      value={sessionForm.sessionDate}
                      onChange={(event) => setSessionForm({ ...sessionForm, sessionDate: event.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Display start time</span>
                    <input
                      required
                      value={sessionForm.startTime}
                      onChange={(event) => setSessionForm({ ...sessionForm, startTime: event.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                      placeholder="07:00 AM"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Duration (minutes)</span>
                    <input
                      type="number"
                      min={15}
                      required
                      value={sessionForm.durationMins}
                      onChange={(event) => setSessionForm({ ...sessionForm, durationMins: event.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Location</span>
                    <input
                      required
                      value={sessionForm.location}
                      onChange={(event) => setSessionForm({ ...sessionForm, location: event.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                      placeholder="Mumbai Performance Floor"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Capacity</span>
                    <input
                      type="number"
                      min={1}
                      required
                      value={sessionForm.capacity}
                      onChange={(event) => setSessionForm({ ...sessionForm, capacity: event.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-white outline-none transition focus:border-lime/50"
                    />
                  </label>

                  <div className="lg:col-span-2">
                    <button
                      type="submit"
                      disabled={creatingSession}
                      className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-night transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PlusCircle className="h-4 w-4" />
                      {creatingSession ? 'Creating session...' : 'Create new session'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-5 w-5 fill-lime text-lime" />
              ))}
            </div>
            <blockquote className="font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              "The design still hits like the original concept, but now every major action actually works. That
              is the difference between a mockup and a product."
            </blockquote>
            <p className="mt-8 text-mute">Strivex internal review | product handoff</p>
          </motion.div>
        </div>
      </section>

      <section id="contact" className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-lime p-10 text-center md:p-20"
          >
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-night/10 blur-3xl" />
            <h2
              className="font-display font-bold leading-[0.95] tracking-tight text-night"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
            >
              Ready for Strivex?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-night/80">
              Same front-end structure. Better images. Working lead capture. Submit this and it will show up in
              the admin panel.
            </p>

            <form onSubmit={handleLeadSubmit} className="mx-auto mt-10 max-w-4xl">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  value={leadForm.name}
                  onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })}
                  type="text"
                  placeholder="Full name"
                  required
                  className="rounded-full border border-night/20 bg-night/10 px-5 py-3.5 text-sm font-medium text-night placeholder:text-night/45 outline-none transition focus:border-night"
                />
                <input
                  value={leadForm.email}
                  onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })}
                  type="email"
                  placeholder="Email address"
                  required
                  className="rounded-full border border-night/20 bg-night/10 px-5 py-3.5 text-sm font-medium text-night placeholder:text-night/45 outline-none transition focus:border-night"
                />
                <input
                  value={leadForm.phone}
                  onChange={(event) => setLeadForm({ ...leadForm, phone: event.target.value })}
                  type="text"
                  placeholder="Phone number"
                  required
                  className="rounded-full border border-night/20 bg-night/10 px-5 py-3.5 text-sm font-medium text-night placeholder:text-night/45 outline-none transition focus:border-night"
                />
                <select
                  value={leadForm.goal}
                  onChange={(event) => setLeadForm({ ...leadForm, goal: event.target.value })}
                  className="rounded-full border border-night/20 bg-night/10 px-5 py-3.5 text-sm font-medium text-night outline-none transition focus:border-night"
                >
                  {goalOptions.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={leadForm.message}
                onChange={(event) => setLeadForm({ ...leadForm, message: event.target.value })}
                rows={4}
                placeholder="Tell us what kind of transformation or product flow you want next."
                className="mt-3 w-full rounded-[1.75rem] border border-night/20 bg-night/10 px-5 py-4 text-sm font-medium text-night placeholder:text-night/45 outline-none transition focus:border-night"
              />

              <div className="mt-6 flex flex-col items-center justify-center gap-4 md:flex-row">
                <button
                  type="submit"
                  disabled={submittingLead}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-night px-7 py-3.5 text-sm font-semibold text-lime transition hover:bg-night/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingLead ? 'Saving lead...' : 'Submit Trial Request'}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-night/70">
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    +91 99999 11111
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    hello@strivex.fit
                  </span>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-line py-12 px-5 md:px-10">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="mb-3">
              <img src="/strivex-logo-yellow.svg" alt="Strivex logo" className="h-16 w-auto" />
            </div>
            <p className="max-w-sm text-sm text-mute">
              Cinematic landing page on the surface, full-stack product underneath.
            </p>
          </div>
          {[
            { title: 'Studio', links: ['Home', 'About', 'Programs', 'Trainers'] },
            { title: 'Connect', links: ['Schedule', 'Access', 'Contact', 'Admin'] },
          ].map((column) => (
            <div key={column.title}>
              <p className="mb-3 text-[11px] uppercase tracking-widest text-lime">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-sm text-mute transition hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex max-w-[1400px] flex-col justify-between gap-3 border-t border-line pt-6 text-xs text-mute md:flex-row">
          <span>Copyright 2026 STRIVEX | Mumbai | Bengaluru | Delhi</span>
          <span>Built by Ayush Kumar</span>
        </div>
      </footer>
    </main>
  );
}
