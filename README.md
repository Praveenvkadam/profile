Profile Management System

A full-stack authentication and profile management application built with a modular and scalable architecture.

Tech Stack
Backend

Node.js

Express.js

MongoDB

JWT Authentication

Middleware-based architecture

Frontend

Next.js (App Router)

React

Tailwind CSS

Features

User registration and login

JWT-based authentication

Protected routes

Profile creation and update

File upload handling

Input validation (server + client)

Clean modular project structure

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
│   │   ├── utils/
│   │   └── validators/
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
Environment Variables

Create a .env file inside the backend/ directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

If these values are wrong, authentication will fail.

Run Backend
npm run dev

or

node src/server.js

Backend runs on:

http://localhost:5000
Frontend Setup
Install Dependencies
cd frontend
npm install
Environment Variables

Create a .env.local file inside frontend/:

NEXT_PUBLIC_API_URL=http://localhost:5000

If this URL does not match the backend URL, API requests will fail.

Run Frontend
npm run dev

Frontend runs on:

http://localhost:3000
Authentication Flow

User registers or logs in.

Backend validates input.

JWT token is generated.

Token is returned to the client.

Client includes token in the Authorization header.

Middleware verifies token for protected routes.

API Endpoints
Auth Routes
Method	Endpoint	Description
POST	/api/auth/signup	Register user
POST	/api/auth/signin	Login user
Profile Routes
Method	Endpoint	Description
GET	/api/profile	Get profile
POST	/api/profile	Create or update profile
