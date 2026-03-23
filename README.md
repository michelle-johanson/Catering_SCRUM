# Catering Management System

A full-stack catering platform that helps catering business owners reduce food waste and increase profit margins. The system collects event, menu, and guest data, then uses historical waste logs to generate smarter food quantity recommendations over time.

**Tech Stack:** React 19 + TypeScript (Vite) · ASP.NET Core (C#) · PostgreSQL + Entity Framework Core

---

## Getting Started

### Prerequisites

- Node.js
- .NET 10 SDK
- PostgreSQL (running locally)

### 1. Clone the Repository

```bash
git clone https://github.com/michelle-johanson/Catering_SCRUM.git
cd Catering_SCRUM
```

### 2. Set Up the Database

Create the database:

```sql
CREATE DATABASE catering;
```

Copy the example settings file and fill in your local PostgreSQL credentials:

```bash
cp backend/CateringAPI/appsettings.Development.example.json backend/CateringAPI/appsettings.Development.json
```

Open `appsettings.Development.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=catering;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

> `appsettings.Development.json` is gitignored — never commit it. It overrides `appsettings.json` automatically when running locally.

Run migrations:

```bash
cd backend/CateringAPI
dotnet ef database update
```

### 3. Run the Backend

```bash
cd backend/CateringAPI
dotnet run --launch-profile http
```

Backend runs at `http://localhost:5015`.  
Health check: `http://localhost:5015/api/health`

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. All `/api` requests are proxied to the backend automatically.

### 5. Environment Variables (Optional)

| Variable            | Description                    | Default                 |
| ------------------- | ------------------------------ | ----------------------- |
| `VITE_PROXY_TARGET` | Backend URL for the Vite proxy | `http://localhost:5015` |

Create a `.env` file in `frontend/` if your backend runs on a different port:

```
VITE_PROXY_TARGET=http://localhost:5015
```

### Troubleshooting: `500` on Register/Login

If `/api/auth/register` or `/api/auth/login` returns `500`, it is usually a database connection issue.

Checklist:

1. Ensure `backend/CateringAPI/appsettings.Development.json` exists (copy from `.example` if needed).
2. Replace `YOUR_PASSWORD_HERE` with your real PostgreSQL password.
3. Ensure PostgreSQL is running and the `catering` database exists.
4. Run migrations:

```bash
cd backend/CateringAPI
dotnet ef database update
```

On startup, the API now fails fast with a clear config message if `DefaultConnection` still contains `YOUR_PASSWORD_HERE`.

---

## Branching Strategy

```
main          ← production only, merged by Product Owner at sprint end
└── dev       ← shared integration branch, all PRs target here
    └── feature/your-card-name
```

**Rules:**

- Never commit directly to `main` or `dev`
- Branch off `dev`, open PRs back to `dev`
- Do not merge your own PR — get a teammate to review it first

```bash
# Start a new card
git checkout dev
git pull origin dev
git checkout -b feature/your-card-name

# Push and open a PR targeting dev
git push origin feature/your-card-name
```

If `dev` updates while you're working:

```bash
git checkout dev && git pull origin dev
git checkout feature/your-card-name
git merge dev
```

---

## Sprint Plan

### Sprint 1 — Foundation

**Goal:** Establish a working foundation with a deployed application and a functioning authentication system that allows users to securely register and log in.

### Sprint 2 — Management System

**Goal:** Build the core management features including events, menus, guest counts, and post-event food waste logging.

_Planned at the start of Sprint 2._

### Sprint 3 — Recommendations Engine

**Goal:** Implement an algorithm that analyzes historical event data and recommends food quantities for future events based on event type, guest count, and past waste trends. At minimum, weighted historical averages; a more sophisticated model if time allows.

_Planned at the start of Sprint 3._

---

## Product Scope

### Must Have

- Admin authentication (register, login)
- Event management (create, view, edit — with guest count and budget)
- Menu management (build menus with categories and items)
- Post-event food waste logging
- Food quantity recommendations based on historical data

### Should Have

- Profit analysis per event
- Waste analytics dashboard
- Responsive design

### Could Have

- Image uploads for events
- Waste threshold alerts
- Employee role and access controls

### Won't Have (This Project)

- Full accounting systems
- Event marketing tools
- Hardware integrations
- Client-side portal

---

## Users

| Role         | Description                                                             |
| ------------ | ----------------------------------------------------------------------- |
| **Admin**    | The catering business owner. Full access to all features. Primary user. |
| **Employee** | Staff members. Role is defined but not yet implemented.                 |

---

## EARS Requirements

| Type              | Template                                                        |
| ----------------- | --------------------------------------------------------------- |
| Ubiquitous        | The \<system\> shall \<action\>.                                |
| Event-driven      | When \<trigger\>, the \<system\> shall \<action\>.              |
| State-driven      | While \<state\>, the \<system\> shall \<action\>.               |
| Optional feature  | Where \<feature is included\>, the \<system\> shall \<action\>. |
| Unwanted behavior | If \<condition\>, then the \<system\> shall \<action\>.         |

---

### Authentication

**REQ-AUTH-01**
✅ The system shall store all user passwords as a BCrypt hash and never persist plaintext passwords.

**REQ-AUTH-02**
✅ When a user submits a registration form, the system shall validate that the username, email, and password fields are all non-empty before creating an account.

**REQ-AUTH-03**
✅ When a user attempts to register with an email or username that already exists, the system shall return a 409 Conflict response with a descriptive error message.

**REQ-AUTH-04**
✅ When a user submits valid login credentials, the system shall return the user's ID, username, email, and role.

**REQ-AUTH-05**
✅ If a user submits an unrecognized username or an incorrect password during login, the system shall return a 401 Unauthorized response.

**REQ-AUTH-06**
✅ The system shall assign all newly registered users the role of "Employee" by default.

---

### Event Management

**REQ-EVT-01**
❌ The system shall allow an authenticated admin to create an event with a name, date, guest count, and budget.

**REQ-EVT-02**
❌ The system shall associate every event with the user ID of the admin who created it.

**REQ-EVT-03**
❌ When a request is made to retrieve a specific event by ID, the system shall return a 404 Not Found response if no matching event exists.

**REQ-EVT-04**
❌ When an admin updates an event, the system shall persist changes to name, date, guest count, and budget.

**REQ-EVT-05**
❌ When an event is deleted, the system shall cascade delete all menus and menu items associated with that event.

**REQ-EVT-06**
✅ The system shall allow retrieval of all events as a list.

---

### Menu Management

**REQ-MENU-01**
❌ The system shall allow an authenticated admin to create a menu and associate it with a specific event.

**REQ-MENU-02**
❌ When a request is made to retrieve a menu by ID, the system shall return a 404 Not Found response if no matching menu exists.

**REQ-MENU-03**
❌ When a menu is deleted, the system shall cascade delete all menu items associated with that menu.

**REQ-MENU-04**
❌ The system shall allow retrieval of all menus as a list.

---

### Menu Items

**REQ-ITEM-01**
❌ The system shall allow an authenticated admin to add a menu item with a name, category, and quantity ordered, and associate it with a specific menu.

**REQ-ITEM-02**
❌ The system shall default the quantity wasted for a new menu item to zero.

**REQ-ITEM-03**
❌ When an admin logs post-event waste, the system shall allow updating the quantity wasted for any existing menu item.

**REQ-ITEM-04**
❌ When a request is made to retrieve a menu item by ID, the system shall return a 404 Not Found response if no matching item exists.

**REQ-ITEM-05**
❌ The system shall allow retrieval of all menu items as a list.

---

### Food Waste Logging

**REQ-WASTE-01**
❌ The system shall allow an admin to record leftover food quantities for any menu item after an event concludes.

**REQ-WASTE-02**
❌ The system shall persist quantity-wasted data at the menu item level, linked to the menu and event it belongs to.

**REQ-WASTE-03**
❌ The system shall retain historical waste data across all past events to support future recommendation calculations.

---

### Recommendations Engine

**REQ-REC-01**
❌ Where the recommendations feature is enabled, the system shall analyze historical waste data across past events of the same type before generating a quantity recommendation.

**REQ-REC-02**
❌ When an admin creates a new event, the system shall provide a recommended food quantity for each menu item based on guest count and historical waste trends for similar events.

**REQ-REC-03**
❌ If fewer than three historical events of a matching type exist, the system shall fall back to a weighted average across all available past events.

**REQ-REC-04**
❌ The system shall expose recommendations via an API endpoint that returns item name, recommended quantity, and confidence level.
