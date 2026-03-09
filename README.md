# Catering Management System

## Project Overview

A full-stack catering management platform designed to help catering 
business owners reduce food waste, optimize food purchasing, and 
increase profit margins. The system collects data across events — 
menus, guest counts, and post-event food logs — and uses that 
historical data to generate smarter purchasing recommendations over 
time.

### The Problem

Catering businesses lose significant profit to over-ordering food. 
Existing software focuses on scheduling and CRM but does not connect 
food waste data to actionable purchasing decisions. This platform 
fills that gap.

### The Solution

Catering managers use the system to plan events, build menus, and 
record guest counts before an event. After the event, they log 
leftover food. Over time, the system analyzes trends across different 
event types and client histories to recommend how much food to order 
for future events — reducing waste and protecting margins.

---

## Users

| Role | Description |
|---|---|
| **Admin** | The catering business owner. Full access to all features. Primary user for now. |
| **Employee** | Staff members. Role is defined but not yet built out. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript (via Vite) |
| Frontend Routing | React Router DOM |
| Backend | ASP.NET Core Web API (C#) |
| Database | SQLite with Entity Framework Core |
| Code Style | ESLint + Prettier |

---

## Product Scope

### Must Have
- Event management (create, view, edit events with guest count and budget)
- Menu management (build menus with categories and items)
- Post-event food waste logging
- Food quantity recommendations based on historical data
- Admin authentication (login, registration)

### Should Have
- Profit analysis per event
- Waste analytics dashboard
- Responsive design

### Could Have
- Image uploads for events
- Waste threshold alerts
- Employee role and access

### Won't Have (this project)
- Full accounting systems
- Event marketing tools
- Hardware integrations
- Client-side Portal

---

## Sprint Plan

### Sprint 1 — Foundation
**Goal:** Establish a working foundation for the catering platform, 
including a deployed application with a functioning authentication 
system that allows users to securely register and log in.

### Sprint 2 — Management System
**Placeholder Goal:** Build the core management features including events, menus, 
guest counts, and post-event food waste logging.

*To be planned at the start of Sprint 2.*

### Sprint 3 — Recommendations Engine
**Placeholder Goal:** Implement an algorithm that analyzes historical event data 
and recommends food quantities for future events based on event type, 
guest count, and past waste trends.

This is the most ambitious sprint and the core differentiator of the 
product. The scope of the recommendation engine will be adjusted based 
on time available — at minimum it will use weighted historical averages, 
and if time allows, a more sophisticated model can be explored.

*To be planned at the start of Sprint 3.*

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/michelle-johanson/Catering_SCRUM.git
cd Catering_SCRUM
```

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`

### 3. Run the Backend
```bash
cd backend
dotnet restore
dotnet run
```

The backend will run at `http://localhost:5000`

*Note: The backend has not been scaffolded yet. Update this
when the backend setup card is complete.*

### 4. Environment Variables

*To be documented once the backend is set up.*

---

## Branching Strategy

This project uses a structured branching strategy to keep everyone's 
work organized and avoid conflicts. Please follow these rules for 
every card you work on.

### Branch Structure
```
main          ← production only, managed by the Product Owner
└── dev       ← shared integration branch, all PRs merge here
    ├── feature/backend-setup
    ├── feature/frontend-setup
    └── feature/your-feature-name
```

### Rules

- All work happens on a `feature/` branch, **never commit directly to `main` or `dev`**
- Every feature branch is reviewed by at least one teammate before merging
- The Product Owner reviews `dev` and merges to `main` at the end of each sprint

### Starting a New Card

When you pick up a Trello card, do the following:
```bash
# Make sure you have the latest version of dev
git checkout dev
git pull origin dev

# Create your feature branch
# Name it after your Trello card, e.g. feature/user-login
git checkout -b feature/your-feature-name
```

Commit regularly with clear messages. A good commit message describes what changed and why:

### Opening a Pull Request

When your card is done:
```bash
# Push your branch to GitHub
git push origin feature/your-feature-name
```

Then go to the repo on GitHub. You will see a prompt to open a Pull 
Request. Make sure:

- The base branch is set to `dev` (not `main`)
- You write a short description of what you did
- You request at least one teammate to review it

Do not merge your own PR. Wait for a teammate to approve it.

### Keeping Your Branch Up to Date

If `dev` has been updated while you are working, pull the latest 
changes into your branch to avoid conflicts:
```bash
git checkout dev
git pull origin dev
git checkout feature/your-feature-name
git merge dev
```