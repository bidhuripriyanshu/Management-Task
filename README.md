## Task Management App

Simple task manager where each user can sign up, log in, and manage their own tasks.

Built with **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**.

---

## 1. Tech stack

- **Next.js** – routing, pages, React components
- **Supabase**
  - Auth: email/password login & signup
  - Database: Postgres with Row Level Security
- **Tailwind CSS** – utility‑first styling

---

## 2. Main features

- Email/password **signup & login**
- Protected **task dashboard** (`/tasks`)
- CRUD on tasks:
  - title, description, status, due date
- Status values:
  - `Todo`, `In Progress`, `Done`
- Filter by status and **sort by due date**
- Each user only sees **their own tasks**

---

## 3. Project structure

- `app/layout.js` – root layout, imports global styles
- `app/page.js` – checks auth and redirects:
  - logged in → `/tasks`
  - not logged in → `/login`
- `app/login/page.js` – login / signup form
- `app/tasks/page.js` – task list, filters, create/edit/delete
- `lib/supabase.js` – Supabase client
- `.env.local` – Supabase credentials (not committed)

---

## 4. Database & how tasks link to users

Supabase table: **`tasks`**

- `id` (`uuid`, primary key)
- `user_id` (`uuid`, references `auth.users.id`)
- `title` (`text`, required)
- `description` (`text`, optional)
- `status` (`text`, default `'Todo'`)
- `due_date` (`date`, optional)
- `created_at` (`timestamptz`, default `now()`)

**Linking tasks to users**

- When a user is logged in, the app calls `supabase.auth.getUser()` and gets `user.id`.
- Every insert uses that id:
  - `user_id: user.id`
- Every query filters by it:
  - `.eq("user_id", user.id)`

**Row Level Security**

RLS is enabled on `tasks` with policies that only allow:

- inserting when `auth.uid() = user_id`
- selecting when `auth.uid() = user_id`
- updating when `auth.uid() = user_id`
- deleting when `auth.uid() = user_id`

So even if someone changed the frontend, Supabase would still only return their own rows.

---

## 5. Auth flow

1. User visits `/login`.
2. **Sign Up** calls `supabase.auth.signUp({ email, password })`.
3. **Login** calls `supabase.auth.signInWithPassword({ email, password })`.
4. On success, Supabase stores a session in the browser and the app redirects to `/tasks`.
5. On `/` and `/tasks`, the code calls `supabase.auth.getUser()`:
   - if a user exists → continue
   - if not → redirect to `/login`

---

## 6. How the task page works

At `/tasks`:

- On mount, get the current user with `supabase.auth.getUser()`.
- Fetch tasks for that user from `tasks` table.
- Store tasks and form fields in React state.
- **Create / update**:
  - submit the form → insert or update in Supabase → refetch list
- **Delete**:
  - delete by `id` → refetch list
- **Filter and sort**:
  - local filter by `statusFilter`
  - sort by `due_date` based on selected order

---

## 7. Running locally

1. Install dependencies:

```bash
npm install
# or
pnpm install
```

2. Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the dev server:

```bash
npm run dev
# or
pnpm dev
```

4. Open `http://localhost:3000` in the browser.
   - You’ll be redirected to `/login` if not authenticated, or `/tasks` if you already have a session.

---

## 8. Deployment (Vercel)

- Push the repo to GitHub.
- Create a new project on Vercel from that repo.
- In Vercel project settings, add:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy and test login + task operations with two different user accounts.

