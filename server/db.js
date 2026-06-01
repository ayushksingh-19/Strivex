import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const dataDir = path.resolve('data');
const dbPath = path.join(dataDir, 'strivex.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const createFutureDate = (daysAhead, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const formatDate = (date) => date.toISOString();

const formatDay = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      goal TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      intensity TEXT NOT NULL,
      duration TEXT NOT NULL,
      price TEXT NOT NULL,
      coaches TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      coach TEXT NOT NULL,
      day_label TEXT NOT NULL,
      session_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      duration_mins INTEGER NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      spots_remaining INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (program_id) REFERENCES programs (id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, session_id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      goal TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

  if (userCount === 0) {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const memberPassword = bcrypt.hashSync('member123', 10);

    db.prepare(
      `INSERT INTO users (name, email, password_hash, role, goal)
       VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`
    ).run(
      'Strivex Admin',
      'admin@strivex.fit',
      adminPassword,
      'admin',
      'Run the studio',
      'Demo Member',
      'member@strivex.fit',
      memberPassword,
      'member',
      'Build consistency'
    );
  }

  const programCount = db.prepare('SELECT COUNT(*) AS count FROM programs').get().count;

  if (programCount === 0) {
    const insertProgram = db.prepare(`
      INSERT INTO programs (slug, name, tagline, description, intensity, duration, price, coaches)
      VALUES (@slug, @name, @tagline, @description, @intensity, @duration, @price, @coaches)
    `);

    const seedPrograms = [
      {
        slug: 'strength-lab',
        name: 'Strength Lab',
        tagline: 'Progressive overload for serious lifters',
        description:
          'Structured barbell work, accessory blocks, and weekly progression plans for members who want measurable strength gains.',
        intensity: 'Intermediate to advanced',
        duration: '60 min',
        price: 'INR 4,999 / month',
        coaches: 'Arjun Kapoor, Vikram Rao',
      },
      {
        slug: 'ignite-hiit',
        name: 'Ignite HIIT',
        tagline: 'Conditioning without burning out',
        description:
          'High-energy intervals balanced with recovery and mobility so members can improve fitness without sabotaging strength work.',
        intensity: 'All levels',
        duration: '45 min',
        price: 'INR 3,499 / month',
        coaches: 'Meera Singh, Tara Iyer',
      },
      {
        slug: 'mobility-reset',
        name: 'Mobility Reset',
        tagline: 'Move better, recover faster',
        description:
          'Breathing, range-of-motion drills, and recovery-based sessions designed to reduce stiffness and support long-term training.',
        intensity: 'Beginner friendly',
        duration: '50 min',
        price: 'INR 2,999 / month',
        coaches: 'Tara Iyer',
      },
    ];

    const insertMany = db.transaction((programs) => {
      for (const program of programs) {
        insertProgram.run(program);
      }
    });

    insertMany(seedPrograms);
  }

  const sessionCount = db.prepare('SELECT COUNT(*) AS count FROM sessions').get().count;

  if (sessionCount === 0) {
    const programs = db.prepare('SELECT id, slug FROM programs').all();
    const programMap = Object.fromEntries(programs.map((program) => [program.slug, program]));

    const insertSession = db.prepare(`
      INSERT INTO sessions (
        program_id, title, coach, day_label, session_date, start_time, duration_mins, location, capacity, spots_remaining
      )
      VALUES (@program_id, @title, @coach, @day_label, @session_date, @start_time, @duration_mins, @location, @capacity, @spots_remaining)
    `);

    const schedule = [
      {
        program_id: programMap['strength-lab'].id,
        title: 'Lower Body Power',
        coach: 'Arjun Kapoor',
        when: createFutureDate(1, 7, 0),
        start_time: '07:00 AM',
        duration_mins: 60,
        location: 'Mumbai Performance Floor',
        capacity: 16,
      },
      {
        program_id: programMap['strength-lab'].id,
        title: 'Pull Strength Clinic',
        coach: 'Vikram Rao',
        when: createFutureDate(2, 18, 30),
        start_time: '06:30 PM',
        duration_mins: 60,
        location: 'Delhi Iron Bay',
        capacity: 14,
      },
      {
        program_id: programMap['ignite-hiit'].id,
        title: 'Metcon Sprint',
        coach: 'Meera Singh',
        when: createFutureDate(1, 19, 0),
        start_time: '07:00 PM',
        duration_mins: 45,
        location: 'Bengaluru Energy Studio',
        capacity: 20,
      },
      {
        program_id: programMap['ignite-hiit'].id,
        title: 'Saturday Burn',
        coach: 'Meera Singh',
        when: createFutureDate(4, 9, 0),
        start_time: '09:00 AM',
        duration_mins: 45,
        location: 'Mumbai Performance Floor',
        capacity: 24,
      },
      {
        program_id: programMap['mobility-reset'].id,
        title: 'Desk Reset Flow',
        coach: 'Tara Iyer',
        when: createFutureDate(3, 8, 0),
        start_time: '08:00 AM',
        duration_mins: 50,
        location: 'Remote + Studio Hybrid',
        capacity: 30,
      },
      {
        program_id: programMap['mobility-reset'].id,
        title: 'Recovery Lab',
        coach: 'Tara Iyer',
        when: createFutureDate(5, 17, 30),
        start_time: '05:30 PM',
        duration_mins: 50,
        location: 'Delhi Recovery Room',
        capacity: 18,
      },
    ];

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insertSession.run({
          program_id: item.program_id,
          title: item.title,
          coach: item.coach,
          day_label: formatDay(item.when),
          session_date: formatDate(item.when),
          start_time: item.start_time,
          duration_mins: item.duration_mins,
          location: item.location,
          capacity: item.capacity,
          spots_remaining: item.capacity,
        });
      }
    });

    insertMany(schedule);
  }
}

export function getDatabase() {
  return db;
}
