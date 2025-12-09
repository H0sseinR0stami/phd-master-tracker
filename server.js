require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // PhD Contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS phd_contacts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        professor_name TEXT NOT NULL,
        prof_degree TEXT,
        university TEXT NOT NULL,
        country TEXT NOT NULL,
        department TEXT,
        email TEXT NOT NULL,
        research_focus TEXT NOT NULL,
        prof_webpage TEXT,
        prof_google_scholar TEXT,
        faculty_page TEXT,
        email_sent_date TEXT,
        follow_up_date TEXT NOT NULL,
        status TEXT DEFAULT 'no-reply',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Masters Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS masters_apps (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        country TEXT NOT NULL,
        university TEXT NOT NULL,
        major TEXT NOT NULL,
        admission_fee DECIMAL(10, 2),
        tuition_fee DECIMAL(10, 2),
        gre_needed TEXT,
        language_test TEXT,
        application_route TEXT,
        start_date TEXT,
        end_date TEXT NOT NULL,
        course_link TEXT,
        portal_link TEXT,
        account_created INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        application_status TEXT DEFAULT 'pending',
        missing_documents TEXT,
        username TEXT,
        password TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Initialize on startup
initializeDatabase();

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email, hashedPassword, phone]
    );

    res.json({
      user: result.rows[0],
      success: true
    });
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      res.json({ error: 'Email already exists' });
    } else {
      res.json({ error: err.message });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1 AND password = $2',
      [email, hashedPassword]
    );

    if (result.rows.length === 0) {
      return res.json({ error: 'Invalid email or password' });
    }

    res.json({
      user: result.rows[0],
      success: true
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ==================== PhD CONTACTS ROUTES ====================

app.get('/api/phd-contacts', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const result = await pool.query(
      'SELECT * FROM phd_contacts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.post('/api/phd-contacts', async (req, res) => {
  try {
    const {
      user_id, professor_name, prof_degree, university, country, department,
      email, research_focus, prof_webpage, prof_google_scholar, faculty_page,
      email_sent_date, follow_up_date, status, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO phd_contacts (
        user_id, professor_name, prof_degree, university, country, department,
        email, research_focus, prof_webpage, prof_google_scholar, faculty_page,
        email_sent_date, follow_up_date, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id`,
      [
        user_id, professor_name, prof_degree, university, country, department,
        email, research_focus, prof_webpage, prof_google_scholar, faculty_page,
        email_sent_date, follow_up_date, status, notes
      ]
    );

    res.json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.put('/api/phd-contacts/:id', async (req, res) => {
  try {
    const {
      professor_name, prof_degree, university, country, department,
      email, research_focus, prof_webpage, prof_google_scholar, faculty_page,
      email_sent_date, follow_up_date, status, notes
    } = req.body;

    await pool.query(
      `UPDATE phd_contacts SET
        professor_name=$1, prof_degree=$2, university=$3, country=$4, department=$5,
        email=$6, research_focus=$7, prof_webpage=$8, prof_google_scholar=$9,
        faculty_page=$10, email_sent_date=$11, follow_up_date=$12, status=$13, notes=$14
      WHERE id=$15`,
      [
        professor_name, prof_degree, university, country, department,
        email, research_focus, prof_webpage, prof_google_scholar, faculty_page,
        email_sent_date, follow_up_date, status, notes, req.params.id
      ]
    );

    res.json({ updated: true, success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.delete('/api/phd-contacts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM phd_contacts WHERE id = $1', [req.params.id]);
    res.json({ deleted: true, success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ==================== MASTERS APPLICATIONS ROUTES ====================

app.get('/api/masters-apps', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const result = await pool.query(
      'SELECT * FROM masters_apps WHERE user_id = $1 ORDER BY end_date ASC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.post('/api/masters-apps', async (req, res) => {
  try {
    const {
      user_id, country, university, major, admission_fee, tuition_fee,
      gre_needed, language_test, application_route, start_date, end_date,
      course_link, portal_link, account_created, priority, application_status,
      missing_documents, username, password, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO masters_apps (
        user_id, country, university, major, admission_fee, tuition_fee,
        gre_needed, language_test, application_route, start_date, end_date,
        course_link, portal_link, account_created, priority, application_status,
        missing_documents, username, password, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id`,
      [
        user_id, country, university, major, admission_fee, tuition_fee,
        gre_needed, language_test, application_route, start_date, end_date,
        course_link, portal_link, account_created, priority, application_status,
        missing_documents, username, password, notes
      ]
    );

    res.json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.put('/api/masters-apps/:id', async (req, res) => {
  try {
    const {
      country, university, major, admission_fee, tuition_fee,
      gre_needed, language_test, application_route, start_date, end_date,
      course_link, portal_link, account_created, priority, application_status,
      missing_documents, username, password, notes
    } = req.body;

    await pool.query(
      `UPDATE masters_apps SET
        country=$1, university=$2, major=$3, admission_fee=$4, tuition_fee=$5,
        gre_needed=$6, language_test=$7, application_route=$8, start_date=$9,
        end_date=$10, course_link=$11, portal_link=$12, account_created=$13,
        priority=$14, application_status=$15, missing_documents=$16,
        username=$17, password=$18, notes=$19
      WHERE id=$20`,
      [
        country, university, major, admission_fee, tuition_fee,
        gre_needed, language_test, application_route, start_date, end_date,
        course_link, portal_link, account_created, priority, application_status,
        missing_documents, username, password, notes, req.params.id
      ]
    );

    res.json({ updated: true, success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.delete('/api/masters-apps/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM masters_apps WHERE id = $1', [req.params.id]);
    res.json({ deleted: true, success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Start server
const HOST =
  process.env.HOST ||
  process.env.RUNFLARE_URL ||
  `localhost`;

app.listen(PORT, () => {
  console.log(`\n🚀 PhD & Masters Tracker v4.3 FINAL running at http://${HOST}:${PORT}`);
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🔌 Connection: ${process.env.DATABASE_URL ? 'Attempting to connect...' : 'Local dev mode'}`);
});


// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await pool.end();
  process.exit(0);
});