import type { GoalStep } from "@/types/types";

// Goal templates based on common career/academic goals
const goalTemplates: Record<string, { steps: Omit<GoalStep, "id" | "completed" | "current">[] }> = {
  "software engineer": {
    steps: [
      { title: "Master Core Programming", description: "Build strong foundation in data structures and algorithms", deadline: "Week 2", estimatedDays: 14 },
      { title: "Build Portfolio Projects", description: "Create 3-5 substantial projects showcasing your skills", deadline: "Month 1", estimatedDays: 30 },
      { title: "Learn System Design", description: "Understand scalable architecture patterns", deadline: "Month 2", estimatedDays: 60 },
      { title: "Contribute to Open Source", description: "Make meaningful contributions to popular projects", deadline: "Month 2", estimatedDays: 60 },
      { title: "Practice Coding Interviews", description: "Solve 100+ LeetCode problems", deadline: "Month 3", estimatedDays: 90 },
      { title: "Build Online Presence", description: "Create tech blog and engage on LinkedIn", deadline: "Month 3", estimatedDays: 90 },
      { title: "Network with Engineers", description: "Connect with 50+ professionals in target companies", deadline: "Month 4", estimatedDays: 120 },
      { title: "Apply to Companies", description: "Submit applications to target companies", deadline: "Month 4", estimatedDays: 120 },
      { title: "Ace Technical Interviews", description: "Complete mock interviews and prepare behavioral answers", deadline: "Month 5", estimatedDays: 150 },
      { title: "Negotiate and Accept Offer", description: "Review offers, negotiate terms, and start your journey", deadline: "Month 6", estimatedDays: 180 },
    ],
  },
  "data scientist": {
    steps: [
      { title: "Learn Python & Statistics", description: "Master Python, NumPy, Pandas, and statistical foundations", deadline: "Week 3", estimatedDays: 21 },
      { title: "Data Visualization Mastery", description: "Excel at Matplotlib, Seaborn, and Tableau", deadline: "Month 1", estimatedDays: 30 },
      { title: "Machine Learning Fundamentals", description: "Understand supervised and unsupervised learning", deadline: "Month 2", estimatedDays: 60 },
      { title: "Deep Learning Introduction", description: "Learn neural networks with TensorFlow/PyTorch", deadline: "Month 3", estimatedDays: 90 },
      { title: "Complete Kaggle Competitions", description: "Participate in 3+ competitions and aim for top 20%", deadline: "Month 3", estimatedDays: 90 },
      { title: "Build Data Science Portfolio", description: "Create end-to-end projects with real datasets", deadline: "Month 4", estimatedDays: 120 },
      { title: "Learn SQL & Big Data", description: "Master SQL and intro to Spark/Hadoop", deadline: "Month 4", estimatedDays: 120 },
      { title: "Deploy ML Models", description: "Learn MLOps basics and model deployment", deadline: "Month 5", estimatedDays: 150 },
      { title: "Prepare for DS Interviews", description: "Practice case studies and technical questions", deadline: "Month 5", estimatedDays: 150 },
      { title: "Land Data Science Role", description: "Apply, interview, and secure your position", deadline: "Month 6", estimatedDays: 180 },
    ],
  },
  "default": {
    steps: [
      { title: "Define Clear Objectives", description: "Break down your goal into measurable milestones", deadline: "Week 1", estimatedDays: 7 },
      { title: "Skill Gap Analysis", description: "Identify skills you need to develop", deadline: "Week 2", estimatedDays: 14 },
      { title: "Create Learning Plan", description: "Find resources and create a structured curriculum", deadline: "Week 3", estimatedDays: 21 },
      { title: "Build Foundation Skills", description: "Focus on core competencies required", deadline: "Month 1", estimatedDays: 30 },
      { title: "Start Practical Projects", description: "Apply learning through hands-on experience", deadline: "Month 2", estimatedDays: 60 },
      { title: "Seek Mentorship", description: "Connect with professionals in your target field", deadline: "Month 2", estimatedDays: 60 },
      { title: "Build Portfolio", description: "Document your work and achievements", deadline: "Month 3", estimatedDays: 90 },
      { title: "Expand Network", description: "Attend events and connect with industry peers", deadline: "Month 4", estimatedDays: 120 },
      { title: "Gain Experience", description: "Internships, freelance, or volunteer work", deadline: "Month 5", estimatedDays: 150 },
      { title: "Achieve Your Goal", description: "Put everything together and reach your target", deadline: "Month 6", estimatedDays: 180 },
    ],
  },
};

