"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Bell,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Globe,
  Shield,
  Trash2,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Spotlight from "@/components/ui/spotlight";
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  icon: typeof Settings;
  color: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const { logout } = useUser();
  
  const [settings, setSettings] = useState<SettingToggle[]>([
    {
      id: "notifications",
      label: "Push Notifications",
      description: "Receive study reminders and updates",
      icon: Bell,
      color: "#00ffff",
      enabled: true,
    },
    {
      id: "darkMode",
      label: "Dark Mode",
      description: "Use dark theme (always on)",
      icon: Moon,
      color: "#ff00ff",
      enabled: true,
    },
    {
      id: "sound",
      label: "Sound Effects",
      description: "Play sounds for actions and alerts",
      icon: Volume2,
      color: "#00ff88",
      enabled: true,
    },
    {
      id: "voice",
      label: "Voice Responses",
      description: "AI assistant speaks responses aloud",
      icon: MessageSquare,
      color: "#8b5cf6",
      enabled: true,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const menuItems = [
    { icon: Globe, label: "Language", value: "English", color: "#00ffff" },
    { icon: Shield, label: "Privacy & Security", value: "", color: "#ff00ff" },
    { icon: HelpCircle, label: "Help & Support", value: "", color: "#00ff88" },
  ];

  return (
    <main className="relative min-h-screen p-8 overflow-hidden bg-black">
      <Spotlight />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
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
            Settings
          </motion.h1>
        </div>
        <div className="w-20" />
      </header>

      <div className="relative z-10 max-w-2xl mx-auto space-y-8">
        {/* Toggle Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-neon rounded-3xl overflow-hidden"
        >
          <h2 className="text-lg font-semibold text-white p-6 border-b border-white/10">
            Preferences
          </h2>

          {settings.map((setting, index) => {
            const IconComponent = setting.icon;
            return (
              <motion.div
                key={setting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-5 p-6 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
              >
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${setting.color}15`,
                    boxShadow: `0 0 15px ${setting.color}20`,
                  }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: setting.color }} />
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-white font-medium">{setting.label}</h3>
                  <p className="text-white/40 text-sm">{setting.description}</p>
                </div>

                <motion.button
                  onClick={() => toggleSetting(setting.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-3xl"
                >
                  {setting.enabled ? (
                    <ToggleRight className="w-10 h-10" style={{ color: setting.color }} />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-white/30" />
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-neon rounded-3xl overflow-hidden"
        >
          <h2 className="text-lg font-semibold text-white p-6 border-b border-white/10">
            General
          </h2>

          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                className="w-full flex items-center gap-5 p-6 border-b border-white/5 last:border-b-0 transition-all group"
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${item.color}15`,
                    boxShadow: `0 0 15px ${item.color}20`,
                  }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: item.color }} />
                </motion.div>

                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium group-hover:text-[#00ffff] transition-colors">
                    {item.label}
                  </h3>
                </div>

                {item.value && (
                  <span className="text-white/40 text-sm">{item.value}</span>
                )}

                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#00ffff] transition-colors" />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-neon rounded-3xl overflow-hidden"
        >
          <h2 className="text-lg font-semibold text-white p-6 border-b border-white/10">
            Account
          </h2>

          <motion.button
            whileHover={{ backgroundColor: "rgba(255, 0, 128, 0.1)" }}
            onClick={logout}
            className="w-full flex items-center gap-5 p-6 border-b border-white/5 transition-all group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255, 0, 128, 0.1)",
                boxShadow: "0 0 15px rgba(255, 0, 128, 0.2)",
              }}
            >
              <Trash2 className="w-6 h-6 text-[#ff0080]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[#ff0080] font-medium">Sign Out</h3>
              <p className="text-white/40 text-sm">Log out of your account</p>
            </div>
          </motion.button>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/20 text-sm"
        >
          Campus Assistant v1.0.0
        </motion.p>
      </div>
    </main>
  );
}
