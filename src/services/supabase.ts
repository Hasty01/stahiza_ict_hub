/**
 * Supabase Data Service
 * Initializing Supabase client and maintaining mock logic for instant preview availability.
 */

import { createClient } from "@supabase/supabase-js";
import { UserProfile, Role, UserStatus, Project, AppEvent, Announcement, Challenge, ChallengeSubmission } from "../types";

// Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only initialize Supabase if credentials are provided. 
// If missing, the app will continue to function using the mock LocalStorage logic below.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Initialize Supabase Auth listener if available
if (supabase) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      // Check if we already have a user in memory or storage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
         const profile: UserProfile = {
          uid: session.user.id,
          email: session.user.email!,
          displayName: session.user.user_metadata?.username || session.user.email!.split('@')[0],
          role: session.user.email === ADMIN_EMAIL ? "admin" : "student",
          status: session.user.email === ADMIN_EMAIL ? "approved" : "approved",
          points: 0,
          photoURL: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        };
        _currentUser = profile;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        window.dispatchEvent(new Event("auth_change"));
      }
    } else if (event === 'SIGNED_OUT') {
      _currentUser = null;
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("auth_change"));
    }
  });
}

export const db = supabase; // Standard alias for DB operations

export const ADMIN_EMAIL = "hastyjoel1@gmail.com";

// Mock User State
let _currentUser: UserProfile | null = null;
const STORAGE_KEY = "stahiza_user";
const USERS_LIST_KEY = "stahiza_users_list";
const PROJECTS_KEY = "stahiza_projects";
const EVENTS_KEY = "stahiza_events";
const ANNOUNCEMENTS_KEY = "stahiza_announcements";
const CHALLENGES_KEY = "stahiza_challenges";
const SUBMISSIONS_KEY = "stahiza_submissions";

// Initial Challenges
const initialChallenges: Challenge[] = [
  {
    id: "c1",
    title: "Responsive Portfolio Challenge",
    description: "Build a single-page responsive portfolio using only HTML and Tailwind CSS. Must include a mobile-friendly navigation bar and a contact section.",
    difficulty: "Easy",
    points: 500,
    tags: ["Frontend", "Tailwind", "Responsive"],
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  },
  {
    id: "c2",
    title: "Supabase Authentication Hack",
    description: "Implement a full sign-up and login flow with email confirmation using Supabase Auth. Bonus points for adding a custom user profile update feature.",
    difficulty: "Medium",
    points: 1200,
    tags: ["Auth", "Backend", "Supabase"],
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  },
  {
    id: "c3",
    title: "AI Chatbot with Gemini",
    description: "Create an interactive chatbot that uses the Gemini API to help students find school resources. Must support streaming responses.",
    difficulty: "Hard",
    points: 2500,
    tags: ["AI", "API", "React"],
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  }
];

if (!localStorage.getItem(CHALLENGES_KEY)) {
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(initialChallenges));
}

if (!localStorage.getItem(SUBMISSIONS_KEY)) {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([]));
}

// ... existing code ...

export const getChallenges = async (): Promise<Challenge[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const stored = localStorage.getItem(CHALLENGES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const createChallenge = async (data: Omit<Challenge, "id" | "createdAt">): Promise<Challenge> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const challenges = await getChallenges();
  const newChallenge: Challenge = {
    ...data,
    id: "ch-" + Math.random().toString(36).substr(2, 9),
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };
  challenges.unshift(newChallenge);
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  window.dispatchEvent(new Event("challenges_change"));
  return newChallenge;
};

export const deleteChallenge = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const challenges = await getChallenges();
  const filtered = challenges.filter(c => c.id !== id);
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event("challenges_change"));
};

export const useChallenges = (setChallenges: (c: Challenge[]) => void) => {
  const handler = async () => {
    const c = await getChallenges();
    setChallenges(c);
  };
  window.addEventListener("challenges_change", handler);
  getChallenges().then(setChallenges);
  return () => window.removeEventListener("challenges_change", handler);
};

