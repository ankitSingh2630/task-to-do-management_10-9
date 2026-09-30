# Task Management Application (MERN Stack)

A clean, responsive, full-stack Task Management application built using the **MERN** stack (**M**ongoDB, **E**xpress.js, **R**eact.js, **N**ode.js).

This project focuses on clean architecture, robust authentication, user data isolation, clear API design, and simple, maintainable React code without unnecessary UI complexity.

---

## 🚀 Key Features

### 1. Authentication & Security
- **User Registration**: Name, Email, Password, and Confirm Password with validation.
- **User Login**: Secure authentication with email and password.
- **Password Security**: Passwords securely hashed with `bcryptjs` (salt rounds: 10).
- **JWT Authorization**: Stateless JSON Web Token authentication on protected routes.
- **User Isolation**: Users can **only** access, view, update, and delete their own tasks. Cross-user access is strictly forbidden (403 Forbidden).

### 2. Task Management
- **Fields**:
  - `Title` (Required, max 120 chars)
  - `Description` (Optional, formatted text)
  - `Status` (`Pending` | `In Progress` | `Completed`)
  - `Priority` (`Low` | `Medium` | `High`)
  - `Due Date` (Optional Date selector)
  - `Created Date` (`createdAt` timestamp)
  - `Updated Date` (`updatedAt` timestamp)
- **Operations**:
  - Create new tasks with validation
  - View task list with visual status and priority badges
  - Edit existing tasks via modal
  - Quick-toggle status and priority directly from the card
  - Delete task with **confirmation dialog** before destructive actions

### 3. Filtering, Search & Sorting
- Filter tasks by **Status** (`Pending`, `In Progress`, `Completed`)
- Filter tasks by **Priority** (`Low`, `Medium`, `High`)
- **Search** by task title (case-insensitive)
- **Sort** by Date Created, Due Date, Priority, or Title (Ascending / Descending)
- Live summary counters (Total, Pending, In Progress, Completed)

### 4. UI/UX Principles
- Built with standard, idiomatic React (`useState`, `useEffect`, `useContext`) and pure CSS.
- **Responsive design** across mobile, tablet, and desktop screens.
- **Loading states** with visual spinners during async operations.
- **User-friendly error and success alerts** with dismiss controls.
- **Empty states** handled cleanly when no tasks exist or no search results match.

---

## 📁 Project Structure

```
Assignment1/
├── README.md                  # Project documentation
│
├── server/                    # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── authController.js # Register, login, logout, getMe
│   │   │   └── taskController.js # CRUD, filtering, sorting, isolation
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # JWT verification
│   │   │   └── errorMiddleware.js# 404 and centralized error handler
│   │   ├── models/
│   │   │   ├── User.js        # User schema with bcrypt hooks
│   │   │   └── Task.js        # Task schema with user ref & indexes
│   │   ├── routes/
│   │   │   ├── authRoutes.js  # /api/auth routes
│   │   │   └── taskRoutes.js  # /api/tasks routes
│   │   └── server.js          # Express app entry point
│   ├── .env                   # Environment variables
│   ├── .env.example           # Example environment template
│   ├── package.json           # Server dependencies
│   └── test-api.js            # Automated end-to-end API test script
│
└── client/                    # React (Vite) Frontend
    ├── src/
    │   ├── api/ or services/
    │   │   └── api.js         # Native fetch API wrapper with token handling
    │   ├── context/
    │   │   └── AuthContext.jsx# React Context for user auth state
    │   ├── components/
    │   │   ├── Navbar.jsx     # Header with user greeting & logout
    │   │   ├── TaskCard.jsx   # Individual task card with controls
    │   │   ├── TaskFilters.jsx# Status, priority, search & sort filters
    │   │   ├── TaskFormModal.jsx # Create/Edit task modal dialog
    │   │   ├── ConfirmModal.jsx  # Confirmation before delete
    │   │   └── Alert.jsx      # Feedback banner alerts
    │   ├── pages/
    │   │   ├── LoginPage.jsx  # Sign in screen
    │   │   ├── RegisterPage.jsx # Sign up screen
    │   │   └── DashboardPage.jsx # Main task management dashboard
    │   ├── App.jsx            # Root application view controller
    │   ├── index.css          # Clean, modern, responsive styling
    │   └── main.jsx           # App bootstrap with AuthProvider
    ├── vite.config.js         # Vite proxy configuration for /api
    └── package.json           # Client dependencies
```

---

## 🛠️ Getting Started (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017` (or MongoDB Atlas connection string)

### 1. Installation

Both projects are completely independent and self-contained:

```bash
# 1. Install Backend dependencies
cd server
npm install

# 2. Install Frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration
The backend configuration is already prepared in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_management_db
JWT_SECRET=super_secret_jwt_key_technova_task_manager_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Running the Projects (Separately)

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Frontend will run on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated API Testing

An automated test suite is included in `server/test-api.js` covering:
1. Health check endpoint
2. Registration validation & duplicate email prevention
3. Password hashing & comparison
4. Login with valid and invalid credentials
5. JWT route protection
6. Task creation, listing, updating, and deletion
7. **Strict user isolation** (verifying that User B cannot read, modify, or delete User A's tasks)
8. Filtering and title search

To run the automated tests:
```bash
# Ensure server is running (or node server/src/server.js in one terminal)
node server/test-api.js
```

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`, `confirmPassword`) | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT (`email`, `password`) | No |
| `POST` | `/api/auth/logout` | Logout / invalidate session | No |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Yes (Bearer token) |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | Get all tasks for authenticated user (supports `status`, `priority`, `search`, `sortBy`, `sortOrder`) | Yes |
| `GET` | `/api/tasks/:id` | Get single task by ID (validates task ownership) | Yes |
| `POST` | `/api/tasks` | Create a new task (`title`, `description`, `status`, `priority`, `dueDate`) | Yes |
| `PUT` | `/api/tasks/:id` | Update an existing task (validates task ownership) | Yes |
| `DELETE` | `/api/tasks/:id` | Delete a task (validates task ownership) | Yes |

---

## 💡 Technical Design Decisions

1. **Simple, Standard React**: Instead of using heavy component libraries or third-party UI dependencies, the frontend is built using standard React hooks (`useState`, `useEffect`, `useContext`) and native `fetch`. This keeps the code clean, fast, and easy to explain.
2. **Strict User Isolation**: All task queries in the database are scoped by `{ user: req.user._id }`. When accessing or modifying a task by ID, the controller verifies `task.user.toString() === req.user._id.toString()` before performing any action, responding with `403 Forbidden` if unauthorized.
3. **Database Indexing**: Compound indexes on `{ user: 1, createdAt: -1 }`, `{ user: 1, status: 1 }`, and `{ user: 1, priority: 1 }` ensure fast and scalable lookups for user dashboards.
4. **Vite Proxy**: Configured in `client/vite.config.js` to route all `/api` requests to `http://localhost:5000`, eliminating CORS complexities in local development.
