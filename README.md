# Unit 4: E-Learning Web Application (Full-Stack Edition)

A complete full-stack React + Node.js/Express + SQLite E-Learning Web Application implementing all 4 university lab experiments:

1. **Experiment 1 – REST API & Async Data:**
   - Real Express REST endpoints: `GET /api/courses` & `GET /api/courses/:id`.
   - Real-time search by keyword, instructor, and category/difficulty filtering.
   - Dynamic course details, loading spinners, and error & retry recovery states.
2. **Experiment 2 – Redux Toolkit State Management:**
   - Redux Toolkit store with `coursesSlice`, `learningSlice`, and `authSlice`.
   - Custom Action Logger middleware and 60-second caching.
   - State synchronization upon successful server responses.
3. **Experiment 3 – CRUD Operations & Persistence:**
   - `GET /api/enrollments`: Fetch student's enrolled courses and learning history.
   - `POST /api/enrollments`: Enroll student with duplicate enrollment prevention.
   - `GET /api/progress` & `PUT /api/progress/:courseId`: Update learning progress & module completion.
   - `PUT /api/progress/quiz` & `PUT /api/progress/assignment`: Record quiz scores and assignments.
   - Full persistence in a local SQLite database (`backend/elearning.sqlite`).
4. **Experiment 4 – Authentication & Token Management (Login-First Flow):**
   - **Login as First Page:** Unauthenticated visitors opening root URL `/` are immediately presented with the Student Login / Registration view.
   - **Complete Page Protection:** Course Catalog, Learning Dashboard, Experiments Blueprint, and course details are strictly guarded against unauthenticated access.
   - `POST /api/auth/register`: Create new student account with `bcrypt` password hashing and instant login.
   - `POST /api/auth/login`: Issue signed JSON Web Tokens (JWT) verified against SQLite database.
   - `GET /api/auth/me`: Authenticate and fetch logged student profile.
   - `authenticateToken` Express middleware protecting enrollment and learning progress routes.
   - Redirection to Course Catalog upon successful authentication, and redirect to Login upon logout.
   - Automated certificate issuance upon reaching 100% curriculum progress.

---

## 🚀 How to Run the Application (Windows PowerShell)

Open **two separate** Windows PowerShell terminal windows.

### Terminal 1 — Start the Backend Server (Port 5000)
```powershell
cd c:\Users\hp\OneDrive\Desktop\unitt4\backend
npm install
npm start
```
*Backend will start on `http://localhost:5000` and automatically initialize the SQLite database tables and initial course seeds.*

### Terminal 2 — Start the Frontend Client (Port 5173)
```powershell
cd c:\Users\hp\OneDrive\Desktop\unitt4
npm run dev
```
*Frontend will start on `http://localhost:5173`. Open this URL in your web browser.*

---

## 🔑 Demo Student Credentials

The database is automatically pre-seeded with sample student credentials (with passwords hashed using `bcrypt`):

| Student Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Aarav Patel** | `student@college.edu` | `password123` | Student |
| **Rohit Sharma** | `rohit@college.edu` | `password123` | Student |

*You can also click the demo quick-fill buttons on the Student Login page or register new student accounts via `POST /api/auth/register`.*

---

## 📡 Implemented Backend Endpoints

### Health Check
- `GET /api/health` — Backend health & SQLite connectivity status.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account (`bcrypt` hashed).
- `POST /api/auth/login` — Sign in and receive a 24-hour signed JWT.
- `GET /api/auth/me` — Protected profile retrieval using Bearer token.
- `POST /api/auth/logout` — Revoke client session.

### Course Catalog (`/api/courses`)
- `GET /api/courses` — Retrieve courses with optional query parameters (`search`, `category`, `difficulty`).
- `GET /api/courses/:id` — Retrieve single course detail with materials, quizzes, and assignments.

### Enrollments (`/api/enrollments`)
- `GET /api/enrollments` — Protected: Retrieve currently logged student's active enrollments.
- `POST /api/enrollments` — Protected: Enroll in a course (prevents duplicate enrollments).

### Progress & Submissions (`/api/progress`)
- `GET /api/progress` — Protected: Retrieve learning progress records for authenticated user.
- `PUT /api/progress/:courseId` — Protected: Update module completion and progress percentage.
- `PUT /api/progress/quiz` — Protected: Record quiz score and advance course progress.
- `PUT /api/progress/assignment` — Protected: Submit laboratory assignment and advance progress.

---

## 🧪 Build and Test Verification

- **Backend Health Check:** Verified (`HTTP 200 OK`).
- **Database Initialization:** Verified SQLite tables (`users`, `courses`, `enrollments`, `progress`).
- **Authentication & JWT Guard:** Verified (rejects unauthenticated requests with `HTTP 401`).
- **Duplicate Enrollments:** Verified (duplicate enrollment rejected with `HTTP 400`).
- **Frontend Production Build:** Verified (`npm run build` completed with 0 errors).