export const getSubmissions = async (): Promise<ChallengeSubmission[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const stored = localStorage.getItem(SUBMISSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const submitChallengeSolution = async (submission: Omit<ChallengeSubmission, "id" | "status" | "pointsAwarded" | "createdAt">): Promise<ChallengeSubmission> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const submissions = await getSubmissions();
  
  const challenge = (await getChallenges()).find(c => c.id === submission.challengeId);
  
  const newSubmission: ChallengeSubmission = {
    ...submission,
    id: "sub-" + Math.random().toString(36).substr(2, 9),
    status: "pending",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };
  
  submissions.push(newSubmission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  window.dispatchEvent(new Event("submissions_change"));
  return newSubmission;
};

export const updateSubmissionStatus = async (submissionId: string, status: 'accepted' | 'rejected', pointsAwarded?: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const submissions = await getSubmissions();
  const index = submissions.findIndex(s => s.id === submissionId);
  
  if (index !== -1) {
    submissions[index].status = status;
    submissions[index].pointsAwarded = pointsAwarded;
    
    // If accepted, award points to user
    if (status === 'accepted' && pointsAwarded) {
      const users = await getAllUsers();
      const userIndex = users.findIndex(u => u.uid === submissions[index].userId);
      if (userIndex !== -1) {
        users[userIndex].points = (users[userIndex].points || 0) + pointsAwarded;
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
        
        // If current user, update session
        if (_currentUser && _currentUser.uid === submissions[index].userId) {
          _currentUser = { ..._currentUser, points: users[userIndex].points };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(_currentUser));
          window.dispatchEvent(new Event("auth_change"));
        }
      }
    }
    
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    window.dispatchEvent(new Event("submissions_change"));
  }
};

export const useSubmissions = (setSubmissions: (s: ChallengeSubmission[]) => void) => {
  const handler = async () => {
    const s = await getSubmissions();
    setSubmissions(s);
  };
  window.addEventListener("submissions_change", handler);
  getSubmissions().then(setSubmissions);
  return () => window.removeEventListener("submissions_change", handler);
};

// Initial Announcements
const initialAnnouncements: Announcement[] = [
  {
    id: "a1",
    title: "Welcome to the New Stahiza Hub",
    content: "We are thrilled to launch the new ICT community platform. This space is designed to empower every Stahiza student to learn, build and collaborate. Explore the dashboard, join the web dev team, and submit your first project!",
    category: "General",
    priority: "high",
    authorId: "admin-1",
    createdAt: { seconds: (Date.now() - 86400000 * 3) / 1000, nanoseconds: 0 } as any
  },
  {
    id: "a2",
    title: "Lab 1 Maintenance",
    content: "Please note that Lab 1 will be closed for server upgrades tomorrow between 2 PM and 5 PM. Remote services and the hub will remain online.",
    category: "System Update",
    priority: "medium",
    authorId: "admin-1",
    createdAt: { seconds: (Date.now() - 86400000) / 1000, nanoseconds: 0 } as any
  },
  {
    id: "a3",
    title: "Project Showcase RSVP Deadline",
    content: "Reminder to all project leads: Please confirm your attendance for next week's showcase by Friday 5 PM.",
    category: "Event Reminder",
    priority: "low",
    authorId: "admin-1",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  }
];

if (!localStorage.getItem(ANNOUNCEMENTS_KEY)) {
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(initialAnnouncements));
}

