"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Bell,
  Settings,
  User,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Command,
  Loader2,
  Timer,
  Play,
  Square,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile, useStudySessions } from "@/context/user-context";

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

const navItems = [
  { icon: Home, label: "Home", href: "/", active: true },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function HomePage() {
  const router = useRouter();
  const userProfile = useUserProfile();
  const { addStudySession } = useStudySessions();

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState("");
  const [showResponse, setShowResponse] = useState(false);

  // Study Timer State
  const [isStudying, setIsStudying] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [showTimerComplete, setShowTimerComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("");
          setInput(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Study Timer Effect
  useEffect(() => {
    if (isStudying) {
      startTimeRef.current = new Date();
      timerRef.current = setInterval(() => {
        setStudyTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStudying]);

  const handleNavigation = (command: string) => {
    const lowerCommand = command.toLowerCase();
    const routes: Record<string, string> = {
      analytics: "/analytics",
      journey: "/journey",
      profile: "/profile",
      classroom: "/classroom",
      home: "/",
      settings: "/settings",
      notifications: "/notifications",
    };

    for (const [keyword, route] of Object.entries(routes)) {
      if (lowerCommand.includes(keyword)) {
        router.push(route);
        return true;
      }
    }
    return false;
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    if (handleNavigation(input)) {
      setInput("");
      return;
    }

    setIsLoading(true);
    setShowResponse(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      if (data.error) {
        setResponse("Sorry, I encountered an error. Please try again.");
      } else {
        setResponse(data.response);
        speak(data.response);
      }
    } catch {
      setResponse("Sorry, I couldn't connect to the server.");
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startStudySession = () => {
    setStudyTime(0);
    setIsStudying(true);
    setShowTimerComplete(false);
  };

  const stopStudySession = () => {
    setIsStudying(false);
    
    // Only save if studied for at least 1 minute
    if (studyTime >= 60) {
      // Calculate a focus score based on session length (simplified)
      const focusScore = Math.min(90, 50 + Math.floor(studyTime / 60) * 5);
      
      addStudySession({
        date: new Date().toISOString(),
        duration: Math.round(studyTime / 60), // Convert to minutes
        focusScore,
      });
      
      setShowTimerComplete(true);
      setTimeout(() => setShowTimerComplete(false), 3000);
    }
    
    setStudyTime(0);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className="relative min-h-screen flex overflow-hidden bg-[#0a0a0f]">
      {/* Left Panel - Chat Interface */}
      <div className="flex-1 flex flex-col p-8 lg:p-12 max-w-2xl">
        {/* Study Timer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl transition-all",
              isStudying
                ? "bg-[#00ff88]/10 border border-[#00ff88]/30"
                : "bg-white/5 border border-white/10"
            )}
          >
            <motion.div
              animate={isStudying ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: isStudying ? Infinity : 0 }}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isStudying ? "bg-[#00ff88]/20" : "bg-white/10"
              )}
            >
              <Timer className={cn("w-6 h-6", isStudying ? "text-[#00ff88]" : "text-white/60")} />
            </motion.div>

            <div className="flex-1">
              <p className="text-white/60 text-sm">
                {isStudying ? "Study Session Active" : "Study Timer"}
              </p>
              <p
                className={cn(
                  "text-2xl font-mono font-bold",
                  isStudying ? "text-[#00ff88]" : "text-white/40"
                )}
                style={isStudying ? { textShadow: "0 0 10px #00ff88" } : {}}
              >
                {formatTime(studyTime)}
              </p>
            </div>

            <motion.button
              onClick={isStudying ? stopStudySession : startStudySession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all",
                isStudying ? "bg-[#ff0080]" : ""
              )}
              style={
                !isStudying
                  ? {
                      background: "linear-gradient(135deg, #00ff88, #00ffff)",
                      boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)",
                    }
                  : { boxShadow: "0 0 20px rgba(255, 0, 128, 0.3)" }
              }
            >
              {isStudying ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Timer Complete Notification */}
          <AnimatePresence>
            {showTimerComplete && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30"
              >
                <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                <span className="text-[#00ff88] text-sm font-medium">
                  Study session saved! Check your analytics for progress.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Question */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-light text-white mb-3"
          >
            How can I help today{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ''}?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg mb-8"
          >
            Type a command or ask a question
          </motion.p>

          {/* Response Area */}
          <AnimatePresence>
            {showResponse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <p className="text-gray-200 leading-relaxed">{response}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask zap a question..."
              className="w-full bg-transparent text-white placeholder-gray-500 p-4 resize-none focus:outline-none min-h-[100px]"
              rows={3}
            />

            {/* Input Actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <Command className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    isListening
                      ? "bg-red-500/20 text-red-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3 mt-8"
          >
            {[
              { label: "Analytics", href: "/analytics" },
              { label: "Journey", href: "/journey" },
              { label: "Classroom", href: "/classroom" },
              { label: "Profile", href: "/profile" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Robot */}
      <div className="hidden lg:flex flex-1 relative">
        {/* Top Navigation */}
        <div className="absolute top-6 right-6 z-20">
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-xl rounded-full p-1 border border-white/10">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                    item.active
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Robot Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-[600px] max-h-[700px]">
            <Splite isSpeaking={isSpeaking} className="w-full h-full" />
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0a0a0f] pointer-events-none" />
      </div>
    </main>
  );
}
