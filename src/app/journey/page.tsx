"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Flag,
  Trophy,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";
import Spotlight from "@/components/ui/spotlight";
import { useUserProfile, useGoalSteps } from "@/context/user-context";
import { cn } from "@/lib/utils";

export default function JourneyPage() {
  const userProfile = useUserProfile();
  const { goalSteps, updateGoalStep } = useGoalSteps();

  const completedSteps = goalSteps.filter((s) => s.completed).length;
  const progressPercentage =
    goalSteps.length > 0
      ? Math.round((completedSteps / goalSteps.length) * 100)
      : 0;

  const currentStep = goalSteps.find((s) => s.current) || goalSteps.find((s) => !s.completed);

  const getStepIcon = (step: typeof goalSteps[0], index: number) => {
    if (step.completed) return CheckCircle2;
    if (step.current) return Target;
    if (index === goalSteps.length - 1) return Trophy;
    if (index === 0) return Flag;
    return Circle;
  };

  const handleToggleStep = (stepId: number, currentCompleted: boolean) => {
    updateGoalStep(stepId, !currentCompleted);
  };

  return (
    <main className="relative min-h-screen p-8 overflow-hidden bg-black">
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
      <header className="relative z-10 flex items-center gap-4 mb-10">
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
            className="text-4xl font-bold gradient-text-animated"
          >
            Your Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 mt-2"
          >
            <span className="text-[#00ffff]">{goalSteps.length}</span> Steps to Achieve Your Goal
          </motion.p>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Goal Banner with Neon Border */}
        {userProfile?.goal && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="glass-neon rounded-3xl p-8 mb-10 relative overflow-hidden"
            style={{
              boxShadow: "0 0 40px rgba(0, 255, 255, 0.1), inset 0 0 40px rgba(255, 0, 255, 0.05)",
            }}
          >
            {/* Animated corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#00ffff] rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#ff00ff] rounded-br-3xl" />

            <div className="flex items-start gap-6">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff00ff] to-[#00ffff] flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: "0 0 30px rgba(255, 0, 255, 0.4)" }}
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-[#ff00ff]" />
                  </motion.div>
                  <span className="text-[#ff00ff] text-sm font-semibold uppercase tracking-wider">
                    Your Goal
                  </span>
                </div>
                <h2
                  className="text-2xl font-bold text-white mb-6"
                  style={{ textShadow: "0 0 20px rgba(255, 255, 255, 0.1)" }}
                >
                  {userProfile.goal}
                </h2>

                {/* Neon Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-white/50">Overall Progress</span>
                    <span className="text-[#00ffff] font-semibold">
                      {completedSteps} of {goalSteps.length} steps completed
                    </span>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1.5, delay: 0.3 }}
                      className="h-full progress-neon rounded-full"
                    />
                    {/* Animated glow */}
                    <motion.div
                      className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ left: ["-10%", "110%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Step Highlight */}
        {currentStep && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-neon rounded-3xl p-8 mb-10 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255, 0, 255, 0.05) 0%, rgba(0, 255, 255, 0.05) 100%)",
              boxShadow: "0 0 50px rgba(255, 0, 255, 0.15), inset 0 0 30px rgba(255, 0, 255, 0.05)",
              border: "1px solid rgba(255, 0, 255, 0.3)",
            }}
          >
            {/* Holographic scan effect */}
            <div className="absolute inset-0 holographic" />

            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-4 h-4 rounded-full bg-[#ff00ff]"
                style={{ boxShadow: "0 0 20px #ff00ff" }}
              />
              <span className="text-[#ff00ff] text-sm font-semibold uppercase tracking-wider">
                Currently Working On
              </span>
            </div>
            <h3
              className="text-3xl font-bold text-white mb-3"
              style={{ textShadow: "0 0 30px rgba(255, 0, 255, 0.3)" }}
            >
              Step {currentStep.id}: {currentStep.title}
            </h3>
            <p className="text-white/50 mb-6 text-lg">{currentStep.description}</p>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-white/40">
                <Clock className="w-5 h-5 text-[#00ffff]" />
                <span>Target: {currentStep.deadline}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <Zap className="w-5 h-5 text-[#ff00ff]" />
                <span>~{currentStep.estimatedDays} days</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleToggleStep(currentStep.id, currentStep.completed)}
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-white relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)",
                boxShadow: "0 0 30px rgba(255, 0, 255, 0.4)",
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <CheckCircle2 className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Mark as Complete</span>
            </motion.button>
          </motion.div>
        )}

        {/* 3D Timeline */}
        <div className="relative" style={{ perspective: "1000px" }}>
          {/* Neon Timeline line */}
          <div
            className="absolute left-8 top-0 bottom-0 w-1 rounded-full"
            style={{
              background: "linear-gradient(180deg, #00ffff 0%, #ff00ff 50%, rgba(255, 255, 255, 0.2) 100%)",
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)",
            }}
          />

          {/* Milestones */}
          <div className="space-y-8">
            {goalSteps.map((step, index) => {
              const IconComponent = getStepIcon(step, index);
              const isLast = index === goalSteps.length - 1;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -40, rotateY: -10 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                  className="relative pl-24"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Glowing orb on timeline */}
                  <motion.button
                    onClick={() => handleToggleStep(step.id, step.completed)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "absolute left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10",
                      step.completed
                        ? "bg-[#00ff88]"
                        : step.current
                          ? "bg-[#ff00ff]"
                          : "bg-white/20"
                    )}
                    style={{
                      boxShadow: step.completed
                        ? "0 0 20px #00ff88, 0 0 40px rgba(0, 255, 136, 0.5)"
                        : step.current
                          ? "0 0 20px #ff00ff, 0 0 40px rgba(255, 0, 255, 0.5)"
                          : "0 0 10px rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <IconComponent
                      className={cn(
                        "w-5 h-5",
                        step.completed || step.current ? "text-white" : "text-white/60"
                      )}
                    />
                  </motion.button>

                  {/* Connecting line pulse */}
                  {!isLast && (
                    <motion.div
                      className="absolute left-[1.85rem] top-12 w-1 h-8 rounded-full"
                      style={{
                        background: step.completed
                          ? "linear-gradient(180deg, #00ff88, rgba(0, 255, 136, 0.3))"
                          : "linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent)",
                      }}
                      animate={step.completed ? { opacity: [0.5, 1, 0.5] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Card */}
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      rotateY: 2,
                      x: 10,
                    }}
                    className={cn(
                      "glass-neon rounded-2xl p-6 transition-all duration-300 relative overflow-hidden",
                      step.current && "border-[#ff00ff]/50",
                      step.completed && "opacity-80"
                    )}
                    style={{
                      transformStyle: "preserve-3d",
                      boxShadow: step.current
                        ? "0 0 30px rgba(255, 0, 255, 0.2)"
                        : step.completed
                          ? "0 0 20px rgba(0, 255, 136, 0.1)"
                          : "0 0 15px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
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
                          Step {step.id}
                        </span>
                        <h3
                          className={cn(
                            "text-lg font-bold",
                            step.completed
                              ? "text-[#00ff88] line-through"
                              : step.current
                                ? "text-[#ff00ff]"
                                : "text-white/70"
                          )}
                          style={{
                            textShadow: step.completed
                              ? "0 0 10px rgba(0, 255, 136, 0.5)"
                              : step.current
                                ? "0 0 10px rgba(255, 0, 255, 0.5)"
                                : "none",
                          }}
                        >
                          {step.title}
                        </h3>
                      </div>
                      <span className="text-sm text-white/30">{step.deadline}</span>
                    </div>
                    <p className="text-white/50 mb-4">{step.description}</p>

                    {/* Timeline estimate */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-white/40">
                        <Clock className="w-4 h-4 text-[#00ffff]" />
                        <span>~{step.estimatedDays} days</span>
                      </div>
                      {step.completed && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[#00ff88] flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </motion.span>
                      )}
                    </div>

                    {/* Progress bar for current step */}
                    {step.current && (
                      <div className="mt-5">
                        <div className="flex justify-between text-xs text-white/40 mb-2">
                          <span>Progress</span>
                          <span className="text-[#ff00ff]">In Progress</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "35%" }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
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
                    {isLast && step.completed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-5 p-4 rounded-xl relative overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))",
                          border: "1px solid rgba(255, 0, 255, 0.3)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Trophy className="w-6 h-6 text-[#ff00ff]" />
                          </motion.div>
                          <span
                            className="font-bold gradient-text"
                            style={{ textShadow: "0 0 20px rgba(255, 0, 255, 0.5)" }}
                          >
                            🎉 Congratulations! You've achieved your goal!
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Skills Used */}
        {userProfile?.skills && userProfile.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-neon rounded-3xl p-8 mt-10"
          >
            <h3 className="text-xl font-bold text-white mb-6">Skills You're Building</h3>
            <div className="flex flex-wrap gap-3">
              {userProfile.skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="skill-tag px-4 py-2 rounded-full text-sm font-medium cursor-default"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))",
                    border: "1px solid rgba(0, 255, 255, 0.3)",
                    color: "#00ffff",
                    boxShadow: "0 0 15px rgba(0, 255, 255, 0.1)",
                  }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* No steps fallback */}
        {goalSteps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
              style={{
                background: "linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))",
                border: "2px solid rgba(0, 255, 255, 0.3)",
                boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)",
              }}
            >
              <Target className="w-12 h-12 text-[#00ffff]" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-3">No journey steps yet</h3>
            <p className="text-white/50 mb-8">
              Complete the onboarding to generate your personalized roadmap
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)",
                  boxShadow: "0 0 30px rgba(255, 0, 255, 0.4)",
                }}
              >
                <span>Start Onboarding</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
