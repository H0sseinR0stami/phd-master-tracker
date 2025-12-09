# 🎓 PhD & Masters Application Tracker v4.3

A comprehensive web application for managing PhD professor contacts and Masters program applications with smart reminder system.

## ✨ Features

### 📚 **PhD Contact Management**
- Add and track professor contacts at universities worldwide
- Store research focus, email, and department information
- Save professor webpages, Google Scholar profiles, and faculty pages
- Track follow-up reminders with intelligent notification system
- Monitor response status: No Reply, Replied, Positive Response, Interview, Rejected

### 🎯 **Masters Application Tracking**
- Manage multiple Masters program applications
- Track application deadlines and program details
- Store application portal links and credentials
- Monitor missing documents and requirements
- Set priority levels (High, Medium, Low)
- Support for various application routes (Direct, Uni-Assist, Coalition, Common App)
- Language test requirements (IELTS, TOEFL, PTE, Duolingo, DSH)

### 🔔 **Smart Reminders**
- **PhD**: Shows reminders 1 day before through 30 days after reminder date
- **Masters**: Shows only during application window when status is "Pending"
- Intelligent urgency badges with countdown
- Sortable by deadline, urgency, type, or country

### 📊 **Dashboard Statistics**
- Total applications count
- Pending Masters programs
- No-reply PhD contacts
- Applied Masters programs
- Active reminders counter

### 🔐 **User Authentication**
- Secure registration and login
- Individual user profiles
- Data isolation per user

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

```bash
# Extract the project
unzip phd-masters-tracker-v4.3.zip
cd phd-masters-tracker-v4.3

# Install dependencies
npm install

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

---

## 📋 Project Structure

```
phd-masters-tracker-v4.3/
├── server.js                 # Express.js backend server
├── package.json              # Node.js dependencies
└── public/
    └── index.html            # Frontend (HTML/CSS/JavaScript)
