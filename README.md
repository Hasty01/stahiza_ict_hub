🚀 STAHIZA ICT Hub: Management Portal
Welcome to the official repository for the Standard High School Zzana (STAHIZA) ICT Hub management system. This platform is designed to streamline member onboarding, track contributions through a points system, and manage administrative approvals for our digital projects and club sessions.

🛠 Features for STAHIZA
🔐 Secure Member Onboarding
To maintain the security and integrity of our Hub, we utilize a Strict Approval Flow:

Registration: New members sign in via Google or Email credentials.

Access Pending: All new accounts are restricted by default. Members will encounter an "Access Pending" screen until a Club Leader or Administrator manually verifies their profile.

Automatic Enforcement: The system performs real-time checks; if a user is not yet approved, they are programmatically restricted from accessing internal Hub resources.

🏆 Role-Based Experience
The application interface dynamically adapts based on your designated role within the STAHIZA ICT Club:

Admins/Leaders: Full access to the Member Management Dashboard to approve new users and oversee club data.

Mentors: Access to specialized views for guiding technical projects and managing member progress.

Members: Personal dashboard to view earned points and access club-exclusive learning materials.

📊 Points & Progress Tracking
The system is integrated with a Supabase backend to monitor member growth:

Project Contributions: Track participation in Python programming and web development tasks.

Real-time Sync: Point totals and role updates are synchronized instantly across all devices.

⚙️ Technical Setup for Club Admins
1. Database Schema
Ensure the profiles table in Supabase is configured with the following fields:

id: (UUID) Primary key, linking to Supabase Auth.

role: (Text) Categorized as admin, mentor, or member.

approved: (Boolean) Crucial. Set to false by default for all new sign-ups.

points: (Integer) Initialized at 0.

2. Enabling Google Login
To facilitate easy access for STAHIZA members:

Navigate to the Supabase Dashboard > Authentication > Providers.

Locate Google and toggle it to Enabled.

Input the Client ID and Secret generated from the Google Cloud Console.

Ensure the Redirect URI in your Google Cloud settings matches your Supabase callback URL.

📂 Project Structure
src/services/supabase.ts: Handles the connection to our cloud database and manages authentication states.

src/App.tsx: The primary logic gate—verifies approval status before granting entry to the Hub.

src/views/LoginView.tsx: The member entry point, featuring error handling for common authentication issues.

⚠️ Troubleshooting
If a member receives a "Provider not enabled" message during sign-in, an Administrator must verify that the Google OAuth toggle is active within the Supabase settings.

Standard High School Zzana — Empowering the Next Generation of ICT Leaders.
