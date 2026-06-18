# Resume Ranking AI

This repository contains the code for the Resume Ranking AI project. It consists of a Django backend and a React/Vite frontend.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Python (3.8+)**: Required for the backend. [Download Python here](https://www.python.org/downloads/).
- **Node.js (18+)**: Required for the frontend. [Download Node.js here](https://nodejs.org/).

## 1. Clone the Repository

Open a terminal or command prompt and clone this repository to your local machine:

```bash
git clone <repository-url>
cd Resume-Ranking-AI
```

## 2. Backend Setup & Running

The backend is a Django project and requires Python.

1. **Open a terminal** and navigate to the project directory:
   ```bash
   cd Resume-Ranking-AI
   ```
2. **Create a virtual environment**:
   ```bash
   python -m venv myenv
   ```
   *(On Mac/Linux use `python3 -m venv myenv`)*
3. **Activate the virtual environment**:
   - On **Windows**:
     ```bash
     myenv\Scripts\activate
     ```
   - On **Mac/Linux**:
     ```bash
     source myenv/bin/activate
     ```
4. **Navigate to the backend folder** and **install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
5. **Set up environment variables**:
   Copy the provided `.env.example` file to create your `.env` file and fill in your actual configuration (API keys, etc.):
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt use `copy .env.example .env`)*
6. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```
7. **Start the backend development server**:
   ```bash
   python manage.py runserver
   ```
   The backend should now be running (typically at `http://localhost:8000/`). Keep this terminal open.

## 3. Frontend Setup & Running

The frontend is built with React and Vite.

1. **Open a new (second) terminal** and navigate to the `frontend` directory:
   ```bash
   cd Resume-Ranking-AI/frontend
   ```
2. **Install frontend dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Copy the provided `.env.example` file to create your `.env` file in the `frontend` directory:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt use `copy .env.example .env`)*
4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   The frontend will start on a local development server (typically `http://localhost:5173/`). Keep this terminal open.

## Summary

To run the full application for development, you will need two terminals running simultaneously:
- **Terminal 1 (Backend):** Running the Python virtual environment and the Django server (`python manage.py runserver`).
- **Terminal 2 (Frontend):** Running the Node.js Vite server (`npm run dev`).
