# MockMate AI – Frontend

React + Vite + Tailwind CSS client for the MockMate AI Interview Preparation
Platform.

## Tech

- **React 19** with hooks
- **Vite 8** for dev server + build
- **Tailwind CSS 3** for styling
- **React Router 6** for client-side routing
- **Axios** for HTTP with interceptors
- **react-hot-toast** for notifications

## Folder layout

```
frontend/
├── public/
└── src/
    ├── api/           # Axios instance + endpoint wrappers
    ├── components/    # Reusable UI
    │   ├── common/    # Button, Input, Card, Loader, …
    │   └── layout/    # Navbar, Sidebar, ProtectedLayout
    ├── context/       # AuthContext
    ├── hooks/         # useAuth, useApi, useLocalStorage
    ├── pages/         # Auth, Resume, JD, Interview, Dashboard
    ├── routes/        # AppRouter, ProtectedRoute
    ├── utils/         # formatScore, formatDate, validators
    ├── App.jsx
    ├── main.jsx
    └── index.css      # Tailwind directives + globals
```

## Quick start

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Vite dev server: `http://localhost:5173`. The `VITE_API_BASE_URL` should point
to the backend, e.g. `http://localhost:5000/api`.
