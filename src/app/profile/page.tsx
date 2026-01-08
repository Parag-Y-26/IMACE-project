"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Award,
  Settings,
  Bell,
  Shield,
  Target,
  Briefcase,
  Linkedin,
  FileText,
  Edit2,
  X,
  Check,
  ExternalLink,
  Sparkles,
  LogOut,
  Zap,
} from "lucide-react";
import Spotlight from "@/components/ui/spotlight";
import { useUserProfile, useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const userProfile = useUserProfile();
  const { logout, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: userProfile?.name || "",
    goal: userProfile?.goal || "",
    linkedin: userProfile?.linkedin || "",
  });

  const handleSaveEdit = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      name: userProfile?.name || "",
      goal: userProfile?.goal || "",
      linkedin: userProfile?.linkedin || "",
    });
    setIsEditing(false);
  };

  const achievements = [
    ...(userProfile?.skills && userProfile.skills.length >= 5
      ? [{ title: "Skill Master", icon: Award, color: "#00ffff" }]
      : []),
    ...(userProfile?.goal
      ? [{ title: "Goal Setter", icon: Target, color: "#ff00ff" }]
      : []),
    ...(userProfile?.linkedin
      ? [{ title: "Connected", icon: Linkedin, color: "#00ff88" }]
      : []),
  ];

  return (
    <main className="relative min-h-screen p-8 overflow-hidden bg-black">
      <Spotlight />

      {/* Animated particles background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? "#00ffff" : "#ff00ff",
              boxShadow: `0 0 10px ${i % 2 === 0 ? "#00ffff" : "#ff00ff"}`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 0.4,
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
            Profile
          </motion.h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300",
            isEditing
              ? "text-[#ff0080]"
              : "text-white/60 hover:text-[#00ffff]"
          )}
          style={{
            background: isEditing ? "rgba(255, 0, 128, 0.1)" : "rgba(255, 255, 255, 0.05)",
            border: `1px solid ${isEditing ? "rgba(255, 0, 128, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
          }}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </>
          )}
        </motion.button>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Profile Card with 3D Avatar Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-neon rounded-3xl p-10 mb-10 relative overflow-hidden"
          style={{
            boxShadow: "0 0 50px rgba(0, 255, 255, 0.1), inset 0 0 50px rgba(255, 0, 255, 0.03)",
          }}
        >
          {/* Holographic effect */}
          <div className="absolute inset-0 holographic" />

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#00ffff] rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#ff00ff] rounded-br-3xl" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* 3D Rotating Avatar Ring */}
            <div className="relative" style={{ perspective: "500px" }}>
              {/* Outer rotating ring */}
              <motion.div
                className="absolute inset-[-12px] rounded-full"
                animate={{ rotateY: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{
                  background: "linear-gradient(135deg, transparent, rgba(0, 255, 255, 0.3), transparent)",
                  transformStyle: "preserve-3d",
                }}
              />

              {/* Second rotating ring */}
              <motion.div
                className="absolute inset-[-8px] rounded-full"
                animate={{ rotateY: -360, rotateX: 30 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{
                  border: "2px solid rgba(255, 0, 255, 0.3)",
                  borderRadius: "50%",
                }}
              />

              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-36 h-36 rounded-full flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, #00ffff, #ff00ff)",
                  boxShadow: "0 0 40px rgba(0, 255, 255, 0.4), 0 0 60px rgba(255, 0, 255, 0.3)",
                }}
              >
                <User className="w-18 h-18 text-white" style={{ width: "4.5rem", height: "4.5rem" }} />
              </motion.div>

              {/* Online indicator */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-2 right-2 w-6 h-6 rounded-full"
                style={{
                  background: "#00ff88",
                  boxShadow: "0 0 15px #00ff88",
                  border: "3px solid black",
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="text-3xl font-bold text-white mb-2 bg-white/5 rounded-xl px-4 py-2 border border-[#00ffff]/30 focus:outline-none focus:border-[#00ffff] w-full md:w-auto transition-all"
                  style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)" }}
                />
              ) : (
                <h2
                  className="text-3xl font-bold text-white mb-2"
                  style={{ textShadow: "0 0 20px rgba(255, 255, 255, 0.2)" }}
                >
                  {userProfile?.name || "User"}
                </h2>
              )}
              <p className="text-white/40 mb-6">Campus Assistant User</p>

              {/* Achievement badges with 3D effect */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.title}
                      initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ scale: 1.1, rotateY: 10, z: 20 }}
                      className="badge-3d flex items-center gap-2 px-4 py-2 rounded-full"
                      style={{
                        background: `${achievement.color}10`,
                        border: `1px solid ${achievement.color}40`,
                        boxShadow: `0 0 15px ${achievement.color}30`,
                      }}
                    >
                      <IconComponent
                        className="w-4 h-4"
                        style={{ color: achievement.color }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: achievement.color }}
                      >
                        {achievement.title}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Goal Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
          className="glass-neon rounded-2xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-5">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.2))",
                boxShadow: "0 0 20px rgba(255, 0, 255, 0.2)",
              }}
            >
              <Target className="w-6 h-6 text-[#ff00ff]" />
            </motion.div>
            <h3 className="text-xl font-bold text-white">Your Goal</h3>
          </div>
          {isEditing ? (
            <textarea
              value={editData.goal}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, goal: e.target.value }))
              }
              rows={3}
              className="w-full bg-white/5 rounded-xl px-5 py-4 border border-[#00ffff]/30 text-white/80 focus:outline-none focus:border-[#00ffff] resize-none transition-all"
              style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)" }}
            />
          ) : (
            <p className="text-white/60 text-lg">{userProfile?.goal || "No goal set"}</p>
          )}
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-neon rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ rotate: -15 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))",
                boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
              }}
            >
              <Briefcase className="w-6 h-6 text-[#00ffff]" />
            </motion.div>
            <h3 className="text-xl font-bold text-white">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {userProfile?.skills && userProfile.skills.length > 0 ? (
              userProfile.skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="skill-tag px-5 py-2.5 rounded-full text-sm font-medium cursor-default"
                  style={{
                    background: "linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))",
                    border: "1px solid rgba(0, 255, 255, 0.3)",
                    color: "#00ffff",
                    boxShadow: "0 0 15px rgba(0, 255, 255, 0.1)",
                  }}
                >
                  {skill}
                </motion.span>
              ))
            ) : (
              <p className="text-white/30">No skills added</p>
            )}
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* LinkedIn */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass-neon rounded-2xl p-6 flex items-center gap-5"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(0, 255, 136, 0.1)",
                boxShadow: "0 0 20px rgba(0, 255, 136, 0.2)",
              }}
            >
              <Linkedin className="w-7 h-7 text-[#00ff88]" />
            </motion.div>
            <div className="flex-1">
              <p className="text-white/40 text-sm mb-1">LinkedIn</p>
              {isEditing ? (
                <input
                  type="url"
                  value={editData.linkedin}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, linkedin: e.target.value }))
                  }
                  className="w-full bg-white/5 rounded-lg px-3 py-2 border border-[#00ffff]/30 text-white text-sm focus:outline-none focus:border-[#00ffff]"
                />
              ) : userProfile?.linkedin ? (
                <a
                  href={userProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] font-medium flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(0,255,136,0.5)] transition-all"
                >
                  <span>View Profile</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p className="text-white/30">Not connected</p>
              )}
            </div>
          </motion.div>

          {/* Marksheet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass-neon rounded-2xl p-6 flex items-center gap-5"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))",
                boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
              }}
            >
              <FileText className="w-7 h-7 text-[#00ffff]" />
            </motion.div>
            <div>
              <p className="text-white/40 text-sm mb-1">Marksheet</p>
              <p className="text-white font-medium">
                {userProfile?.marksheetName || "Not uploaded"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Edit Actions */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex justify-end gap-4 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/60 hover:text-white transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #00ffff, #ff00ff)",
                  boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)",
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Check className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Save Changes</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-neon rounded-3xl overflow-hidden"
        >
          <h3 className="text-xl font-bold text-white p-6 border-b border-white/10">
            Settings
          </h3>

          {[
            { icon: Settings, label: "Account Settings", color: "#00ffff" },
            { icon: Bell, label: "Notifications", color: "#ff00ff" },
            { icon: Shield, label: "Privacy & Security", color: "#00ff88" },
          ].map((setting, index) => {
            const IconComponent = setting.icon;
            return (
              <motion.button
                key={setting.label}
                whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                className="w-full flex items-center gap-5 p-6 transition-all border-b border-white/5 last:border-b-0 group"
              >
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: `${setting.color}15`,
                    boxShadow: `0 0 15px ${setting.color}20`,
                  }}
                >
                  <IconComponent
                    className="w-5 h-5"
                    style={{ color: setting.color }}
                  />
                </motion.div>
                <span className="text-white/70 group-hover:text-white transition-colors">
                  {setting.label}
                </span>
                <motion.div
                  className="ml-auto"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowLeft
                    className="w-4 h-4 text-white/30 rotate-180 group-hover:text-[#00ffff] transition-colors"
                  />
                </motion.div>
              </motion.button>
            );
          })}

          {/* Logout Button */}
          <motion.button
            whileHover={{ backgroundColor: "rgba(255, 0, 128, 0.1)" }}
            onClick={logout}
            className="w-full flex items-center gap-5 p-6 transition-all text-[#ff0080] group"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: -15 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255, 0, 128, 0.1)",
                boxShadow: "0 0 15px rgba(255, 0, 128, 0.2)",
              }}
            >
              <LogOut className="w-5 h-5" />
            </motion.div>
            <span className="font-medium">Sign Out</span>
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
