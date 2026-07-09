/**
 * CodeVault Shared Types & Interfaces
 */

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  relatedTopics: string[];
  coverUrl: string;
}

export interface Note {
  id: string;
  topicId: string;
  userId: string;
  title: string;
  content: string; // Rich Text
  codeBlock: string;
  formulaSection: string;
  importantTips: string;
  references: string[];
  tags: string[];
  updatedAt: string;
}

export interface Template {
  id: string;
  topicId: string;
  userId: string;
  title: string;
  code: string;
  explanation: string;
  complexityTime: string;
  complexitySpace: string;
}

export interface Snippet {
  id: string;
  userId: string;
  title: string;
  code: string;
  language: string;
  description: string;
  tags: string[];
}

export interface Problem {
  id: string;
  topicId: string;
  userId: string;
  name: string;
  platform: string;
  link: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  status: 'Solved' | 'Attempted' | 'Unsolved';
  myCode: string;
  explanation: string;
  mistakes: string;
  betterSolution: string;
  editorialLink: string;
  videoLink: string;
  timeComplexity: string;
  spaceComplexity: string;
  dateSolved: string;
}

export interface Video {
  id: string;
  topicId: string;
  userId: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string; // parsed ID
  description: string;
  notes: string;
  timestamps: { time: string; label: string }[];
}

export interface MistakeJournal {
  id: string;
  userId: string;
  problemId: string;
  problemName: string;
  mistake: string;
  wrongApproach: string;
  correctApproach: string;
  lessonLearned: string;
  createdAt: string;
}

export interface Revision {
  id: string;
  userId: string;
  problemId: string;
  problemName: string;
  nextRevisionDate: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
}

export interface Bookmark {
  id: string;
  userId: string;
  itemType: 'topic' | 'note' | 'problem' | 'template';
  itemId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalTopics: number;
  totalProblems: number;
  totalTemplates: number;
  totalNotes: number;
  revisionCount: number;
  solvedCount: number;
  attemptedCount: number;
  unsolvedCount: number;
}

export interface RecentActivity {
  id: string;
  type: 'note' | 'problem' | 'template' | 'snippet' | 'mistake' | 'revision';
  title: string;
  detail: string;
  time: string;
}
