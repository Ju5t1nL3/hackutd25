# 🤖 Real Estate AI Agent Platform

A comprehensive monorepo for an AI-powered real estate platform that handles property searches, customer calls, and data management.

---

## 📋 Overview

This project is a **monorepo** managed by [Turborepo](https://turbo.build/repo), containing multiple interconnected services that work together to provide an intelligent real estate agent experience.

### Architecture

The platform consists of three main applications:

- **Dashboard** (Veronica's domain) - A Next.js frontend for users to interact with the system
- **Calling Agent** (Keshav & Monish's domain) - A Node.js/Express service that integrates with Retell AI for voice calls
- **Searching Agent** (Justin's domain) - A Python/FastAPI service that searches properties using NVIDIA Nemotron and Zillow

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Monorepo Manager** | Turborepo |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Calling Service** | Node.js, Express, TypeScript, Retell AI SDK |
| **Search Service** | Python, FastAPI, NVIDIA Nemotron |
| **Database** | PostgreSQL |
| **ORM** | Prisma (shared package) |

---

## 🏁 Getting Started

### Prerequisites

Before beginning, ensure you have these installed:

- **Node.js** (v18.x or v20.x recommended)
- **npm** (v10.x or later)
- **Python** (v3.10 or later)
- **PostgreSQL** database (running instance)

---

## 🔧 Initial Setup

These steps only need to be completed once.

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd real-estate-ai
```

### Step 2: Install Node.js Dependencies

This installs all npm packages for every app and package in the monorepo:
```bash
npm install
```

### Step 3: Set Up Python Environment

Configure the Python virtual environment for the searching agent:
```bash
# Navigate to the search agent directory
cd apps/searching-agent

# Create a Python virtual environment
python3 -m venv .venv

# Activate the virtual environment
source .venv/bin/activate
# On Windows: .\.venv\Scripts\activate

# Install Python packages
pip install fastapi uvicorn httpx

# Return to project root
cd ../..
```

### Step 4: Configure Environment Variables

Create `.env` files to store sensitive configuration. **These files are never committed to Git.**

#### Root `.env` File

Create a `.env` file in the project root for the database connection:
```bash
touch .env
```

Add your PostgreSQL connection string:
```env
# /.env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB_NAME"
```

#### Service-Specific `.env` Files

Create additional environment files for each service:

- `apps/dashboard/.env.local` - Next.js configuration and API keys
- `apps/calling-agent/.env` - Retell AI API keys
- `apps/searching-agent/.env` - NVIDIA Nemotron keys, Zillow API keys

### Step 5: Initialize the Database

Run Prisma migrations to create all database tables:
```bash
npx prisma migrate dev --schema=./packages/db/prisma/schema.prisma
```

This command will:
1. Read the schema from `packages/db/prisma/schema.prisma`
2. Connect to your PostgreSQL database
3. Create all tables (Customer, CallLog, Property, etc.)

---

## 🚀 Running the Application

You'll need **two separate terminal windows** running simultaneously.

### Terminal 1: Node.js Services

Start all Node.js applications in development mode:
```bash
# From project root
npm run dev
```

This starts:
- **Dashboard** at `http://localhost:3000`
- **Calling Agent** at `http://localhost:3001` (or your configured port)

### Terminal 2: Python Search Service

Start the FastAPI search service:
```bash
# Navigate to the search agent
cd apps/searching-agent

# Activate virtual environment
source .venv/bin/activate

# Start FastAPI server
uvicorn main:app --reload
```

The search service runs at `http://localhost:8000` (default FastAPI port)

---

## 👥 Team Responsibilities

### 👩‍🎨 Veronica - Frontend Development

**Your Application:** `apps/dashboard`

**Tech Stack:** Next.js, React, Tailwind CSS

**Responsibilities:**
- Build the user-facing dashboard interface
- Create reusable UI components in `packages/ui`
- Implement API routes in `apps/dashboard/src/app/api`
- Use Prisma client from `packages/db` for database operations
- Import shared types from `packages/types`

### 📞 Keshav & Monish - Calling Agent

**Your Application:** `apps/calling-agent`

**Tech Stack:** Node.js, Express, Retell AI SDK

**Responsibilities:**
- Create webhook endpoints for Retell AI integration
- Handle live call logic and conversation flow
- Save call logs and transcripts to the database
- Manage customer information during calls
- Use Prisma client from `packages/db`
- Import shared types from `packages/types`

### 🔍 Justin - Search Agent

**Your Application:** `apps/searching-agent`

**Tech Stack:** Python, FastAPI

**Responsibilities:**
- Create API endpoints (e.g., `/start-search`)
- Integrate with NVIDIA Nemotron for AI-powered search
- Connect to Zillow API for property data
- Process and save search results to the database
- Coordinate with team on database access strategy (prisma-client-py vs. BFF)

---

## 📦 Shared Packages

The monorepo includes shared packages that all services can use:

- **`packages/db`** - Prisma client and database schema
- **`packages/ui`** - Shared React components
- **`packages/types`** - TypeScript type definitions shared across services

---

## 💡 Development Tips

- The monorepo structure allows code sharing while keeping services independent
- Turborepo handles building and caching for optimal performance
- Always run Prisma commands from the project root
- Keep environment variables secure and never commit `.env` files
- Coordinate database schema changes with the entire team
