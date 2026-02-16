Profile Management System

A full-stack authentication and profile management application built with Next.js, Node.js, and PostgreSQL.

Tech Stack
Backend

Node.js

Express.js

PostgreSQL

pg (node-postgres)

JWT Authentication

Middleware architecture

Frontend

Next.js (App Router)

React

Tailwind CSS

Features

User registration and login

JWT-based authentication

Protected API routes

Profile creation and update

PostgreSQL relational database

Input validation (server + client)

Modular and scalable structure

Project Structure
profile-main/
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── db/
│   │   └── utils/
│
└── frontend/
    ├── app/
    ├── components/
    ├── lib/
    └── public/
Getting Started
1. Clone Repository
git clone https://github.com/your-username/profile-main.git
cd profile-main
Backend Setup
Install Dependencies
cd backend
npm install

Make sure you have PostgreSQL installed locally or running via Docker.

PostgreSQL Setup

Create a database:

CREATE DATABASE profile_db;

Update your .env file inside backend/:

PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/profile_db
JWT_SECRET=your_super_secret_key

If your connection string is wrong, nothing works. Fix that first.

Example Database Schema

You need at minimum a users table:

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

And optionally a profiles table:

CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

If your schema doesn't match your queries, you will get runtime errors. Keep it aligned.

Run Backend
npm run dev

Backend runs at:

http://localhost:5000
Frontend Setup
Install Dependencies
cd frontend
npm install
Environment Variables

Create .env.local inside frontend/:

NEXT_PUBLIC_API_URL=http://localhost:5000

If this URL is wrong, API calls fail silently.

Run Frontend
npm run dev

Frontend runs at:

http://localhost:3000
Authentication Flow

User registers.

Password is hashed (bcrypt recommended).

User stored in PostgreSQL.

JWT token generated.

Client stores token.

Protected routes verify token via middleware.

If you are not hashing passwords, your system is insecure. Fix that immediately.

API Endpoints
Auth
Method	Endpoint	Description
POST	/api/auth/signup	Register user
POST	/api/auth/signin	Login user
Profile
Method	Endpoint	Description
GET	/api/profile	Get user profile
POST	/api/profile	Create or update profile
