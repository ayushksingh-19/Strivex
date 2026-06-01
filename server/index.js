import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { getDatabase, initializeDatabase } from './db.js';

dotenv.config();

initializeDatabase();

const db = getDatabase();
const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || 'strivex-local-dev-secret';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

app.use(
  cors({
    origin: true,
    credentials: false,
  })
);
app.use(express.json());

function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    goal: user.goal,
    createdAt: user.created_at,
  };
}

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  return next();
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    app: 'Strivex API',
    seededAccounts: {
      admin: 'admin@strivex.fit / admin123',
      member: 'member@strivex.fit / member123',
    },
  });
});

app.get('/api/programs', (_req, res) => {
  const programs = db.prepare('SELECT * FROM programs ORDER BY id').all();
  res.json(programs);
});

app.get('/api/sessions', (_req, res) => {
  const sessions = db
    .prepare(`
      SELECT
        sessions.*,
        programs.name AS program_name,
        programs.slug AS program_slug,
        programs.tagline AS program_tagline
      FROM sessions
      JOIN programs ON programs.id = sessions.program_id
      ORDER BY session_date ASC
    `)
    .all();

  res.json(sessions);
});

app.post('/api/leads', (req, res) => {
  const { name, email, phone, goal, message = '' } = req.body ?? {};

  if (!name || !email || !phone || !goal) {
    return res.status(400).json({ message: 'Name, email, phone, and goal are required.' });
  }

  const result = db
    .prepare(
      `
      INSERT INTO leads (name, email, phone, goal, message)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .run(name.trim(), email.trim().toLowerCase(), phone.trim(), goal.trim(), message.trim());

  return res.status(201).json({
    id: result.lastInsertRowid,
    message: 'Lead captured successfully.',
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, goal = '' } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);

  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `
      INSERT INTO users (name, email, password_hash, role, goal)
      VALUES (?, ?, ?, 'member', ?)
    `
    )
    .run(name.trim(), normalizedEmail, passwordHash, goal.trim());

  const user = getUserById(result.lastInsertRowid);
  const token = issueToken(user);

  return res.status(201).json({ token, user: serializeUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = issueToken(user);
  return res.json({ token, user: serializeUser(user) });
});

app.get('/api/auth/me', authRequired, (req, res) => {
  const user = getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User no longer exists.' });
  }

  return res.json(serializeUser(user));
});

app.get('/api/bookings/me', authRequired, (req, res) => {
  const bookings = db
    .prepare(
      `
      SELECT
        bookings.id,
        bookings.status,
        bookings.notes,
        bookings.created_at,
        sessions.title,
        sessions.coach,
        sessions.day_label,
        sessions.session_date,
        sessions.start_time,
        sessions.location,
        programs.name AS program_name
      FROM bookings
      JOIN sessions ON sessions.id = bookings.session_id
      JOIN programs ON programs.id = sessions.program_id
      WHERE bookings.user_id = ?
      ORDER BY sessions.session_date ASC
    `
    )
    .all(req.user.id);

  return res.json(bookings);
});

app.post('/api/bookings', authRequired, (req, res) => {
  const { sessionId, notes = '' } = req.body ?? {};

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required.' });
  }

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

  if (!session) {
    return res.status(404).json({ message: 'Session not found.' });
  }

  if (session.spots_remaining <= 0) {
    return res.status(409).json({ message: 'This session is fully booked.' });
  }

  const existing = db
    .prepare('SELECT id FROM bookings WHERE user_id = ? AND session_id = ?')
    .get(req.user.id, sessionId);

  if (existing) {
    return res.status(409).json({ message: 'You already booked this session.' });
  }

  const createBooking = db.transaction(() => {
    const result = db
      .prepare('INSERT INTO bookings (user_id, session_id, notes) VALUES (?, ?, ?)')
      .run(req.user.id, sessionId, notes.trim());

    db.prepare('UPDATE sessions SET spots_remaining = spots_remaining - 1 WHERE id = ?').run(sessionId);
    return result.lastInsertRowid;
  });

  const bookingId = createBooking();
  return res.status(201).json({ id: bookingId, message: 'Session booked successfully.' });
});

app.delete('/api/bookings/:bookingId', authRequired, (req, res) => {
  const bookingId = Number(req.params.bookingId);
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You cannot cancel this booking.' });
  }

  const cancelBooking = db.transaction(() => {
    db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
    db.prepare('UPDATE sessions SET spots_remaining = MIN(capacity, spots_remaining + 1) WHERE id = ?').run(
      booking.session_id
    );
  });

  cancelBooking();
  return res.json({ message: 'Booking cancelled successfully.' });
});

app.get('/api/admin/overview', authRequired, adminRequired, (_req, res) => {
  const [memberCount, leadCount, bookingCount, sessionCount] = [
    db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'member'").get().count,
    db.prepare('SELECT COUNT(*) AS count FROM leads').get().count,
    db.prepare('SELECT COUNT(*) AS count FROM bookings').get().count,
    db.prepare('SELECT COUNT(*) AS count FROM sessions').get().count,
  ];

  const recentLeads = db
    .prepare('SELECT id, name, email, goal, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5')
    .all();
  const recentBookings = db
    .prepare(
      `
      SELECT
        bookings.id,
        users.name AS member_name,
        programs.name AS program_name,
        sessions.title,
        sessions.start_time,
        sessions.day_label
      FROM bookings
      JOIN users ON users.id = bookings.user_id
      JOIN sessions ON sessions.id = bookings.session_id
      JOIN programs ON programs.id = sessions.program_id
      ORDER BY bookings.created_at DESC
      LIMIT 5
    `
    )
    .all();

  return res.json({
    metrics: {
      members: memberCount,
      leads: leadCount,
      bookings: bookingCount,
      sessions: sessionCount,
    },
    recentLeads,
    recentBookings,
  });
});

app.get('/api/admin/leads', authRequired, adminRequired, (_req, res) => {
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  res.json(leads);
});

app.get('/api/admin/users', authRequired, adminRequired, (_req, res) => {
  const users = db
    .prepare('SELECT id, name, email, role, goal, created_at FROM users ORDER BY created_at DESC')
    .all();
  res.json(users);
});

app.get('/api/admin/bookings', authRequired, adminRequired, (_req, res) => {
  const bookings = db
    .prepare(
      `
      SELECT
        bookings.id,
        bookings.status,
        bookings.notes,
        bookings.created_at,
        users.name AS member_name,
        users.email AS member_email,
        programs.name AS program_name,
        sessions.title,
        sessions.day_label,
        sessions.start_time,
        sessions.location
      FROM bookings
      JOIN users ON users.id = bookings.user_id
      JOIN sessions ON sessions.id = bookings.session_id
      JOIN programs ON programs.id = sessions.program_id
      ORDER BY bookings.created_at DESC
    `
    )
    .all();

  res.json(bookings);
});

app.post('/api/admin/sessions', authRequired, adminRequired, (req, res) => {
  const {
    programId,
    title,
    coach,
    sessionDate,
    startTime,
    durationMins,
    location,
    capacity,
  } = req.body ?? {};

  if (!programId || !title || !coach || !sessionDate || !startTime || !durationMins || !location || !capacity) {
    return res.status(400).json({ message: 'All session fields are required.' });
  }

  const date = new Date(sessionDate);

  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ message: 'Session date is invalid.' });
  }

  const dayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);

  const result = db
    .prepare(
      `
      INSERT INTO sessions (
        program_id, title, coach, day_label, session_date, start_time, duration_mins, location, capacity, spots_remaining
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
    .run(
      Number(programId),
      title.trim(),
      coach.trim(),
      dayLabel,
      date.toISOString(),
      startTime.trim(),
      Number(durationMins),
      location.trim(),
      Number(capacity),
      Number(capacity)
    );

  res.status(201).json({ id: result.lastInsertRowid, message: 'Session created successfully.' });
});

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    return next();
  }

  return res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Strivex API running on http://localhost:${port}`);
});
