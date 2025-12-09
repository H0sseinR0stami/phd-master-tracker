const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const DB_PATH = path.join(__dirname, 'tracker.db');
const db = new sqlite3.Database(DB_PATH);

function initializeDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS phd_contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS masters_apps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            country TEXT NOT NULL,
            university TEXT NOT NULL,
            major TEXT NOT NULL,
            admission_fee REAL,
            tuition_fee REAL,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
    });
}

initializeDatabase();

// Auth Routes
app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    db.run(`INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`, 
    [name, email, hashedPassword, phone],
    function(err) {
        if (err) {
            return res.json({ error: 'Email already exists' });
        }
        res.json({ 
            user: { 
                id: this.lastID, 
                name, 
                email 
            } 
        });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    db.get(`SELECT * FROM users WHERE email=? AND password=?`, [email, hashedPassword], (err, user) => {
        if (err || !user) {
            return res.json({ error: 'Invalid email or password' });
        }
        res.json({ 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email 
            } 
        });
    });
});

// PhD Routes
app.get('/api/phd-contacts', (req, res) => {
    const userId = req.query.user_id;
    db.all('SELECT * FROM phd_contacts WHERE user_id=? ORDER BY created_at DESC', [userId], (err, rows) => {
        res.json(err ? [] : rows);
    });
});

app.post('/api/phd-contacts', (req, res) => {
    const { user_id, professor_name, prof_degree, university, country, department, email, research_focus, prof_webpage, prof_google_scholar, faculty_page, email_sent_date, follow_up_date, status, notes } = req.body;

    db.run(`INSERT INTO phd_contacts (user_id, professor_name, prof_degree, university, country, department, email, research_focus, prof_webpage, prof_google_scholar, faculty_page, email_sent_date, follow_up_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [user_id, professor_name, prof_degree, university, country, department, email, research_focus, prof_webpage, prof_google_scholar, faculty_page, email_sent_date, follow_up_date, status, notes],
    function(err) {
        res.json(err ? { error: err.message } : { id: this.lastID });
    });
});

app.put('/api/phd-contacts/:id', (req, res) => {
    const { professor_name, prof_degree, university, country, department, email, research_focus, prof_webpage, prof_google_scholar, faculty_page, email_sent_date, follow_up_date, status, notes } = req.body;

    db.run(`UPDATE phd_contacts SET professor_name=?, prof_degree=?, university=?, country=?, department=?, email=?, research_focus=?, prof_webpage=?, prof_google_scholar=?, faculty_page=?, email_sent_date=?, follow_up_date=?, status=?, notes=? WHERE id=?`,
    [professor_name, prof_degree, university, country, department, email, research_focus, prof_webpage, prof_google_scholar, faculty_page, email_sent_date, follow_up_date, status, notes, req.params.id],
    (err) => {
        res.json(err ? { error: err.message } : { updated: true });
    });
});

app.delete('/api/phd-contacts/:id', (req, res) => {
    db.run('DELETE FROM phd_contacts WHERE id=?', [req.params.id], (err) => {
        res.json(err ? { error: err.message } : { deleted: true });
    });
});

// Masters Routes
app.get('/api/masters-apps', (req, res) => {
    const userId = req.query.user_id;
    db.all('SELECT * FROM masters_apps WHERE user_id=? ORDER BY end_date ASC', [userId], (err, rows) => {
        res.json(err ? [] : rows);
    });
});

app.post('/api/masters-apps', (req, res) => {
    const { user_id, country, university, major, admission_fee, tuition_fee, gre_needed, language_test, application_route, start_date, end_date, course_link, portal_link, account_created, priority, application_status, missing_documents, username, password, notes } = req.body;

    db.run(`INSERT INTO masters_apps (user_id, country, university, major, admission_fee, tuition_fee, gre_needed, language_test, application_route, start_date, end_date, course_link, portal_link, account_created, priority, application_status, missing_documents, username, password, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, country, university, major, admission_fee, tuition_fee, gre_needed, language_test, application_route, start_date, end_date, course_link, portal_link, account_created, priority, application_status, missing_documents, username, password, notes],
    function(err) {
        res.json(err ? { error: err.message } : { id: this.lastID });
    });
});

app.put('/api/masters-apps/:id', (req, res) => {
    const { country, university, major, admission_fee, tuition_fee, gre_needed, language_test, application_route, start_date, end_date, course_link, portal_link, account_created, priority, application_status, missing_documents, username, password, notes } = req.body;

    db.run(`UPDATE masters_apps SET country=?, university=?, major=?, admission_fee=?, tuition_fee=?, gre_needed=?, language_test=?, application_route=?, start_date=?, end_date=?, course_link=?, portal_link=?, account_created=?, priority=?, application_status=?, missing_documents=?, username=?, password=?, notes=? WHERE id=?`,
    [country, university, major, admission_fee, tuition_fee, gre_needed, language_test, application_route, start_date, end_date, course_link, portal_link, account_created, priority, application_status, missing_documents, username, password, notes, req.params.id],
    (err) => {
        res.json(err ? { error: err.message } : { updated: true });
    });
});

app.delete('/api/masters-apps/:id', (req, res) => {
    db.run('DELETE FROM masters_apps WHERE id=?', [req.params.id], (err) => {
        res.json(err ? { error: err.message } : { deleted: true });
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 PhD & Masters Tracker v4.3 FINAL running at http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});
