## Sheltr — Airbnb for Evacuees (Full‑Stack)

A full-stack emergency evacuation housing platform inspired by Airbnb.

### Tech stack
- **Backend**: Node.js + Express
- **DB**: MongoDB + Mongoose
- **Auth**: JWT (Bearer token)
- **Frontend**: EJS + HTML/CSS + Vanilla JS (keeps your existing design)

### What you can demo to a professor
- **Signup/Login** with roles (**host** / **guest**)
- **Listings CRUD** (host creates/edits shelters)
- **Search & filters** (location, capacity, text search, date availability)
- **Booking requests** (guest requests a stay)
- **Approve/Reject** bookings (host)
- **Notifications** (in DB) for booking requested + status changed
- **Dashboards** (`/api/users/me/dashboard`)

---

## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Create `.env` (optional)
Create a `.env` file in the project root:
```env
MONGO_URL=mongodb://127.0.0.1:27017/Sheltr
JWT_SECRET=replace_this_with_any_secret
PORT=8080
```

### 3) Seed sample data
```bash
node init/index.js
```

### 4) Run the server
```bash
npm start
```

Open:
- **Home**: `http://localhost:8080/`
- **Login**: `http://localhost:8080/login`
- **Signup**: `http://localhost:8080/signup`
- **Shelters browse**: `http://localhost:8080/evacuee/shelters`
- **My bookings (guest)**: `http://localhost:8080/evacuee/bookings`

---

## API quick reference

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Listings
- `GET /api/listings`
  - query params: `q`, `country`/`location`, `address`, `capacity`, `startDate`, `endDate`
- `GET /api/listings/:id`
- `POST /api/listings` (auth)
- `PATCH /api/listings/:id` (auth, owner)
- `DELETE /api/listings/:id` (auth, owner)

### Bookings
- `POST /api/bookings` (auth)
- `GET /api/bookings` (auth)
- `PATCH /api/bookings/:id/status` (auth + host)

### Notifications
- `GET /api/notifications` (auth)
- `PATCH /api/notifications/:id/read` (auth)
- `PATCH /api/notifications/read-all` (auth)

### User dashboard
- `GET /api/users/me/dashboard` (auth)

---

## Presentation script (2–3 minutes)
1. Seed DB (`node init/index.js`) and run server (`npm start`)
2. Signup as **Guest**, browse shelters, open one, request booking
3. Signup as **Host**, open host dashboard, approve booking
4. Guest refreshes and sees booking status + notifications
5. Guest can also open “My Bookings” page to track everything

