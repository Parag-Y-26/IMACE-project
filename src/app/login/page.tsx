"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  Github,
  Chrome,
} from "lucide-react";
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";

const Splite = dynamic(() => import("@/components/ui/splite"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
      </div>
    </div>
  ),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, userState } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [robotMood, setRobotMood] = useState<"idle" | "happy" | "excited">(
    "idle"
  );

  // Redirect if already logged in and onboarded
  useEffect(() => {
    if (userState.auth.isLoggedIn && userState.auth.isOnboarded) {
      router.push("/");
    } else if (userState.auth.isLoggedIn && !userState.auth.isOnboarded) {
      router.push("/onboarding");
    }
  }, [userState, router]);

  // Robot reacts to input
  useEffect(() => {
    if (focusedField) {
      setRobotMood("happy");
    } else if (email && password) {
      setRobotMood("excited");
    } else {
      setRobotMood("idle");
    }
  }, [focusedField, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/onboarding");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex overflow-hidden bg-[#0a0a0f]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/30 rounded-full blur-[100px]"
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Left Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 mb-6"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">
                Welcome to Campus Assistant
              </span>
            </motion.div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Sign In
              </span>
            </h1>
            <p className="text-gray-400">
              Your AI-powered campus companion awaits
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div
              whileFocus={{ scale: 1.02 }}
              className={cn(
                "relative group transition-all duration-300",
                focusedField === "email" && "transform scale-[1.02]"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 blur transition-opacity duration-300",
                  focusedField === "email" && "opacity-50"
                )}
              />
              <div className="relative bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center px-4">
                  <Mail
                    className={cn(
                      "w-5 h-5 transition-colors",
                      focusedField === "email"
                        ? "text-cyan-400"
                        : "text-gray-500"
                    )}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Email address"
                    className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-4 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              className={cn(
                "relative group transition-all duration-300",
                focusedField === "password" && "transform scale-[1.02]"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 blur transition-opacity duration-300",
                  focusedField === "password" && "opacity-50"
                )}
              />
              <div className="relative bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center px-4">
                  <Lock
                    className={cn(
                      "w-5 h-5 transition-colors",
                      focusedField === "password"
                        ? "text-cyan-400"
                        : "text-gray-500"
                    )}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Password"
                    className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-4 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative w-full py-4 rounded-2xl font-semibold text-white overflow-hidden group",
                "bg-gradient-to-r from-purple-600 to-cyan-600",
                "hover:from-purple-500 hover:to-cyan-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-300"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>

            {/* Divider */}
            <div className="relative flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-sm">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social Login */}
            <div className="flex gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
              >
                <Chrome className="w-5 h-5" />
                <span>Google</span>
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </motion.button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            By continuing, you agree to our{" "}
            <span className="text-cyan-400 hover:underline cursor-pointer">
              Terms
            </span>{" "}
            and{" "}
            <span className="text-cyan-400 hover:underline cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Animated Robot */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full h-full max-w-[600px] max-h-[700px]"
        >
          <Splite isSpeaking={robotMood === "excited"} className="w-full h-full" />

          {/* Floating Cards */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 right-10 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
          >
            <p className="text-cyan-400 text-sm font-medium">AI-Powered</p>
            <p className="text-gray-400 text-xs">Smart Assistance</p>
          </motion.div>

          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-40 left-10 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
          >
            <p className="text-purple-400 text-sm font-medium">Voice Control</p>
            <p className="text-gray-400 text-xs">Hands-free Experience</p>
          </motion.div>
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0a0a0f] pointer-events-none" />
      </div>
    </main>
  );
}
