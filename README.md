# Barber Shop Seat Availability System

This project is organized into a clean frontend/backend structure for a barber shop seat availability application.

## Structure

- `frontend/` – React + Vite frontend
- `backend/` – Django backend with REST API and WebSocket support

## Tech stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Django, Django REST Framework, Django Channels
- Database: SQLite for local development, PostgreSQL ready for production

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Notes

- The custom staff dashboard is intentionally not built yet.
- This scaffold is set up for future barber seat availability features, live updates, and admin functionality.
