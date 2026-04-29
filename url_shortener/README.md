# Snip — URL Shortener

A full-stack URL shortener built with React + Vite (frontend) and Express + MongoDB (backend).

## Project Structure

```
url_shortener/        ← React frontend
url_shortener_backend/ ← Express backend
```

---

## Prerequisites

- Node.js 18+
- A MongoDB Atlas account (or local MongoDB instance)

---

## Backend Setup

```bash
cd url_shortener_backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in the values:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CORS_ORIGIN=http://localhost:5173
APP_URL=http://localhost:3000
```

Start the backend:

```bash
npm start
```

The API will be running at `http://localhost:3000`.

---

## Frontend Setup

```bash
cd url_shortener
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in the value:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## Running Both Together

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd url_shortener_backend
npm start
```

**Terminal 2 — Frontend:**
```bash
cd url_shortener
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login |
| POST | `/links` | Optional | Shorten a URL |
| GET | `/links` | Required | List your links |
| DELETE | `/links/:code` | Required | Delete a link |
| GET | `/s/:code` | No | Redirect to original URL |

---

## Deployment

See [Vercel](https://vercel.com) for hosting. Deploy the backend and frontend as two separate projects, each pointing to their respective root directories.

Set the following environment variables in Vercel:

**Backend:** `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `APP_URL`, `NODE_ENV`

**Frontend:** `VITE_API_URL`
