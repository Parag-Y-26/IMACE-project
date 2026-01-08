"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BellOff,
  BookOpen,
  Target,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Spotlight from "@/components/ui/spotlight";
import { useGoalSteps, useAnalytics } from "@/context/user-context";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { goalSteps } = useGoalSteps();
  const { analytics } = useAnalytics();

  const currentStep = goalSteps.find((s) => s.current);
  
  // Generate notifications based on user data
  const notifications = [
    {
      id: 1,
      type: "reminder",
      title: "Study Reminder",
      message: analytics.currentStreak > 0
        ? `You're on a ${analytics.currentStreak}-day streak! Keep it going!`
        : "Start a study session today to build your streak!",
      time: "Just now",
      icon: Clock,
      color: "#00ffff",
      read: false,
    },
    ...(currentStep
      ? [
          {
            id: 2,
            type: "goal",
            title: "Current Goal Step",
            message: `Continue working on: ${currentStep.title}`,
            time: "Today",
            icon: Target,
            color: "#ff00ff",
            read: false,
          },
        ]
      : []),
    {
      id: 3,
      type: "achievement",
      title: "Track Your Progress",
      message: `You've studied ${Math.round(analytics.totalStudyMinutes / 60 * 10) / 10} hours total. View your analytics to see more!`,
      time: "Today",
      icon: Sparkles,
      color: "#00ff88",
      read: true,
    },
    {
      id: 4,
      type: "tip",
      title: "Study Tip",
      message: "Try the Classroom's Lecture Mode to transcribe your classes and generate notes automatically!",
      time: "Yesterday",
      icon: BookOpen,
      color: "#8b5cf6",
      read: true,
    },
  ];

  return (
    <main className="relative min-h-screen p-8 overflow-hidden bg-black">
      <Spotlight />

      {/* Background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: "#00ffff",
              boxShadow: "0 0 10px #00ffff",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
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
            Notifications
          </motion.h1>
        </div>
        <div className="w-20" />
      </header>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-neon rounded-2xl p-6 mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(0, 255, 255, 0.1)",
                boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
              }}
            >
              <Bell className="w-6 h-6 text-[#00ffff]" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Push Notifications</h2>
              <p className="text-white/40 text-sm">Get study reminders and updates</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2 rounded-xl font-medium text-[#00ffff]"
            style={{
              background: "rgba(0, 255, 255, 0.1)",
              border: "1px solid rgba(0, 255, 255, 0.3)",
            }}
          >
            Enable
          </motion.button>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification, index) => {
            const IconComponent = notification.icon;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className={cn(
                  "glass-neon rounded-2xl p-6 transition-all cursor-pointer",
                  !notification.read && "ring-1 ring-[#00ffff]/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${notification.color}15`,
                      boxShadow: `0 0 15px ${notification.color}30`,
                    }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: notification.color }} />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold">{notification.title}</h3>
                      <span className="text-white/30 text-sm">{notification.time}</span>
                    </div>
                    <p className="text-white/60">{notification.message}</p>
                  </div>

                  {!notification.read && (
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
                      style={{
                        background: notification.color,
                        boxShadow: `0 0 10px ${notification.color}`,
                      }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <BellOff className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No notifications</h2>
            <p className="text-white/40">You're all caught up!</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
