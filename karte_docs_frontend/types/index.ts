export type Role = 'ROLE_MEDICAL' | 'ROLE_SUPPORT';

export type TargetAudience = 'MEDICAL' | 'SUPPORT';

export type QuestionStatus = 'WAITING' | 'ANSWERED' | 'PUBLISHED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Tutorial {
  id: number;
  title: string;
  content: string;
  targetAudience: TargetAudience;
  currentVersionNumber: number;
  likeCount?: number;
  dislikeCount?: number;
  isBookmarked?: boolean;
  userReaction?: 'LIKE' | 'DISLIKE' | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TutorialVersion {
  id: number;
  versionNumber: number;
  title: string;
  content: string;
  changelog: string;
  createdAt: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface Question {
  id: number;
  title: string;
  content: string;
  status: QuestionStatus;
  isPublic: boolean;
  authorEmail: string;
  answer?: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  staffEmail: string;
  action: string;
  targetEntity: string;
  details: string;
  timestamp: string;
}