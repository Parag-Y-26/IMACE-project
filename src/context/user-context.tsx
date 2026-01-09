"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import type {
  UserProfile,
  UserState,
  GoalStep,
  AuthState,
  StudySession,
  ClassroomNote,
  UserAnalytics,
} from "@/types/types";
import { generateGoalSteps } from "@/lib/generate-goal-steps";
import { ACHIEVEMENTS } from "@/types/types";

interface UserContextType {
  userState: UserState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateGoalStep: (stepId: number, completed: boolean) => void;
  addStudySession: (session: Omit<StudySession, "id">) => void;
  saveClassroomNote: (note: Omit<ClassroomNote, "id" | "createdAt">) => void;
  getAnalytics: () => UserAnalytics;
  regenerateGoalSteps: () => Promise<void>;
  isLoading: boolean;
  isGeneratingSteps: boolean;
}

const defaultAuthState: AuthState = {
  isLoggedIn: false,
  isOnboarded: false,
  email: undefined,
};

const defaultAnalytics: UserAnalytics = {
  totalStudyMinutes: 0,
  weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
  averageFocusScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  achievementsUnlocked: [],
};

const defaultUserState: UserState = {
  auth: defaultAuthState,
  profile: null,
  goalSteps: [],
  studySessions: [],
  classroomNotes: [],
  analytics: defaultAnalytics,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "campus_assistant_user";

// Helper to calculate analytics from sessions
function calculateAnalytics(sessions: StudySession[]): UserAnalytics {
  if (sessions.length === 0) {
    return defaultAnalytics;
  }

  const totalStudyMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const averageFocusScore = Math.round(
    sessions.reduce((sum, s) => sum + s.focusScore, 0) / sessions.length
  );

  // Calculate weekly minutes (last 7 days)
  const today = new Date();
  const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];
  
  sessions.forEach((session) => {
    const sessionDate = new Date(session.date);
    const diffDays = Math.floor(
      (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays >= 0 && diffDays < 7) {
      const dayIndex = (sessionDate.getDay() + 6) % 7; // Monday = 0
      weeklyMinutes[dayIndex] += session.duration;
    }
  });

  // Calculate streak
  const sessionDates = new Set(
    sessions.map((s) => new Date(s.date).toDateString())
  );
  
  let currentStreak = 0;
  let longestStreak = 0;
  let checkDate = new Date();
  
  // Check backwards from today
  while (sessionDates.has(checkDate.toDateString())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Find longest streak
  const sortedDates = Array.from(sessionDates)
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());
  
  let tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = Math.floor(
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak, 1);

  // Check achievements
  const analytics: UserAnalytics = {
    totalStudyMinutes,
    weeklyMinutes,
    averageFocusScore,
    currentStreak,
    longestStreak,
    achievementsUnlocked: [],
  };

  ACHIEVEMENTS.forEach((achievement) => {
    if (achievement.condition(analytics)) {
      analytics.achievementsUnlocked.push(achievement.id);
    }
  });

  return analytics;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<UserState>(defaultUserState);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserState;
        // Ensure new fields exist for backwards compatibility
        setUserState({
          ...defaultUserState,
          ...parsed,
          studySessions: parsed.studySessions || [],
          classroomNotes: parsed.classroomNotes || [],
          analytics: parsed.analytics || calculateAnalytics(parsed.studySessions || []),
        });
      }
    } catch (error) {
      console.error("Failed to load user state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
      } catch (error) {
        console.error("Failed to save user state:", error);
      }
    }
  }, [userState, isLoading]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (email && password) {
        setUserState((prev) => ({
          ...prev,
          auth: {
            ...prev.auth,
            isLoggedIn: true,
            email,
          },
        }));
        return true;
      }
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    setUserState(defaultUserState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const completeOnboarding = useCallback(async (profile: UserProfile) => {
    // First set the profile and mark as onboarded with local fallback steps
    const localSteps = generateGoalSteps(profile.goal, profile.skills);
    
    setUserState((prev) => ({
      ...prev,
      auth: {
        ...prev.auth,
        isOnboarded: true,
      },
      profile,
      goalSteps: localSteps,
    }));

    // Then try to get AI-generated personalized steps
    setIsGeneratingSteps(true);
    try {
      const response = await fetch("/api/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: profile.goal, skills: profile.skills }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.steps && data.steps.length > 0) {
          const aiSteps: GoalStep[] = data.steps.map((step: { title: string; description: string; deadline: string; estimatedDays: number; resources?: string[] }, index: number) => ({
            id: index + 1,
            title: step.title,
            description: step.description,
            deadline: step.deadline,
            estimatedDays: step.estimatedDays,
            resources: step.resources || [],
            completed: false,
            current: index === 0,
          }));
          
          setUserState((prev) => ({
            ...prev,
            goalSteps: aiSteps,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to generate AI steps, using local fallback:", error);
    } finally {
      setIsGeneratingSteps(false);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserState((prev) => {
      if (!prev.profile) return prev;

      const newProfile = { ...prev.profile, ...updates };

      let newGoalSteps = prev.goalSteps;
      if (updates.goal || updates.skills) {
        newGoalSteps = generateGoalSteps(newProfile.goal, newProfile.skills);
      }

      return {
        ...prev,
        profile: newProfile,
        goalSteps: newGoalSteps,
      };
    });
  }, []);

  const updateGoalStep = useCallback((stepId: number, completed: boolean) => {
    setUserState((prev) => ({
      ...prev,
      goalSteps: prev.goalSteps.map((step, index) => {
        if (step.id === stepId) {
          return { ...step, completed };
        }
        const isCurrentStep =
          !completed &&
          index ===
            prev.goalSteps.findIndex((s) => s.id === stepId) +
              (completed ? 1 : 0);
        return { ...step, current: isCurrentStep };
      }),
    }));
  }, []);

  const addStudySession = useCallback(
    (session: Omit<StudySession, "id">) => {
      const newSession: StudySession = {
        ...session,
        id: `session_${Date.now()}`,
      };

      setUserState((prev) => {
        const newSessions = [...prev.studySessions, newSession];
        const newAnalytics = calculateAnalytics(newSessions);

        return {
          ...prev,
          studySessions: newSessions,
          analytics: newAnalytics,
        };
      });
    },
    []
  );

  const saveClassroomNote = useCallback(
    (note: Omit<ClassroomNote, "id" | "createdAt">) => {
      const newNote: ClassroomNote = {
        ...note,
        id: `note_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setUserState((prev) => ({
        ...prev,
        classroomNotes: [...prev.classroomNotes, newNote],
      }));
    },
    []
  );

  const getAnalytics = useCallback(() => {
    return calculateAnalytics(userState.studySessions);
  }, [userState.studySessions]);

  const regenerateGoalSteps = useCallback(async () => {
    if (!userState.profile) return;
    
    setIsGeneratingSteps(true);
    try {
      const response = await fetch("/api/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          goal: userState.profile.goal, 
          skills: userState.profile.skills 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.steps && data.steps.length > 0) {
          const aiSteps: GoalStep[] = data.steps.map((step: { title: string; description: string; deadline: string; estimatedDays: number; resources?: string[] }, index: number) => ({
            id: index + 1,
            title: step.title,
            description: step.description,
            deadline: step.deadline,
            estimatedDays: step.estimatedDays,
            resources: step.resources || [],
            completed: false,
            current: index === 0,
          }));
          
          setUserState((prev) => ({
            ...prev,
            goalSteps: aiSteps,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to regenerate steps:", error);
    } finally {
      setIsGeneratingSteps(false);
    }
  }, [userState.profile]);

  return (
    <UserContext.Provider
      value={{
        userState,
        login,
        logout,
        completeOnboarding,
        updateProfile,
        updateGoalStep,
        addStudySession,
        saveClassroomNote,
        getAnalytics,
        regenerateGoalSteps,
        isLoading,
        isGeneratingSteps,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function useUserProfile() {
  const { userState } = useUser();
  return userState.profile;
}

export function useAuth() {
  const { userState, login, logout } = useUser();
  return {
    ...userState.auth,
    login,
    logout,
  };
}

export function useGoalSteps() {
  const { userState, updateGoalStep } = useUser();
  return {
    goalSteps: userState.goalSteps,
    updateGoalStep,
  };
}

export function useStudySessions() {
  const { userState, addStudySession } = useUser();
  return {
    sessions: userState.studySessions,
    addStudySession,
  };
}

export function useAnalytics() {
  const { userState, getAnalytics } = useUser();
  return {
    analytics: userState.analytics,
    getAnalytics,
  };
}

export function useClassroomNotes() {
  const { userState, saveClassroomNote } = useUser();
  return {
    notes: userState.classroomNotes,
    saveClassroomNote,
  };
}
