/**
 * Supabase Data Service
 * Initializing Supabase client and maintaining mock logic for instant preview availability.
 */

import { createClient } from "@supabase/supabase-js";
import { UserProfile, Role, UserStatus, Project, AppEvent, Announcement } from "../types";

// Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const db = supabase; // Standard alias for DB operations

export const ADMIN_EMAIL = "hastyjoel1@gmail.com";

// Mock User State
let _currentUser: UserProfile | null = null;
const STORAGE_KEY = "stahiza_user";
const USERS_LIST_KEY = "stahiza_users_list";
const PROJECTS_KEY = "stahiza_projects";
const EVENTS_KEY = "stahiza_events";
const ANNOUNCEMENTS_KEY = "stahiza_announcements";

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
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=stahiza",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };

  _currentUser = mockProfile;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProfile));
  window.dispatchEvent(new Event("auth_change"));
  return mockProfile;
};

export const loginWithCredentials = async (email: string): Promise<UserProfile> => {
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
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
  };

  _currentUser = mockProfile;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProfile));
  window.dispatchEvent(new Event("auth_change"));
  return mockProfile;
};

export const registerUser = async (data: { email: string, username: string, vclass: string }): Promise<UserProfile> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const profile: UserProfile = {
    uid: "user-" + Math.random().toString(36).substr(2, 9),
    email: data.email,
    displayName: data.username,
    role: data.email === ADMIN_EMAIL ? "admin" : "student",
    status: data.email === ADMIN_EMAIL ? "approved" : "pending",
    vclass: data.vclass,
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
