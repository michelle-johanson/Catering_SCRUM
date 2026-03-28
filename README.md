# Catering Management System

Built by:
Bradford, Conrad
Faylor, Josh
Johanson, Michelle
Jorgensen, Spencer
Mitton, Tyler
Powers, Chase
Shim, Jaewon
Wong, Sabrina

A full-stack catering platform that helps catering business owners reduce food waste and increase profit margins. The system collects event, menu, and guest data, then uses historical waste logs to generate smarter food quantity recommendations over time.

**Tech Stack:** React 19 + TypeScript (Vite) · ASP.NET Core (C#) · PostgreSQL + Entity Framework Core

---

## Deployed Stack

| Layer    | Service                                        |
| -------- | ---------------------------------------------- |
| Frontend | Vercel (auto-deploys from `main`)              |
| Backend  | Render (`https://catering-scrum.onrender.com`) |
| Database | Neon (PostgreSQL, shared team project)         |

---

## Getting Started (Local Development)

### Prerequisites

- Node.js
- .NET 10 SDK

### 1. Clone the Repository

```bash
git clone https://github.com/michelle-johanson/Catering_SCRUM.git
cd Catering_SCRUM
```

### 2. Set Up the Database Connection

- `cd backend/CateringAPI`
- `cp appsettings.Development.example.json appsettings.Development.json`
- Update `appsettings.Development.json` with Neon connection string
- Apply any pending migrations: `dotnet ef database update`

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

Frontend runs at `http://localhost:5173`. All `/api` requests are proxied to the backend at `http://localhost:5015` automatically.

---

## GitHub Help

```bash
# Start a new card
git checkout dev
git pull origin dev
git checkout -b your-branch-name

# Push and open a PR targeting dev
git push origin your-branch-name
```

If `dev` updates while you're working:

```bash
git checkout dev && git pull origin dev
git checkout feature/your-card-name
git merge dev
```

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

## EARS Requirements

| Type              | Template                                                        |
| ----------------- | --------------------------------------------------------------- |
| Ubiquitous        | The \<system\> shall \<action\>.                                |
| Event-driven      | When \<trigger\>, the \<system\> shall \<action\>.              |
| State-driven      | While \<state\>, the \<system\> shall \<action\>.               |
| Optional feature  | Where \<feature is included\>, the \<system\> shall \<action\>. |
| Unwanted behavior | If \<condition\>, then the \<system\> shall \<action\>.         |

---

### Navigation & Access Control

1. ✅ While a user is not authenticated, the system shall display a public landing page with links to login and register.
2. ✅ While a user is not authenticated, the system shall restrict the navigation bar to a single login link.
3. ✅ When a user is authenticated, the system shall display a navigation bar with links to all major pages and a logout button.
4. ✅ When an unauthenticated user attempts to access a protected page, the system shall redirect them to the login page.
5. ✅ When a user logs in successfully, the system shall redirect them to the dashboard.
6. ✅ When a user logs out, the system shall clear their session and redirect them to the landing page.

### Authentication

1. ✅ The system shall store all user passwords as a BCrypt hash and never persist plaintext passwords.
2. ✅ When a user submits a registration form, the system shall validate that the username, email, and password fields are all non-empty before creating an account.
3. ✅ When a user attempts to register with an email or username that already exists, the system shall return a 409 Conflict response with a descriptive error message.
4. ✅ When a user submits valid login credentials, the system shall return the user's ID, username, email, and role.
5. ✅ If a user submits an unrecognized username or an incorrect password during login, the system shall return a 401 Unauthorized response.
6. ✅ The system shall assign all newly registered users the role of "Employee" by default.

### User Profile

1. ✅ The system shall allow an authenticated user to view their username, email, and role on a dedicated profile page.
2. ✅ When an authenticated user submits updated profile information, the system shall persist changes to username and email.
3. ✅ When a user updates their username, the system shall update the displayed name in the navigation bar.

### Dashboard

1. ✅ The system shall display a dashboard showing OKR summary metrics: average profit margin, average food waste, upcoming event count, and days until the next event.
2. ✅ The dashboard shall display upcoming events sorted by date.
3. ✅ The dashboard shall display upcoming tasks with due dates and links to edit them.
4. ✅ The dashboard shall highlight past events missing post-event financial data.
5. ✅ The dashboard shall provide quick-action buttons for creating a new event and navigating to analytics.

### Event Management

1. ✅ The system shall allow an authenticated user to create an event with a name, date, guest count, and budget.
2. ✅ When a user updates an event, the system shall persist changes to name, date, guest count, and budget.
3. ✅ When an event is deleted, the system shall cascade delete all menus, menu items, and tasks associated with that event.
4. ✅ The system shall display all events in a list with each event name linking to its detail page.
5. ✅ The system shall display an event detail page with tabs for overview, assigned menus, and tasks.

### Task Management

1. ✅ The system shall allow an authenticated user to create, edit, and delete tasks with a title, description, status, optional due date, and optional event association.
2. ✅ The system shall support three task statuses: Pending, In Progress, and Done.
3. ✅ The system shall display all tasks in a filterable list with the ability to filter by event or view general tasks not tied to any event.

### Menu Management

1. ✅ The system shall allow an authenticated user to create a menu and associate it with an event.
2. ✅ When a menu is deleted, the system shall cascade delete all menu items associated with that menu.
3. ✅ The system shall display all menus grouped by event.

### Menu Items & Food Waste Logging

1. ✅ The system shall allow an authenticated user to add, edit, and delete menu items with a name, category, and quantity ordered.
2. ✅ The system shall default the quantity wasted for a new menu item to zero.
3. ✅ The system shall allow updating the quantity wasted for any menu item to log post-event waste, and retain that data historically across all past events.
4. ✅ The system shall display all menu items for a given menu in an editable table.

### Analytics

1. ✅ The system shall display an analytics page with financial summary metrics: total revenue, total costs, net profit, and average food waste per event.
2. ✅ The system shall display charts for food waste trends, profitability, revenue per guest, and cost breakdown across past events.
3. ❌ The system shall display a task completion breakdown showing counts for each status (Pending, In Progress, Done).
4. ❌ The system shall display a breakdown of events grouped by month.

### Recommendations Engine

1. ❌ When a user creates a new event, the system shall recommend food quantities for menu items based on guest count and historical waste trends from similar past events.
2. ❌ The system shall expose recommendations via an API endpoint returning item name, recommended quantity, and confidence level.
