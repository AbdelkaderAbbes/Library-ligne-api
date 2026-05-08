# Library-ligne-api

A RESTful API for an online library (bibliothèque en ligne) built with **Node.js**, **Express 5**, and **MongoDB** (via Mongoose). It supports JWT-based authentication with role-based access control (user / admin).

---

## Tech Stack

- **Runtime:** Node.js (ESM modules)
- **Framework:** Express 5
- **Database:** MongoDB + Mongoose 9
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Validation:** Custom validators (Joi installed as well)
- **Dev tooling:** Nodemon, dotenv

---

## Project Structure

```
Library-ligne-api/
├── app.js                  # Entry point
├── .env                    # Environment variables
├── package.json
├── middleware/
│   └── auth.js             # JWT verification & admin guard
├── models/
│   ├── Book.js             # Book schema + Counter + validators
│   └── User.js             # User schema + password hashing
└── routes/
    ├── auth.js             # /api/auth  (register, login, me)
    └── livres.js           # /api/livres (CRUD)
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)

### Installation

```bash
git clone <repo-url>
cd Library-ligne-api
npm install
```

### Environment Variables

Create a `.env` file at the project root (an example is included):

```env
PORT=5000
MONGO_URI=mongodb://localhost/bookstoredb
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

### Running the Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The server starts on `http://localhost:5000` by default.

---

## API Reference

### Base URL

```
http://localhost:5000/api
```

---

### Authentication — `/api/auth`

#### `POST /api/auth/register`

Register a new user.

**Body:**

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response `201`:**

```json
{
  "message": "User registered successfully.",
  "token": "<jwt>",
  "user": {
    "id": "...",
    "username": "alice",
    "email": "alice@example.com",
    "role": "user"
  }
}
```

---

#### `POST /api/auth/login`

Log in with email and password.

**Body:**

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response `200`:**

```json
{
  "message": "Login successful.",
  "token": "<jwt>",
  "user": {
    "id": "...",
    "username": "alice",
    "email": "alice@example.com",
    "role": "user"
  }
}
```

---

#### `GET /api/auth/me`

Get the currently authenticated user's profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response `200`:** User object (password excluded).

---

### Books — `/api/livres`

#### `GET /api/livres`

Get all books. **Public.**

**Response `200`:**

```json
[
  {
    "id": 1,
    "title": "...",
    "author": "...",
    "description": "...",
    "prix": 19.99,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

#### `GET /api/livres/:id`

Get a single book by its numeric ID. **Public.**

---

#### `POST /api/livres`

Create a new book. Requires a valid JWT (any role).

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "title": "Le Petit Prince",
  "author": "Antoine de Saint-Exupéry",
  "description": "Un conte philosophique.",
  "prix": 12.5
}
```

**Validation rules:**

- `title` and `author` are required, minimum 3 characters each.

---

#### `PUT /api/livres/:id`

Update a book. Requires a valid JWT with **admin** role.

**Headers:** `Authorization: Bearer <token>`

**Body** (at least one of `title` or `author` required):

```json
{
  "title": "Updated Title",
  "prix": 15.0
}
```

---

#### `DELETE /api/livres/:id`

Delete a book. Requires a valid JWT with **admin** role.

**Response `200`:**

```json
{ "message": "Livre deleted" }
```

---

## Authentication & Roles

| Symbol | Meaning                                                |
| ------ | ------------------------------------------------------ |
| 🔒     | Requires a valid JWT (`Authorization: Bearer <token>`) |
| 👑     | Requires `role: "admin"`                               |

The JWT payload contains `{ id, username, role }` and is valid for 7 days by default.

To promote a user to admin, update their `role` field directly in the database.

---

## Data Models

### User

| Field      | Type   | Notes                                |
| ---------- | ------ | ------------------------------------ |
| `username` | String | Required, unique, min 3 chars        |
| `email`    | String | Required, unique, lowercase          |
| `password` | String | Required, min 6 chars, bcrypt-hashed |
| `role`     | String | `"user"` (default) or `"admin"`      |

### Book

| Field         | Type   | Notes                    |
| ------------- | ------ | ------------------------ |
| `id`          | Number | Auto-incremented, unique |
| `title`       | String | Required                 |
| `author`      | String | Required                 |
| `description` | String | Optional                 |
| `prix`        | Number | Optional (price)         |

Book IDs are auto-incremented via a `Counter` collection, so they are sequential integers (1, 2, 3 …) rather than MongoDB ObjectIDs.

---

## Error Responses

All errors follow a consistent shape:

```json
{ "message": "Human-readable error description." }
```

| Status | Meaning                               |
| ------ | ------------------------------------- |
| 400    | Bad request / validation error        |
| 401    | Missing or invalid token              |
| 403    | Forbidden (admin required)            |
| 404    | Resource not found                    |
| 409    | Conflict (duplicate email / username) |
| 500    | Internal server error                 |

---

## License

ISC