// Initial Events
const initialEvents: AppEvent[] = [
  {
    id: "e1",
    title: "Web Dev Workshop",
    description: "Hands-on session building modern landing pages with React and Tailwind CSS. Perfect for S.3 and S.4 students.",
    date: { seconds: (Date.now() + 86400000 * 2) / 1000, nanoseconds: 0 } as any, // 2 days from now
    location: "Main Computer Lab",
    organizer: "Alex Rivers",
    participants: ["admin-1"],
    image: "https://picsum.photos/seed/workshop/600/400",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  },
  {
    id: "e2",
    title: "Robotics Hackathon",
    description: "24-hour challenge to build an autonomous delivery bot for the school grounds.",
    date: { seconds: (Date.now() + 86400000 * 7) / 1000, nanoseconds: 0 } as any, // 7 days from now
    location: "Science Block Annex",
    organizer: "David M.",
    participants: ["user-1"],
    image: "https://picsum.photos/seed/hackathon/600/400",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  }
];

if (!localStorage.getItem(EVENTS_KEY)) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(initialEvents));
}

// Initial Projects
const initialProjects: Project[] = [
  { 
    id: "p1",
    title: "Smart School Attendance", 
    studentName: "Joel Hasty", 
    studentId: "admin-1",
    description: "A QR-based system for tracking students using Supabase and React Native. Includes offline sync and thermal printing support.", 
    tags: ["Mobile", "Supabase", "QR"], 
    status: "approved",
    progress: 85,
    dependencies: ["React Native", "Supabase Auth", "PostgreSQL", "Zxing QR"],
    repoLink: "https://github.com/Hasty01/stahiza_ict_hub",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  },
  { 
    id: "p2",
    title: "Stahiza AI Assistant", 
    studentName: "Sarah Johnson", 
    studentId: "user-1",
    description: "NLP powered chatbot for school orientation using Gemini Flash API. Features voice recognition and multi-language support.", 
    tags: ["AI", "Web", "Gemini"], 
    status: "approved",
    progress: 60,
    dependencies: ["React", "Google GenAI SDK", "Tailwind CSS", "Web Speech API"],
    repoLink: "https://github.com/Hasty01/stahiza_ict_hub",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  }
];

if (!localStorage.getItem(PROJECTS_KEY)) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects));
}

// ... existing code ...

export const getProjects = async (): Promise<Project[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const stored = localStorage.getItem(PROJECTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const submitProject = async (projectData: Omit<Project, "id" | "status" | "createdAt">): Promise<Project> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const projects = await getProjects();
  
  const newProject: Project = {
    ...projectData,
    id: "proj-" + Math.random().toString(36).substr(2, 9),
    status: "pending",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };
  
  projects.push(newProject);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event("projects_change"));
  return newProject;
};

export const updateProjectStatus = async (projectId: string, status: "approved" | "pending"): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects[index].status = status;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event("projects_change"));
  }
};

export const useProjects = (setProjects: (p: Project[]) => void) => {
  const handler = async () => {
    const p = await getProjects();
    setProjects(p);
  };
  window.addEventListener("projects_change", handler);
  getProjects().then(setProjects);
  return () => window.removeEventListener("projects_change", handler);
};

export const getEvents = async (): Promise<AppEvent[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const stored = localStorage.getItem(EVENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const rsvpToEvent = async (eventId: string, userId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const events = await getEvents();
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    const isSignedUp = events[index].participants.includes(userId);
    if (isSignedUp) {
      events[index].participants = events[index].participants.filter(id => id !== userId);
    } else {
      events[index].participants.push(userId);
    }
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event("events_change"));
  }
};

export const createEvent = async (eventData: Omit<AppEvent, "id" | "participants" | "createdAt">): Promise<AppEvent> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const events = await getEvents();
  const newEvent: AppEvent = {
    ...eventData,
    id: "event-" + Math.random().toString(36).substr(2, 9),
    participants: [],
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };
  events.push(newEvent);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event("events_change"));
  return newEvent;
};