// Keywords to match goals to templates
const goalKeywords: Record<string, string[]> = {
  "software engineer": ["software", "developer", "engineer", "programming", "coding", "full stack", "frontend", "backend", "web developer"],
  "data scientist": ["data science", "data scientist", "machine learning", "ml", "ai", "artificial intelligence", "data analyst", "analytics"],
};

function matchGoalToTemplate(goal: string): string {
  const lowerGoal = goal.toLowerCase();
  
  for (const [templateKey, keywords] of Object.entries(goalKeywords)) {
    if (keywords.some(keyword => lowerGoal.includes(keyword))) {
      return templateKey;
    }
  }
  
  return "default";
}

function customizeStepsWithSkills(steps: Omit<GoalStep, "id" | "completed" | "current">[], skills: string[]): Omit<GoalStep, "id" | "completed" | "current">[] {
  // If user already has certain skills, adjust the steps
  const hasAdvancedSkills = skills.some(s => 
    ["React", "Node.js", "Python", "Machine Learning", "AI/ML", "Docker"].includes(s)
  );
  
  if (hasAdvancedSkills) {
    // Shorten early learning steps for advanced users
    return steps.map((step, index) => {
      if (index < 3) {
        return {
          ...step,
          description: step.description + " (accelerated - leverage existing skills)",
          estimatedDays: Math.floor(step.estimatedDays * 0.7),
        };
      }
      return step;
    });
  }
  
  return steps;
}

export function generateGoalSteps(goal: string, skills: string[]): GoalStep[] {
  const templateKey = matchGoalToTemplate(goal);
  const template = goalTemplates[templateKey] || goalTemplates["default"];
  
  const customizedSteps = customizeStepsWithSkills(template.steps, skills);
  
  return customizedSteps.map((step, index) => ({
    ...step,
    id: index + 1,
    completed: false,
    current: index === 0, // First step is current by default
  }));
}

// Generate improvement areas based on skills and goal
export function generateImprovementAreas(goal: string, skills: string[]) {
  const templateKey = matchGoalToTemplate(goal);
  
  const improvementSuggestions: Record<string, { skill: string; priority: "high" | "medium" | "low"; recommendation: string }[]> = {
    "software engineer": [
      { skill: "Data Structures", priority: "high", recommendation: "Practice daily coding challenges on LeetCode or HackerRank" },
      { skill: "System Design", priority: "high", recommendation: "Study distributed systems and design patterns" },
      { skill: "Communication", priority: "medium", recommendation: "Practice explaining technical concepts clearly" },
      { skill: "Problem Solving", priority: "high", recommendation: "Work on algorithmic thinking and optimization" },
    ],
    "data scientist": [
      { skill: "Statistics", priority: "high", recommendation: "Deep dive into probability and statistical inference" },
      { skill: "Python", priority: "high", recommendation: "Master pandas, numpy, and scikit-learn" },
      { skill: "SQL", priority: "medium", recommendation: "Practice complex queries and window functions" },
      { skill: "Visualization", priority: "medium", recommendation: "Learn to tell stories with data" },
    ],
    "default": [
      { skill: "Critical Thinking", priority: "high", recommendation: "Analyze problems from multiple perspectives" },
      { skill: "Communication", priority: "high", recommendation: "Practice clear and concise expression" },
      { skill: "Time Management", priority: "medium", recommendation: "Use productivity techniques like Pomodoro" },
      { skill: "Networking", priority: "medium", recommendation: "Build genuine professional relationships" },
    ],
  };
  
  const suggestions = improvementSuggestions[templateKey] || improvementSuggestions["default"];
  
  return suggestions.map((s, index) => ({
    ...s,
    currentLevel: Math.floor(Math.random() * 40) + 30, // 30-70
    targetLevel: 90,
    trend: (["up", "up", "stable", "down"] as const)[index % 4],
  }));
}
