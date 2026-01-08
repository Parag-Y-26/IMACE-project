// User Profile Types
export interface UserProfile {
  name: string;
  skills: string[];
  goal: string;
  marksheet?: string; // Base64 encoded image or null
  marksheetName?: string; // Original filename
  linkedin: string;
}

// Goal Step for Journey Page
export interface GoalStep {
  id: number;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
  current?: boolean;
  estimatedDays: number;
}

// Study Session for Analytics
export interface StudySession {
  id: string;
  date: string; // ISO date string
  duration: number; // minutes
  focusScore: number; // 0-100
  topic?: string;
}

// YouTube Video for Classroom
export interface YouTubeVideo {
  title: string;
  videoId: string;
  thumbnail: string;
}

// Classroom Note from Lecture Mode
export interface ClassroomNote {
  id: string;
  title: string;
  content: string; // Formatted notes
  transcription: string; // Raw transcription
  topics: string[];
  youtubeVideos: YouTubeVideo[];
  createdAt: string;
}

// User Analytics calculated from sessions
export interface UserAnalytics {
  totalStudyMinutes: number;
  weeklyMinutes: number[]; // Last 7 days [Mon, Tue, ...]
  averageFocusScore: number;
  currentStreak: number; // Days in a row with study
  longestStreak: number;
  achievementsUnlocked: string[];
}

// Achievement definitions
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (analytics: UserAnalytics) => boolean;
  unlockedAt?: string;
}

// Authentication State
export interface AuthState {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  email?: string;
}

// Full User State
export interface UserState {
  auth: AuthState;
  profile: UserProfile | null;
  goalSteps: GoalStep[];
  studySessions: StudySession[];
  classroomNotes: ClassroomNote[];
  analytics: UserAnalytics;
}

// Skill Categories
export const SKILL_CATEGORIES = {
  programming: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "React",
    "Node.js",
    "SQL",
    "Git",
    "Docker",
  ],
  design: [
    "UI/UX Design",
    "Figma",
    "Adobe XD",
    "Photoshop",
    "Illustrator",
    "Graphic Design",
    "Web Design",
  ],
  softSkills: [
    "Communication",
    "Leadership",
    "Problem Solving",
    "Critical Thinking",
    "Teamwork",
    "Time Management",
    "Creativity",
  ],
  academic: [
    "Research",
    "Technical Writing",
    "Data Analysis",
    "Mathematics",
    "Statistics",
    "Machine Learning",
    "AI/ML",
  ],
  business: [
    "Project Management",
    "Marketing",
    "Finance",
    "Entrepreneurship",
    "Business Strategy",
    "Public Speaking",
  ],
} as const;

// Flatten all skills for easy access
export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

// Improvement Areas based on skills
export interface ImprovementArea {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  trend: "up" | "down" | "stable";
  priority: "high" | "medium" | "low";
  recommendation: string;
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_session",
    title: "First Steps",
    description: "Complete your first study session",
    icon: "🎯",
    condition: (a) => a.totalStudyMinutes > 0,
  },
  {
    id: "hour_milestone",
    title: "Hour Hero",
    description: "Study for 1 hour total",
    icon: "⏰",
    condition: (a) => a.totalStudyMinutes >= 60,
  },
  {
    id: "five_hours",
    title: "Dedicated Learner",
    description: "Study for 5 hours total",
    icon: "📚",
    condition: (a) => a.totalStudyMinutes >= 300,
  },
  {
    id: "streak_3",
    title: "On Fire",
    description: "Maintain a 3-day study streak",
    icon: "🔥",
    condition: (a) => a.currentStreak >= 3,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day study streak",
    icon: "💪",
    condition: (a) => a.currentStreak >= 7,
  },
  {
    id: "focus_master",
    title: "Focus Master",
    description: "Average 80%+ focus score",
    icon: "🧠",
    condition: (a) => a.averageFocusScore >= 80,
  },
];
