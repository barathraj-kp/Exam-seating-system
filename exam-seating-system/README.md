# 🎓 Exam Hall Seating Arrangement System

A full-stack web application for managing exam hall seating arrangements with auto-seat generation, visual hall grid view, and student seat search.

---

## 🛠️ Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Frontend    | React.js, CSS3, HTML5   |
| Backend     | Node.js, Express.js     |
| Database    | MySQL                   |
| HTTP Client | Axios                   |

---

## ✨ Features

- **Dashboard** — Overview stats, recent exams, quick-start guide
- **Exam Management** — Schedule exams with date, time, subject, department
- **Hall Management** — Configure halls with rows/columns, visual preview
- **Student Management** — Add/edit/delete students with roll numbers, dept, semester
- **Department Management** — Manage academic departments
- **Auto Seating Generation** — Assign seats automatically (sequential or random)
- **Visual Hall Grid** — See real-time seat layout with student details
- **Table View** — Detailed tabular seating list
- **Find My Seat** — Students can search their seat by roll number
- **Multi-Hall Support** — Assign students across multiple halls in one operation

---

## 📁 Project Structure

```
exam-seating-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # MySQL pool connection
│   │   │   ├── schema.sql      # Database schema + sample data
│   │   │   └── setupDb.js      # DB initialization script
│   │   ├── routes/
│   │   │   ├── departments.js
│   │   │   ├── halls.js
│   │   │   ├── students.js
│   │   │   ├── exams.js
│   │   │   └── seating.js      # Core seating logic
│   │   └── server.js           # Express app entry point
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Exams.js
│   │   │   ├── Students.js
│   │   │   ├── Halls.js
│   │   │   ├── Departments.js
│   │   │   ├── Seating.js      # Visual hall grid + generation
│   │   │   └── SearchSeat.js   # Student seat finder
│   │   ├── services/
│   │   │   └── api.js          # Axios API calls
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── package.json                # Root scripts
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js v16+
- MySQL 8.0+
- npm

### 2. Clone & Install

```bash
# Install all dependencies
cd exam-seating-system
npm run install-all
```

### 3. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=exam_seating_db
```

### 4. Setup Database

```bash
# Initialize DB and insert sample data
npm run setup-db
```

Or manually run:
```bash
mysql -u root -p < backend/src/config/schema.sql
```

### 5. Start the Application

**Backend** (Terminal 1):
```bash
cd backend
npm start
# Server: http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm start
# App: http://localhost:3000
```

Or run both together from root:
```bash
npm install -g concurrently
npm run dev
```

---

## 🌐 API Endpoints

### Departments
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/departments | Get all departments |
| POST | /api/departments | Create department |
| DELETE | /api/departments/:id | Delete department |

### Halls
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/halls | Get all halls |
| POST | /api/halls | Create hall |
| PUT | /api/halls/:id | Update hall |
| DELETE | /api/halls/:id | Delete hall |

### Students
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/students | Get all students (filterable) |
| POST | /api/students | Add student |
| PUT | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |

### Exams
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/exams | Get all exams |
| POST | /api/exams | Create exam |
| PUT | /api/exams/:id | Update exam |
| DELETE | /api/exams/:id | Delete exam |

### Seating
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/seating/exam/:id | Get seating for exam |
| POST | /api/seating/generate | Auto-generate seating |
| POST | /api/seating/assign | Manually assign seat |
| DELETE | /api/seating/exam/:id | Clear seating |
| GET | /api/seating/search | Search by roll number |

---

## 🔄 Usage Workflow

1. **Add Departments** → CSE, ECE, MECH, etc.
2. **Add Exam Halls** → Configure rows & columns
3. **Add Students** → With roll numbers, dept, semester
4. **Schedule Exam** → Name, subject, date, time
5. **Generate Seating** → Select halls, filter students, choose arrangement type
6. **View Results** → Grid or table view
7. **Students Search** → Find seat by roll number

---

## 📊 Database Schema

```
departments     → id, name, code
halls           → id, name, building, floor, rows, cols, capacity
students        → id, name, roll_number, department_id, semester, section, email
exams           → id, exam_name, subject, exam_date, start_time, end_time, department_id, semester
seating_arrangements → id, exam_id, hall_id, student_id, seat_row, seat_col, seat_number
```
