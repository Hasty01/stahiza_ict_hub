import { ReactNode } from "react";

/**
 * Generic Timestamp interface used across the app.
 * Mapped to Supabase ISO dates or local timestamps.
 */
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export type Role = "student" | "admin";
export type UserStatus = "pending" | "approved" | "suspended";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  photoURL?: string;
  vclass?: string;
  bio?: string;
  points: number;
  createdAt: Timestamp;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  studentName: string;
  studentId: string;
  tags: string[];
  status: "pending" | "approved";
  progress?: number;
  dependencies?: string[];
  repoLink?: string;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
}

export interface Chat {
  id: string;
  name: string;
  type: "direct" | "group";
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  memberCount?: number;
  updatedAt: Timestamp;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  points: number;
  badge: "Beginner" | "Coder" | "Pro" | "Legend";
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  location?: string;
  organizer?: string;
  participants: string[];
  createdAt: Timestamp;
  image?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  type: "pdf" | "link";
  createdAt: Timestamp;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'System Update' | 'Event Reminder' | 'General';
  priority: 'low' | 'medium' | 'high';
  authorId: string;
  createdAt: Timestamp;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  points: number;
  tags: string[];
  deadline?: Timestamp;
  createdAt: Timestamp;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  solutionLink: string;
  comment?: string;
  status: 'pending' | 'accepted' | 'rejected';
  pointsAwarded?: number;
  createdAt: Timestamp;
}
