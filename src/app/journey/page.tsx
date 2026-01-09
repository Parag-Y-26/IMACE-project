"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Zap,
  Youtube,
  ExternalLink,
  Loader2,
  Play,
  Trophy,
} from "lucide-react";
import Spotlight from "@/components/ui/spotlight";
import { Timeline } from "@/components/ui/timeline";
import { useUserProfile, useGoalSteps } from "@/context/user-context";
import { cn } from "@/lib/utils";

export default function JourneyPage() {
  const userProfile = useUserProfile();
  const { goalSteps, updateGoalStep } = useGoalSteps();

  // YouTube recommendations state
  const [stepVideos, setStepVideos] = useState<
    Record<number, { title: string; searchUrl: string; topic: string }[]>
  >({});
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [loadingVideos, setLoadingVideos] = useState<Set<number>>(new Set());

  const completedSteps = goalSteps.filter((s) => s.completed).length;
  const progressPercentage =
    goalSteps.length > 0
      ? Math.round((completedSteps / goalSteps.length) * 100)
      : 0;

  const handleToggleStep = (stepId: number, currentCompleted: boolean) => {
    updateGoalStep(stepId, !currentCompleted);
  };

  // Fetch YouTube videos for a step
  const fetchVideosForStep = async (stepId: number, stepTitle: string) => {
    if (expandedSteps.has(stepId)) {
      setExpandedSteps((prev) => {
        const next = new Set(prev);
        next.delete(stepId);
        return next;
      });
      return;
    }

    if (stepVideos[stepId]) {
      setExpandedSteps((prev) => new Set(prev).add(stepId));
      return;
    }

    setLoadingVideos((prev) => new Set(prev).add(stepId));
    try {
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: [stepTitle] }),
      });
      const data = await response.json();
      setStepVideos((prev) => ({ ...prev, [stepId]: data.videos || [] }));
      setExpandedSteps((prev) => new Set(prev).add(stepId));
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoadingVideos((prev) => {
        const next = new Set(prev);
        next.delete(stepId);
        return next;
      });
    }
  };

  // Create timeline data from goal steps
  const timelineData = goalSteps.map((step, index) => ({
    title: `Step ${step.id}`,
    content: (
      <div className="mb-8">
        {/* Step Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "rounded-2xl p-6 transition-all duration-300 relative overflow-hidden",
            step.completed ? "opacity-80" : ""
          )}
          style={{
            background: step.current
              ? "linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.05))"
              : "rgba(255, 255, 255, 0.02)",
            border: step.current
              ? "1px solid rgba(255, 0, 255, 0.3)"
              : step.completed
              ? "1px solid rgba(0, 255, 136, 0.3)"
              : "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: step.current
              ? "0 0 30px rgba(255, 0, 255, 0.15)"
              : step.completed
              ? "0 0 20px rgba(0, 255, 136, 0.1)"
              : "none",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                    step.completed
                      ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30"
                      : step.current
                      ? "bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/30"
                      : "bg-white/10 text-white/40 border border-white/10"
                  )}
                >
                  {step.completed ? "Completed" : step.current ? "In Progress" : "Upcoming"}
                </span>
              </div>
              <h3
                className={cn(
                  "text-2xl font-bold mb-2",
                  step.completed
                    ? "text-[#00ff88]"
                    : step.current
                    ? "text-white"
                    : "text-white/70"
                )}
                style={{
                  textDecoration: step.completed ? "line-through" : "none",
                  textShadow: step.current
                    ? "0 0 20px rgba(255, 255, 255, 0.3)"
                    : "none",
                }}
              >
                {step.title}
              </h3>
            </div>
            <span className="text-sm text-white/30">{step.deadline}</span>
          </div>

          {/* Description */}
          <p className="text-white/60 mb-6 text-lg leading-relaxed">
            {step.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-white/40">
              <Clock className="w-5 h-5 text-[#00ffff]" />
              <span>~{step.estimatedDays} days</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Zap className="w-5 h-5 text-[#ff00ff]" />
              <span>{step.deadline}</span>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            onClick={() => handleToggleStep(step.id, step.completed)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all"
            )}
            style={{
              background: step.completed
                ? "rgba(0, 255, 136, 0.2)"
                : "linear-gradient(135deg, #ff00ff, #00ffff)",
              border: step.completed ? "1px solid rgba(0, 255, 136, 0.5)" : "none",
              boxShadow: step.completed ? "none" : "0 0 20px rgba(255, 0, 255, 0.3)",
            }}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{step.completed ? "Mark as Incomplete" : "Mark as Complete"}</span>
          </motion.button>

          {/* Current step progress bar */}
          {step.current && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm text-white/40 mb-2">
                <span>Progress</span>
                <span className="text-[#ff00ff]">In Progress</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "35%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-2 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #ff00ff, #00ffff)",
                    boxShadow: "0 0 10px rgba(255, 0, 255, 0.5)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Final step celebration */}
          {index === goalSteps.length - 1 && step.completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))",
                border: "1px solid rgba(255, 0, 255, 0.3)",
              }}
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-[#ff00ff]" />
                <span className="font-bold text-white">
                  🎉 Congratulations! Goal Achieved!
                </span>
              </div>
            </motion.div>
          )}

          {/* YouTube Recommendations */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <motion.button
              onClick={() => fetchVideosForStep(step.id, step.title)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-[#ff0000] transition-colors w-full"
            >
              {loadingVideos.has(step.id) ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#ff0000]" />
              ) : (
                <Youtube className="w-4 h-4 text-[#ff0000]" />
              )}
              <span>
                {expandedSteps.has(step.id) ? "Hide" : "Show"} Learning Videos
              </span>
              <Play
                className={cn(
                  "w-3 h-3 transition-transform ml-auto",
                  expandedSteps.has(step.id) ? "rotate-90" : ""
                )}
              />
            </motion.button>

            <AnimatePresence>
              {expandedSteps.has(step.id) && stepVideos[step.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3 overflow-hidden"
                >
                  {stepVideos[step.id].slice(0, 4).map((video, vIndex) => (
                    <motion.a
                      key={vIndex}
                      href={video.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: vIndex * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center gap-3 p-3 rounded-lg transition-all"
                      style={{
                        background: "rgba(255, 0, 0, 0.05)",
                        border: "1px solid rgba(255, 0, 0, 0.2)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255, 0, 0, 0.1)" }}
                      >
                        <Youtube className="w-5 h-5 text-[#ff0000]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {video.title}
                        </p>
                        <p className="text-xs text-white/40">{video.topic}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/30 flex-shrink-0" />
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    ),
  }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <Spotlight />

      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-[#00ffff] transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex-1 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold"
              style={{
                background: "linear-gradient(135deg, #00ffff, #ff00ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your Journey
            </motion.h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Goal Banner */}
      {userProfile?.goal && (
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 0 40px rgba(0, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-start gap-6">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #ff00ff, #00ffff)",
                  boxShadow: "0 0 30px rgba(255, 0, 255, 0.4)",
                }}
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#ff00ff]" />
                  <span className="text-[#ff00ff] text-sm font-semibold uppercase tracking-wider">
                    Your Goal
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {userProfile.goal}
                </h2>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-white/50">Overall Progress</span>
                    <span className="text-[#00ffff] font-semibold">
                      {completedSteps} of {goalSteps.length} steps completed
                    </span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1.5 }}
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #ff00ff, #00ffff)",
                        boxShadow: "0 0 20px rgba(255, 0, 255, 0.5)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Timeline */}
      {goalSteps.length > 0 ? (
        <div className="relative z-10 px-6">
          <Timeline data={timelineData} />
        </div>
      ) : (
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))",
                border: "2px solid rgba(0, 255, 255, 0.3)",
              }}
            >
              <Target className="w-12 h-12 text-[#00ffff]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No journey steps yet
            </h3>
            <p className="text-white/50 mb-8">
              Complete the onboarding to generate your personalized roadmap
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #ff00ff, #00ffff)",
                boxShadow: "0 0 30px rgba(255, 0, 255, 0.4)",
              }}
            >
              <span>Start Onboarding</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      )}

      {/* Skills */}
      {userProfile?.skills && userProfile.skills.length > 0 && (
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h3 className="text-xl font-bold text-white mb-6">
              Skills You're Building
            </h3>
            <div className="flex flex-wrap gap-3">
              {userProfile.skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="px-4 py-2 rounded-full text-sm font-medium cursor-default"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))",
                    border: "1px solid rgba(0, 255, 255, 0.3)",
                    color: "#00ffff",
                  }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
