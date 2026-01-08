"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  Target,
  Award,
  Lightbulb,
  CheckCircle2,
  ArrowUpRight,
  Minus,
  Zap,
  Play,
  Flame,
} from "lucide-react";
import Spotlight from "@/components/ui/spotlight";
import { useUserProfile, useGoalSteps, useAnalytics, useStudySessions } from "@/context/user-context";
import { generateImprovementAreas } from "@/lib/generate-goal-steps";
import { ACHIEVEMENTS } from "@/types/types";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const userProfile = useUserProfile();
  const { goalSteps } = useGoalSteps();
  const { analytics } = useAnalytics();
  const { sessions } = useStudySessions();

  const completedSteps = goalSteps.filter((s) => s.completed).length;
  const progressPercentage =
    goalSteps.length > 0
      ? Math.round((completedSteps / goalSteps.length) * 100)
      : 0;

  const improvementAreas = userProfile
    ? generateImprovementAreas(userProfile.goal, userProfile.skills)
    : [];

  // Calculate real study hours from sessions
  const totalHours = Math.round(analytics.totalStudyMinutes / 60 * 10) / 10;
  const weeklyHours = Math.round(analytics.weeklyMinutes.reduce((a, b) => a + b, 0) / 60 * 10) / 10;

  // Get unlocked achievements count
  const unlockedCount = analytics.achievementsUnlocked.length;

  const stats = [
    {
      icon: Clock,
      label: "Study Hours",
      value: `${totalHours}h`,
      change: weeklyHours > 0 ? `+${weeklyHours}h this week` : "Start studying!",
      trend: weeklyHours > 0 ? ("up" as const) : ("stable" as const),
      color: "#00ffff",
      glowColor: "rgba(0, 255, 255, 0.3)",
    },
    {
      icon: Target,
      label: "Goal Progress",
      value: `${progressPercentage}%`,
      change: `${completedSteps}/${goalSteps.length} steps`,
      trend: progressPercentage > 50 ? ("up" as const) : ("stable" as const),
      color: "#ff00ff",
      glowColor: "rgba(255, 0, 255, 0.3)",
    },
    {
      icon: Flame,
      label: "Study Streak",
      value: `${analytics.currentStreak}`,
      change: analytics.currentStreak > 0 ? `Best: ${analytics.longestStreak} days` : "Start a streak!",
      trend: analytics.currentStreak > 0 ? ("up" as const) : ("stable" as const),
      color: "#00ff88",
      glowColor: "rgba(0, 255, 136, 0.3)",
    },
    {
      icon: Award,
      label: "Achievements",
      value: `${unlockedCount}`,
      change: `of ${ACHIEVEMENTS.length} unlocked`,
      trend: unlockedCount > 0 ? ("up" as const) : ("stable" as const),
      color: "#8b5cf6",
      glowColor: "rgba(139, 92, 246, 0.3)",
    },
  ];

  // Convert weekly minutes to hours for chart
  const weeklyData = [
    { day: "Mon", hours: Math.round(analytics.weeklyMinutes[0] / 60 * 10) / 10, focus: 70 },
    { day: "Tue", hours: Math.round(analytics.weeklyMinutes[1] / 60 * 10) / 10, focus: 85 },
    { day: "Wed", hours: Math.round(analytics.weeklyMinutes[2] / 60 * 10) / 10, focus: 60 },
    { day: "Thu", hours: Math.round(analytics.weeklyMinutes[3] / 60 * 10) / 10, focus: 90 },
    { day: "Fri", hours: Math.round(analytics.weeklyMinutes[4] / 60 * 10) / 10, focus: 75 },
    { day: "Sat", hours: Math.round(analytics.weeklyMinutes[5] / 60 * 10) / 10, focus: 50 },
    { day: "Sun", hours: Math.round(analytics.weeklyMinutes[6] / 60 * 10) / 10, focus: 95 },
  ];

  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-[#00ff88]" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-[#ff0080]" />;
      default:
        return <Minus className="w-4 h-4 text-white/50" />;
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "text-[#ff0080] bg-[#ff0080]/10 border-[#ff0080]/30";
      case "medium":
        return "text-[#ff00ff] bg-[#ff00ff]/10 border-[#ff00ff]/30";
      default:
        return "text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30";
    }
  };

  // Check if user has any data
  const hasData = sessions.length > 0;

  return (
    <main className="relative min-h-screen p-8 overflow-hidden bg-black">
      <Spotlight />

      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              background: i % 2 === 0 ? "#00ffff" : "#ff00ff",
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-[#00ffff] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        <div className="flex-1 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold gradient-text-animated glitch-text"
          >
            Analytics Dashboard
          </motion.h1>
          {userProfile && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-sm mt-2"
            >
              Tracking progress for:{" "}
              <span className="text-[#00ffff]">{userProfile.name}</span>
            </motion.p>
          )}
        </div>
      </header>

      {/* No Data State */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 glass-neon rounded-3xl p-10 max-w-2xl mx-auto mb-10 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))",
              border: "2px solid rgba(0, 255, 255, 0.3)",
            }}
          >
            <Play className="w-10 h-10 text-[#00ffff]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">Start Your First Study Session</h2>
          <p className="text-white/50 mb-6">
            Your analytics will appear here once you start tracking your study time.
            Use the Study Timer on the home page to begin!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #00ffff, #ff00ff)",
              boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)",
            }}
          >
            <Play className="w-5 h-5" />
            Start Studying
          </Link>
        </motion.div>
      )}

      {/* 3D Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-6xl mx-auto">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: -5,
                z: 50,
              }}
              className="card-3d"
              style={{ perspective: "1000px" }}
            >
              <div
                className="glass-neon rounded-2xl p-6 h-full relative overflow-hidden"
                style={{
                  boxShadow: `0 0 30px ${stat.glowColor}, inset 0 0 20px ${stat.glowColor}`,
                }}
              >
                <div className="absolute inset-0 holographic" />

                <motion.div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 relative"
                  style={{ background: `${stat.color}15` }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div
                    className="absolute inset-0 rounded-xl animate-neon-pulse"
                    style={{
                      background: `${stat.color}10`,
                      boxShadow: `0 0 20px ${stat.color}`,
                    }}
                  />
                  <IconComponent
                    className="w-7 h-7 relative z-10"
                    style={{ color: stat.color }}
                  />
                </motion.div>

                <p className="text-white/50 text-sm mb-1 uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    className="text-3xl font-bold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    style={{ textShadow: `0 0 20px ${stat.color}` }}
                  >
                    {stat.value}
                  </motion.span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stat.trend)}
                    <span
                      className={cn(
                        "text-sm",
                        stat.trend === "up" ? "text-[#00ff88]" : "text-white/40"
                      )}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 glass-neon rounded-3xl p-8 max-w-6xl mx-auto mb-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-6 h-6 text-[#00ffff]" />
          <h2 className="text-2xl font-bold text-white">Performance Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Focus Score", value: hasData ? analytics.averageFocusScore : 0, color: "#00ffff" },
            { label: "Consistency", value: hasData ? Math.min(Math.round((analytics.currentStreak / 7) * 100), 100) : 0, color: "#ff00ff" },
            { label: "Goal Progress", value: progressPercentage, color: "#00ff88" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-32 h-32">
                <svg className="w-full h-full circular-progress">
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={item.color} />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="circular-progress-track"
                    fill="none"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke={`url(#gradient-${index})`}
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 56 * (1 - item.value / 100),
                    }}
                    transition={{ duration: 1.5, delay: 0.6 + index * 0.2 }}
                    style={{
                      filter: `drop-shadow(0 0 10px ${item.color})`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: item.color, textShadow: `0 0 15px ${item.color}` }}
                  >
                    {item.value}%
                  </span>
                </div>
              </div>
              <p className="text-white/60 mt-4 uppercase tracking-wider text-sm">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 glass-neon rounded-3xl p-8 max-w-6xl mx-auto mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-[#8b5cf6]" />
          <h2 className="text-2xl font-bold text-white">Achievements</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ACHIEVEMENTS.map((achievement, index) => {
            const isUnlocked = analytics.achievementsUnlocked.includes(achievement.id);
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={cn(
                  "p-4 rounded-2xl text-center transition-all",
                  isUnlocked
                    ? "bg-[#8b5cf6]/10 border border-[#8b5cf6]/30"
                    : "bg-white/5 border border-white/10 opacity-50"
                )}
                style={{
                  boxShadow: isUnlocked ? "0 0 20px rgba(139, 92, 246, 0.2)" : "none",
                }}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className={cn(
                  "font-semibold text-sm",
                  isUnlocked ? "text-[#8b5cf6]" : "text-white/40"
                )}>
                  {achievement.title}
                </h3>
                <p className="text-white/30 text-xs mt-1">{achievement.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Improvement Areas */}
      {improvementAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 glass-neon rounded-3xl p-8 max-w-6xl mx-auto mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lightbulb className="w-6 h-6 text-[#ff00ff]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">Points for Improvement</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {improvementAreas.map((area, index) => (
              <motion.div
                key={area.skill}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="p-5 rounded-2xl bg-black/50 border border-white/10 hover:border-[#00ffff]/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{area.skill}</h3>
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs mt-2 border font-medium",
                        getPriorityColor(area.priority)
                      )}
                    >
                      {area.priority} priority
                    </span>
                  </div>
                  {getTrendIcon(area.trend)}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/40 mb-2">
                    <span>Current: {area.currentLevel}%</span>
                    <span>Target: {area.targetLevel}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${area.currentLevel}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                      className="h-full rounded-full progress-neon"
                    />
                  </div>
                </div>

                <p className="text-white/50 text-sm">{area.recommendation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weekly Chart */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative z-10 glass-neon rounded-3xl p-8 max-w-4xl mx-auto mb-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-[#00ffff]" />
            <h2 className="text-2xl font-bold text-white">Weekly Progress</h2>
          </div>

          <div className="flex items-end justify-between gap-4 h-52">
            {weeklyData.map((item, index) => (
              <div key={item.day} className="flex flex-col items-center flex-1 group">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: item.hours > 0 ? `${(item.hours / maxHours) * 100}%` : "4px" }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6, type: "spring" }}
                  className="w-full rounded-t-xl relative overflow-hidden"
                  style={{
                    background: item.hours > 0
                      ? "linear-gradient(180deg, #00ffff 0%, #ff00ff 100%)"
                      : "rgba(255, 255, 255, 0.1)",
                    boxShadow: item.hours > 0 ? "0 0 20px rgba(0, 255, 255, 0.4)" : "none",
                    minHeight: "4px",
                  }}
                >
                  {item.hours > 0 && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent"
                      animate={{ y: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                  )}
                </motion.div>

                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black border border-[#00ffff]/50 px-3 py-2 rounded-lg text-xs text-white whitespace-nowrap z-20">
                  <span className="text-[#00ffff]">{item.hours}h</span>
                </div>

                <span className="text-white/50 text-sm mt-3 group-hover:text-[#00ffff] transition-colors">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Goal Steps Progress */}
      {goalSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 glass-neon rounded-3xl p-8 max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-[#ff00ff]" />
            <h2 className="text-2xl font-bold text-white">Goal Milestone Tracking</h2>
          </div>

          <div className="space-y-4">
            {goalSteps.slice(0, 5).map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ x: 10 }}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border",
                  step.completed
                    ? "bg-[#00ff88]/5 border-[#00ff88]/30"
                    : step.current
                      ? "bg-[#ff00ff]/5 border-[#ff00ff]/30 ring-1 ring-[#ff00ff]/30"
                      : "bg-white/5 border-white/10"
                )}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    step.completed
                      ? "bg-[#00ff88]"
                      : step.current
                        ? "bg-[#ff00ff]"
                        : "bg-white/20"
                  )}
                  style={{
                    boxShadow: step.completed
                      ? "0 0 15px #00ff88"
                      : step.current
                        ? "0 0 15px #ff00ff"
                        : "none",
                  }}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-black" />
                  ) : (
                    <span className="text-white text-sm font-bold">{step.id}</span>
                  )}
                </motion.div>
                <div className="flex-1">
                  <h3 className={cn("font-semibold", step.completed ? "text-[#00ff88]" : "text-white")}>
                    {step.title}
                  </h3>
                  <p className="text-white/40 text-sm">{step.deadline}</p>
                </div>
                {step.current && (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-4 py-1.5 rounded-full bg-[#ff00ff]/20 text-[#ff00ff] text-xs font-semibold border border-[#ff00ff]/30"
                  >
                    In Progress
                  </motion.span>
                )}
              </motion.div>
            ))}

            {goalSteps.length > 5 && (
              <Link
                href="/journey"
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 text-white/50 hover:text-[#00ffff] hover:bg-[#00ffff]/5 transition-all duration-300 border border-white/10 hover:border-[#00ffff]/30"
              >
                <span>View all {goalSteps.length} milestones</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </main>
  );
}
