# StudyStride PWA + Supabase Sync

Built for Yubaraj Yadav.

## Deploy
Upload all files to the root of your GitHub Pages repository.

## Supabase setup
1. Open Supabase → SQL Editor.
2. Run the entire `supabase-setup.sql` file.
3. Go to Authentication → Providers → Google and enable Google.
4. Configure Google OAuth credentials in Supabase.
5. In Authentication → URL Configuration:
   - Site URL: your deployed StudyStride URL
   - Add your deployed StudyStride URL to Redirect URLs
6. Redeploy these files.

## Cross-device use
Sign in with the same Google account on each device. StudyStride will sync tasks, notes, vault items, study progress, focus sessions and workout data.

## PWA
Open the deployed HTTPS website in Chrome or Brave and choose Install app. You can then pin it to the Windows taskbar.

The Supabase anon key embedded in index.html is intended for frontend use. Security is enforced by Row Level Security policies in Supabase.
