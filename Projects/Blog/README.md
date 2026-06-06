# Blog

Blog is a clean React blog application built with Vite, Tailwind CSS, Redux Toolkit, React Router, React Hook Form, TinyMCE, and Appwrite. It supports user authentication, creating posts, editing posts, deleting posts, image uploads, protected routes, and light/dark theme switching through `ThemeContext`.

## Features

- User signup, login, logout, and session restore with Appwrite Auth
- Create, edit, read, and delete blog posts
- Featured image upload through Appwrite Storage
- Rich text editing with TinyMCE
- Protected routes for authenticated actions
- Responsive blog card grid
- Light and dark mode using Tailwind CSS and `ThemeContext`
- Redux auth state management

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- React Router
- Redux Toolkit
- Appwrite
- React Hook Form
- TinyMCE

## Setup

1. Clone the project.

```bash
git clone <your-repository-url>
cd Blog
```

2. Install dependencies.

```bash
npm install
```

3. Create a `.env` file in the project root with your Appwrite identifiers.

Example `.env` (replace values from your Appwrite Console):

```env
VITE_APPWRITE_URL=https://[YOUR_APPWRITE_ENDPOINT]
VITE_APPWRITE_PROJECT_ID=[YOUR_PROJECT_ID]
VITE_APPWRITE_DATABASE_ID=[YOUR_DATABASE_ID]
VITE_APPWRITE_COLLECTION_ID=[YOUR_COLLECTION_ID]
VITE_APPWRITE_BUCKET_ID=[YOUR_BUCKET_ID]
```

These Appwrite values are read in [src/config/config.js](src/config/config.js#L1-L6). Vite exposes env vars that start with `VITE_` to the client — do not put server-only secrets in client-side envs.

4. Start the development server.

```bash
npm run dev
```

5. Build for production.

```bash
npm run build
```

6. Preview the production build locally.

```bash
npm run preview
```

## Appwrite Configuration

Your Appwrite project should include:

- Auth enabled for email/password sessions
- A database with the ID from `VITE_APPWRITE_DATABASE_ID`
- A collection named or identified by `VITE_APPWRITE_COLLECTION_ID`
- A storage bucket with the ID from `VITE_APPWRITE_BUCKET_ID`

The blog collection should support these fields:

- `title`
- `content`
- `featuredImage`
- `status`
- `userId`

If you want to review how the app initializes Appwrite, see the client wrapper at [src/appwrite/confi.js](src/appwrite/confi.js#L1-L20).

**CORS / Domains**: In Appwrite Project settings allow requests from your dev URL (default `http://localhost:5173`).

**.env.example**: Consider adding a `.env.example` (without real values) to the repo to document required env vars.

The blog collection should support these fields:

- `title`
- `content`
- `featuredImage`
- `status`
- `userId`

Recommended `status` values are `active` and `inactive`.


## Project Structure

```text
src/
  appwrite/        Appwrite auth and database/storage services
  components/      Shared UI components
  context/         Theme context
  pages/           Route pages
  store/           Redux store and auth slice
  config/          Environment config wrapper
```
