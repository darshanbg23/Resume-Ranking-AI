# Frontend - React + Vite + TypeScript

Modern, responsive frontend for the Resume Ranking AI platform built with React, Vite, TypeScript, and TailwindCSS.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── layouts/             # Layout components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── hooks/               # Custom hooks
│   ├── context/             # React context providers
│   ├── routes/              # Routing configuration
│   ├── assets/              # Static assets
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript types
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Public assets
└── package.json             # Dependencies
```

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
```

## Features Implemented

### Layouts
- ✅ Public Layout (for unauthenticated users)
- ✅ Auth Layout (for authenticated users with role-based access)
- ✅ Main Layout (dashboard layout)

### Components
- ✅ Navbar with theme toggle
- ✅ Sidebar with dynamic navigation
- ✅ Footer with links and social media
- ✅ StatsCard for metrics display
- ✅ DataTable with pagination
- ✅ SearchBar with real-time search
- ✅ FilterPanel for advanced filtering
- ✅ LoadingSpinner and error states
- ✅ ErrorBoundary for error handling
- ✅ ProtectedRoute for authentication
- ✅ PageHeader with actions
- ✅ NotificationCard for alerts
- ✅ ResumeCard for resume display
- ✅ JobCard for job listing

### Pages

#### Public
- ✅ Home page with features
- ✅ Login page
- ✅ Register page

#### Candidate
- ✅ Dashboard with stats and resumes
- ✅ Profile management
- ✅ Resume upload and management
- ✅ Results page (placeholder)
- ✅ Notifications

#### Recruiter
- ✅ Dashboard with stats and jobs
- ✅ Job management (placeholder)
- ✅ Candidate search (placeholder)
- ✅ Candidate rankings (placeholder)
- ✅ Analytics with mock data

#### Admin
- ✅ Admin dashboard with stats
- ✅ User management (placeholder)
- ✅ Job management (placeholder)
- ✅ Reports (placeholder)
- ✅ Settings (placeholder)

### Features
- ✅ Dark/Light theme with persistence
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ React Context for state management
- ✅ Axios API client with interceptors
- ✅ Route-based code splitting
- ✅ TypeScript for type safety
- ✅ TailwindCSS for styling
- ✅ Material UI components
- ✅ Mock data for development

## Remaining Tasks for Backend Integration

1. Connect authentication endpoints
2. Implement resume upload API
3. Connect job listing API
4. Implement search and filter functionality
5. Add candidate ranking API
6. Connect analytics endpoints
7. Implement notifications
8. Add user profile update API
9. Connect admin endpoints
10. Implement pagination and sorting

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3
- **UI Components**: Material UI 5
- **Routing**: React Router 6
- **HTTP Client**: Axios
- **State Management**: React Context API

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- All authentication is currently mocked
- Backend API endpoints are not yet implemented
- Mock data is used throughout for development
- Theme is persisted in localStorage
- Responsive design follows mobile-first approach
