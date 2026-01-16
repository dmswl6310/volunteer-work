# Volunteer Platform (봉사활동 플랫폼)

A mobile-first volunteer service platform built with Next.js and Supabase.

## Features
- **User Authentication**: Sign up/login with email (Admin approval required).
- **Volunteer Board**: Browse activities with Infinite Scroll, Filter by Latest/Popular.
- **Applications**: Users can apply for activities; Admins approve/reject.
- **Reviews**: Approved participants can write reviews.
- **My Page**: Track applications and scrapped (bookmarked) activities.
- **Admin Dashboard**: Manage users and applications.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Server Actions

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file with the following variables:
    ```env
    DATABASE_URL="postgresql://..."
    DIRECT_URL="postgresql://..."
    NEXT_PUBLIC_SUPABASE_URL="https://..."
    NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
    ```

3.  **Run Locally**
    ```bash
    npm run dev
    ```

## Deployment (Vercel)

This project is optimized for deployment on Vercel.

1.  Push this repository to GitHub.
2.  Login to [Vercel](https://vercel.com) and "Import Project".
3.  Select your GitHub repository.
4.  Adding Environment Variables:
    - Copy the values from your local `.env` file into the Vercel Project Settings.
5.  Click **Deploy**.

## Deployment (Database)
Ensure your Supabase database is accessible from Vercel (0.0.0.0/0 or Vercel IP listed).
Run migration if needed:
```bash
npx prisma migrate deploy
```
