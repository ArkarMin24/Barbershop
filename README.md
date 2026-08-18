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

## Render deployment

This project is set up for a Render deployment with:

- backend web service running Django + Daphne ASGI
- PostgreSQL database
- frontend static site built with Vite

Use the included [render.yaml](render.yaml) file and fill in the service names in the Render dashboard after creating the project.

### Backend environment variables

- `SECRET_KEY` = a strong random value
- `DEBUG` = `False`
- `DATABASE_URL` = automatically provided by Render when attached to the Postgres database
- `ALLOWED_HOSTS` = your backend domain, for example `barber-backend.onrender.com`
- `CORS_ALLOWED_ORIGINS` = your frontend URL, for example `https://barber-frontend.onrender.com`
- `CSRF_TRUSTED_ORIGINS` = same as above

### Frontend environment variables

- `VITE_API_URL` = `https://YOUR_BACKEND.onrender.com/api`
- `VITE_WS_URL` = `wss://YOUR_BACKEND.onrender.com`

## Notes

- The custom staff dashboard is intentionally not built yet.
- This scaffold is set up for future barber seat availability features, live updates, and admin functionality.
