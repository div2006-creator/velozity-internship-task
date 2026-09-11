# Client Project Dashboard

A full-stack client and project management dashboard built with React, TypeScript, Vite, Node.js, Express, PostgreSQL, and Prisma.

## 📁 Repository Structure

```text
client-project-dashboard/
├── frontend/             # React + TypeScript + Vite frontend application
├── backend/              # Node.js + Express + TypeScript backend API service
│   └── prisma/           # Prisma ORM schema & migration files
├── docker-compose.yml    # Docker Compose setup for PostgreSQL
├── .env.example          # Template environment variable configuration
└── README.md             # Project documentation
```

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Containerization**: Docker Compose

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Docker & Docker Compose (for running PostgreSQL container)

### 1. Environment Setup

Copy `.env.example` to create local `.env` files for both backend and root:

```bash
cp .env.example .env
cp .env.example backend/.env
```

### 2. Start PostgreSQL Database

Run Docker Compose to start the PostgreSQL database container:

```bash
docker-compose up -d
```

### 3. Backend Setup

Navigate to the `backend/` directory and install dependencies:

```bash
cd backend
npm install
```

Generate Prisma Client and apply migrations:

```bash
npx prisma generate
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

The backend server will run on `http://localhost:5000`.

### 4. Frontend Setup

Navigate to the `frontend/` directory and install dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`.

---

## 📜 Scripts Overview

### Backend (`backend/`)

- `npm run dev`: Start backend development server with hot-reloading.
- `npm run build`: Compile TypeScript into executable JavaScript in `dist/`.
- `npm start`: Run production build from `dist/index.js`.
- `npm run db:generate`: Generate Prisma client.
- `npm run db:migrate`: Run Prisma database migrations.

### Frontend (`frontend/`)

- `npm run dev`: Launch Vite dev server.
- `npm run build`: Build production assets.
- `npm run preview`: Preview production build locally.
