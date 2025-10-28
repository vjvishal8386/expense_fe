# Expense Tracker Frontend

A React + TypeScript + Vite frontend for an Expense Tracker application that connects to a FastAPI backend.

## Features

- User registration and login
- Dashboard with friends list
- Add new friends
- Shared expense tracking with friends
- Chat-style interface for expenses

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Context API

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Backend Integration

This frontend is **ready to connect** to a FastAPI backend.

### Backend Requirements

The frontend expects the backend to run at: `http://127.0.0.1:8000`

See `BACKEND_PROMPT.md` for complete backend specifications.

### API Endpoints Used

**Authentication:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

**Friends:**
- `GET /friends` - Get user's friends list
- `POST /friends` - Add a friend

**Expenses:**
- `GET /expenses/{friend_id}` - Get expenses with a specific friend
- `POST /expenses` - Create a new expense

### Setup with Backend

1. **Start the backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

2. **Start the frontend:**
```bash
npm install
npm run dev
```

3. **Register/Login:**
   - Frontend will connect to backend automatically
   - JWT tokens are stored in localStorage
   - All API calls include the Bearer token

### Development Mode

Currently configured for production with real backend API calls.

To test without backend:
- Backend must be running at `http://127.0.0.1:8000`
- Or modify `src/api/axiosClient.ts` to point to your backend URL

## Project Structure

```
src/
├── api/
│   ├── axiosClient.ts          # Axios configuration and interceptors
│   └── mockAPI.ts              # Mock API functions (for development)
├── components/
│   ├── Navbar.tsx              # Navigation bar with logout
│   ├── ExpenseCard.tsx         # Expense card component
│   └── FriendList.tsx          # Friends list component
├── data/
│   └── mockData.ts             # Mock data for friends and expenses
├── pages/
│   ├── Login.tsx               # Login page
│   ├── Register.tsx            # Registration page
│   ├── Dashboard.tsx           # Dashboard with friends list
│   └── Chat.tsx                # Expenses with a specific friend
├── context/
│   └── AuthContext.tsx         # Authentication context
├── App.tsx                     # Main app component with routing
└── main.tsx                    # Entry point
```

## Development

This project uses:
- **Vite** for fast development and building
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for global state management
- **Axios** for HTTP requests with interceptors for authentication

