export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  classId?: string;
  avatar?: string;
  school?: string;
  isFirstLogin?: boolean;
  budget?: number;
  budgetUsed?: number;
  budgetPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isActive?: boolean;
  customBudget?: number; // personal override
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
  schoolYear?: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  uploadedAt: Date;
  size: number;
  type: string;
}

export interface AssignmentDocument {
  id: string;
  name: string;
  url?: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface TutorConfig {
  id: string;
  name: string;
  subject: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  knowledgeFiles: KnowledgeDocument[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  isEnabled: boolean;
  status: 'draft' | 'published';
  assignedClasses: string[];
  assignedStudents: string[];
  icon: string;
  color: string;
  didacticMode?: 'socratic' | 'hints' | 'step-by-step' | 'concise';
  safetyRules?: {
    noPersonalData: boolean;
    noFullSolutions: boolean;
  };
  showSources?: boolean;
  hideKnowledgeBase?: boolean;
  expiresAt?: Date;
  assignment?: string;
  assignmentDocuments?: AssignmentDocument[];
  visibility?: 'private' | 'internal' | 'public';
  internalVisibility?: 'groups' | 'allTeachers';
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  attachments?: ChatAttachment[];
  feedback?: 'positive' | 'negative';
}

export interface Chat {
  id: string;
  title: string;
  tutorId: string | null;
  modelId?: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isTemporary: boolean;
  schoolYear: string;
  attachments?: ChatAttachment[];
}

export interface ChatFolder {
  subject: string;
  tutors: {
    tutorId: string;
    tutorName: string;
    chats: Chat[];
  }[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  createdAt: Date;
  budget?: number;
  budgetPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  warningThreshold?: number;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  maxIndividualBudget?: number;
  budgetPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  warningThreshold?: number;
  memberIds?: string[];
}

export interface BudgetConfig {
  id: string;
  type: 'role' | 'class' | 'group' | 'user';
  targetId: string;
  targetName: string;
  totalLimit: number;
  individualLimit?: number;
  used: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  warningThreshold: number;
}

export interface CostEntry {
  id: string;
  userId: string;
  userName: string;
  tutorId: string;
  tutorName: string;
  model: string;
  tokens: number;
  cost: number;
  timestamp: Date;
}

export interface GlobalSettings {
  systemPrompt: string;
  lastModifiedBy: string;
  lastModifiedAt: Date;
}

export interface AIModel {
  id: string;
  name: string;
  providerId: string;
  description?: string;
  costPer1kTokens: number;
  maxTokens: number;
  isEnabled: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  apiKeyConfigured: boolean;
  isEnabled: boolean;
  models: AIModel[];
}