```

---

## 🔧 Technology Stack

### Backend
- **Express.js** - REST API server
- **postgresql** - Local database
- **Node.js** - JavaScript runtime

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with custom design system
- **Vanilla JavaScript** - No frameworks, pure JS

### Authentication
- SHA-256 password hashing
- Session storage via localStorage

---

## 📖 API Endpoints

### Authentication
```
POST /api/auth/register     - Create new user account
POST /api/auth/login        - Login to existing account
```

### PhD Contacts
```
GET    /api/phd-contacts?user_id=X        - Get all PhD contacts
POST   /api/phd-contacts                  - Add new PhD contact
PUT    /api/phd-contacts/:id              - Update PhD contact
DELETE /api/phd-contacts/:id              - Delete PhD contact
```

### Masters Applications
```
GET    /api/masters-apps?user_id=X        - Get all Masters apps
POST   /api/masters-apps                  - Add new Masters app
PUT    /api/masters-apps/:id              - Update Masters app
DELETE /api/masters-apps/:id              - Delete Masters app
```

---

## 💡 Smart Reminder Logic

### PhD Reminders
Shows reminder **1 day before through 30 days after** the reminder date.

```javascript
// Example: Reminder Date = Dec 26, 2025
Dec 25 → 🚨 TOMORROW (shows)
Dec 26 → 🚨 TODAY (shows)
Dec 27 → 🚨 1 days OVERDUE (shows)
...
Jan 25 → 🚨 30 days OVERDUE (shows)
Jan 26 → ❌ HIDDEN
```

**Status Requirements**: Only shows PhD contacts with "no-reply" status

### Masters Reminders
Shows reminder **when in application window** AND status is **"Pending"**.

```javascript
// Example: Deadline = Dec 12, 2025
Dec 09 → 🚨 3 days left (URGENT - red)
Dec 10 → 🚨 2 days left (URGENT - red)
Dec 11 → 🚨 1 days left (URGENT - red)
Dec 12 → 🚨 DEADLINE TODAY (URGENT - red)
Dec 13 → 🚨 PASSED DEADLINE (URGENT - red)
```

**Status Requirements**: Only shows Masters apps with "pending" status AND within application window

---

## 🎨 Design Features

### Color Scheme
- **Primary**: Teal (#208096)
- **Error**: Red (#c0152f)
- **Warning**: Orange (#a84b2f)
- **Success**: Teal (#208096)

### Responsive Design
- Mobile-friendly interface
- Adapts to tablet and desktop screens
- Flexible grid layouts

### Status Badges
- **No Reply**: Gray badge
- **Replied**: Blue badge
- **Positive**: Green badge
- **Interview**: Orange badge
- **Rejected**: Red badge
- **Pending**: Gray badge
- **Applied**: Blue badge
- **Accepted**: Green badge

---

## 📱 User Guide

### Adding a PhD Contact
1. Click **"➕ Add PhD"** tab
2. Fill in professor details (name, university, email, research)
3. Set follow-up reminder date
4. Click **"Add PhD Contact"**
5. Contact appears in reminders when active

### Adding a Masters Application
1. Click **"➕ Add Masters"** tab
2. Enter university, program, and country
3. Set application start and deadline dates
4. Fill optional fields (fees, language test, portal link)
5. Click **"Add Masters Program"**
6. Application shows in reminders if pending and in window

### Managing Reminders
1. Click **"🔔 Reminders"** tab
2. View all active reminders sorted by deadline
3. Click **"✏️ Edit"** to modify
4. Click **"🗑️ Delete"** to remove

### Filtering & Searching
- Search by university, professor, or program name
- Filter by country
- Filter by status or priority
- Sort reminders by deadline, urgency, type, or country

---

## 🔒 Security Notes

- Passwords are hashed using SHA-256
- Data stored locally in SQLite database
- No cloud storage - all data remains on your device
- Each user has isolated data

⚠️ **Note**: For production use, implement stronger encryption and use a production database.

---

## 🛠️ Development

### Database Schema

**users**
- id (PRIMARY KEY)
- name, email, password, phone
- created_at

**phd_contacts**
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- professor_name, prof_degree, university, country
- department, email, research_focus
- prof_webpage, prof_google_scholar, faculty_page
- email_sent_date, follow_up_date
- status, notes
- created_at

**masters_apps**
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- country, university, major
- admission_fee, tuition_fee
- gre_needed, language_test, application_route
- start_date, end_date
- course_link, portal_link
- account_created, priority
- application_status
- missing_documents, username, password
- notes
- created_at

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in server.js:
app.listen(3001, () => {...})  # Use 3001 instead
```

### Database Issues
Delete `tracker.db` to reset:
```bash
rm tracker.db
npm start  # Creates fresh database
```

### Reminders Not Showing
- Check reminder date is in correct format (YYYY-MM-DD)
- PhD: Verify status is "no-reply"
- Masters: Verify status is "pending" AND within application window
- Click "🔄 Refresh" button in reminders tab

---

## 📝 Features Roadmap

- [ ] Email notifications for active reminders
- [ ] Export data as CSV/PDF
- [ ] Calendar view integration
- [ ] Bulk import from spreadsheet
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Cloud backup option
- [ ] Mobile app

---

## 📄 License

This project is open source and available for personal use.

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the smart reminder logic documentation
3. Verify all date formats are YYYY-MM-DD

---

## 💬 Version History

### v4.3 (Current)
- ✅ Smart reminder system with 1 day before + 30 days after
- ✅ Masters reminders show days left until deadline
- ✅ PhD reminders show days overdue
- ✅ User authentication system
- ✅ Complete CRUD operations
- ✅ Advanced filtering and search
- ✅ Dashboard statistics
- ✅ Responsive design

---

**Built with ❤️ for graduate students managing multiple applications**

🎓 Good luck with your PhD and Masters applications! 📚