export const useEvents = (setEvents: (e: AppEvent[]) => void) => {
  const handler = async () => {
    const e = await getEvents();
    setEvents(e);
  };
  window.addEventListener("events_change", handler);
  getEvents().then(setEvents);
  return () => window.removeEventListener("events_change", handler);
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const stored = localStorage.getItem(ANNOUNCEMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const createAnnouncement = async (data: Omit<Announcement, "id" | "createdAt">): Promise<Announcement> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const announcements = await getAnnouncements();
  const newAnnouncement: Announcement = {
    ...data,
    id: "ann-" + Math.random().toString(36).substr(2, 9),
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };
  announcements.unshift(newAnnouncement);
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  window.dispatchEvent(new Event("announcements_change"));
  return newAnnouncement;
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const announcements = await getAnnouncements();
  const filtered = announcements.filter(a => a.id !== id);
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event("announcements_change"));
};

export const useAnnouncements = (setAnnouncements: (a: Announcement[]) => void) => {
  const handler = async () => {
    const a = await getAnnouncements();
    setAnnouncements(a);
  };
  window.addEventListener("announcements_change", handler);
  getAnnouncements().then(setAnnouncements);
  return () => window.removeEventListener("announcements_change", handler);
};

// Initialize mock users if none exist
const initialUsers: UserProfile[] = [
  {
    uid: "admin-1",
    email: ADMIN_EMAIL,
    displayName: "Joel Hasty",
    role: "admin",
    status: "approved",
    vclass: "Admin",
    points: 42500,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=Joel`,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  },
  {
    uid: "user-1",
    email: "sarah.j@school.edu",
    displayName: "Sarah Johnson",
    role: "student",
    status: "approved",
    vclass: "S.4 Science",
    points: 38400,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  },
  {
    uid: "user-2",
    email: "leo.k@school.edu",
    displayName: "Leo K.",
    role: "student",
    status: "pending",
    vclass: "S.3 Arts",
    points: 29100,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=Leo`,
    createdAt: { seconds: (Date.now() - 86400000) / 1000, nanoseconds: 0 } as any
  }
];

if (!localStorage.getItem(USERS_LIST_KEY)) {
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(initialUsers));
}

const getStoredUsers = (): UserProfile[] => {
  const stored = localStorage.getItem(USERS_LIST_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveStoredUsers = (users: UserProfile[]) => {
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
};

// Initialize from storage
const savedUser = localStorage.getItem(STORAGE_KEY);
if (savedUser) {
  try {
    _currentUser = JSON.parse(savedUser);
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const auth = {
  get currentUser() { return _currentUser; }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return getStoredUsers();
};

export const updateUserByAdmin = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const users = getStoredUsers();
  const index = users.findIndex(u => u.uid === uid);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveStoredUsers(users);
    
    // If the updated user is the current user, sync their profile
    if (_currentUser && _currentUser.uid === uid) {
      _currentUser = users[index];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_currentUser));
      window.dispatchEvent(new Event("auth_change"));
    }
  }
};

// export const db = {}; // Mock DB object (Now handled by Supabase client)

export const loginWithGoogle = async (): Promise<UserProfile> => {
  // Simulate Google Login delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For demo purposes, we'll use a mocked profile based on the request
  const mockProfile: UserProfile = {
    uid: "mock-user-" + Math.random().toString(36).substr(2, 9),
    email: ADMIN_EMAIL, // Log in as admin for the user's convenience in preview
    displayName: "Stahiza Lead",
    role: "admin",
    status: "approved",
    points: 42500,
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=stahiza",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };

  _currentUser = mockProfile;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProfile));
  window.dispatchEvent(new Event("auth_change"));
  return mockProfile;
};

export const loginWithCredentials = async (email: string, password?: string): Promise<UserProfile> => {
  if (supabase && password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    if (data.user) {
      // In a real app, we would fetch the profile from a 'profiles' table
      // For now, we'll sync with our mock system
      const mockProfile: UserProfile = {
        uid: data.user.id,
        email: data.user.email!,
        displayName: data.user.email!.split('@')[0],
        role: data.user.email === ADMIN_EMAIL ? "admin" : "student",
        status: data.user.email === ADMIN_EMAIL ? "approved" : "pending",
        points: (data.user.user_metadata as any)?.points || 0,
        photoURL: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };
      _currentUser = mockProfile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProfile));
      window.dispatchEvent(new Event("auth_change"));
      return mockProfile;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Use existing user from localStorage if exists, or create a mock one
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    const user = JSON.parse(existing);
    if (user.email === email) {
      _currentUser = user;
      window.dispatchEvent(new Event("auth_change"));
      return user;
    }
  }

  const mockProfile: UserProfile = {
    uid: "mock-user-" + Math.random().toString(36).substr(2, 9),
    email,
    displayName: email.split('@')[0],
    role: email === ADMIN_EMAIL ? "admin" : "student",
    status: email === ADMIN_EMAIL ? "approved" : "pending",
    points: 0,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };

  _currentUser = mockProfile;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProfile));
  window.dispatchEvent(new Event("auth_change"));
  return mockProfile;
};

export const registerUser = async (data: { email: string, username: string, vclass: string, password?: string }): Promise<UserProfile> => {
  if (supabase && data.password) {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            vclass: data.vclass,
            display_name: data.username, // some triggers look for this
            full_name: data.username,    // some triggers look for this
          }
        }
      });

      if (error) {
        // Handle the specific "Database error saving new user" message from Supabase
        if (error.message.includes("Database error saving new user")) {
          throw new Error("Supabase Database Error: This usually means you have a broken trigger or are missing a 'profiles' table in your Supabase project. Check your SQL triggers.");
        }
        throw error;
      }
      
      if (authData.user) {
        const profile: UserProfile = {
          uid: authData.user.id,
          email: data.email,
          displayName: data.username,
          role: data.email === ADMIN_EMAIL ? "admin" : "student",
          status: data.email === ADMIN_EMAIL ? "approved" : "pending",
          vclass: data.vclass,
          points: 0,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        };
        
        // Optional: Attempt to sync to a 'profiles' table handled separately to not block
        // if the trigger doesn't exist.
        try {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: data.email,
            display_name: data.username,
            role: profile.role,
            status: profile.status,
            vclass: data.vclass,
            points: 0
          });
        } catch (e) {
          console.warn("Failed to write to profiles table, but Auth succeeded:", e);
        }

        _currentUser = profile;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        
        const users = getStoredUsers();
        if (!users.find(u => u.uid === profile.uid)) {
          users.push(profile);
          saveStoredUsers(users);
        }
        window.dispatchEvent(new Event("auth_change"));
        return profile;
      }
    } catch (err: any) {
      console.error("Registration Error Handler:", err);
      throw err;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  const profile: UserProfile = {
    uid: "user-" + Math.random().toString(36).substr(2, 9),
    email: data.email,
    displayName: data.username,
    role: data.email === ADMIN_EMAIL ? "admin" : "student",
    status: data.email === ADMIN_EMAIL ? "approved" : "pending",
    vclass: data.vclass,
    points: 0,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };

  _currentUser = profile;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  
  // Add to global list if not already there
  const users = getStoredUsers();
  if (!users.find(u => u.uid === profile.uid)) {
    users.push(profile);
    saveStoredUsers(users);
  }

  window.dispatchEvent(new Event("auth_change"));
  return profile;
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (!_currentUser) throw new Error("Not authenticated");

  const updated = { ..._currentUser, ...updates };
  _currentUser = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("auth_change"));
  return updated;
};

export const logout = async () => {
  if (supabase) {
    await supabase.auth.signOut();
  }
  _currentUser = null;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("auth_change"));
};

export const useAuthProfile = (setUser: (u: UserProfile | null) => void) => {
  const handler = () => setUser(_currentUser);
  window.addEventListener("auth_change", handler);
  
  // Initial sync
  setUser(_currentUser);
  
  return () => window.removeEventListener("auth_change", handler);
};
