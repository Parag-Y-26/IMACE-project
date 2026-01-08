"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  Zap,
  BookOpen,
  MessageSquare,
  Play,
  Square,
  FileText,
  Youtube,
  ExternalLink,
  Save,
  CheckCircle,
  Radio,
  User,
  Wand2,
  Volume2,
  Camera,
  CameraOff,
  Eye,
} from "lucide-react";
import Spotlight from "@/components/ui/spotlight";
import { useClassroomNotes } from "@/context/user-context";
import { useGeminiLive } from "@/hooks/useGeminiLive";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface GeneratedNote {
  title: string;
  summary: string;
  keyPoints: string[];
  definitions: { term: string; definition: string }[];
  topics: string[];
}

interface VideoSuggestion {
  title: string;
  searchUrl: string;
  topic: string;
  isSearchLink?: boolean;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello! I'm your Classroom Assistant powered by Gemini AI. Switch to Live Mode for real-time voice conversations, or use Lecture Mode to transcribe and generate notes!",
  },
];

export default function ClassroomPage() {
  // Mode toggle
  const [mode, setMode] = useState<"chat" | "lecture" | "live">("chat");
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lecture mode state
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote | null>(null);
  const [videoSuggestions, setVideoSuggestions] = useState<VideoSuggestion[]>([]);
  const [noteSaved, setNoteSaved] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { saveClassroomNote } = useClassroomNotes();

  // Gemini Live hook for Live Mode
  const geminiLive = useGeminiLive({
    onTranscription: (text) => {
      console.log("Transcription:", text);
    },
    onAIResponse: (text) => {
      console.log("AI Response:", text);
    },
    onError: (error) => {
      console.error("Gemini Live error:", error);
    },
  });

  // Initialize speech recognition for Lecture Mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            }
          }

          if (finalTranscript) {
            setTranscription((prev) => prev + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          if (event.error !== "no-speech") {
            setIsRecording(false);
          }
        };

        recognitionRef.current.onend = () => {
          if (isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log("Recognition restart failed");
            }
          }
        };
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Recording timer for Lecture Mode
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
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
  }, [isRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Chat functions
  const handleSendChat = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await res.json();

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response || "I encountered an error. Please try again.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I couldn't connect to the server. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [input, isLoading]);

  // Lecture recording functions
  const startRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    setTranscription("");
    setRecordingTime(0);
    setGeneratedNotes(null);
    setVideoSuggestions([]);
    setNoteSaved(false);
    setIsRecording(true);

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start recording:", e);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const generateNotes = async () => {
    if (!transcription.trim() || transcription.length < 20) {
      alert("Please record more content before generating notes.");
      return;
    }

    setIsGeneratingNotes(true);

    try {
      const notesRes = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription }),
      });

      const notesData = await notesRes.json();

      if (notesData.error) {
        throw new Error(notesData.error);
      }

      setGeneratedNotes(notesData.notes);

      const ytRes = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: notesData.notes.topics,
          searchTerms: notesData.notes.suggestedSearchTerms,
        }),
      });

      const ytData = await ytRes.json();
      setVideoSuggestions(ytData.videos || []);
    } catch (error) {
      console.error("Note generation failed:", error);
      alert("Failed to generate notes. Please try again.");
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const saveNotes = () => {
    if (!generatedNotes) return;

    saveClassroomNote({
      title: generatedNotes.title,
      content: JSON.stringify(generatedNotes),
      transcription,
      topics: generatedNotes.topics,
      youtubeVideos: videoSuggestions.map((v) => ({
        title: v.title,
        videoId: v.searchUrl,
        thumbnail: "",
      })),
    });

    setNoteSaved(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Live Mode functions
  const handleLiveToggle = async () => {
    if (geminiLive.isListening) {
      geminiLive.stopListening();
    } else {
      await geminiLive.startListening();
    }
  };

  const handleLiveSend = async () => {
    if (!input.trim()) return;
    await geminiLive.sendMessage(input);
    setInput("");
  };

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-black">
      <Spotlight />

      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: mode === "live" 
              ? "radial-gradient(circle, rgba(255, 0, 255, 0.08) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="relative z-10 flex items-center gap-4 p-6 border-b border-white/10"
        style={{ background: "rgba(0, 0, 0, 0.8)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-[#00ffff] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>

        {/* Mode Toggle */}
        <div className="flex-1 flex justify-center">
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {[
              { id: "chat", icon: MessageSquare, label: "Chat" },
              { id: "lecture", icon: BookOpen, label: "Lecture" },
              { id: "live", icon: Radio, label: "Live" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as "chat" | "lecture" | "live")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                  mode === m.id ? "text-white" : "text-white/40 hover:text-white/60"
                )}
                style={
                  mode === m.id
                    ? {
                        background: m.id === "live"
                          ? "linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(255, 0, 128, 0.3))"
                          : "linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))",
                        boxShadow: m.id === "live"
                          ? "0 0 20px rgba(255, 0, 255, 0.3)"
                          : "0 0 20px rgba(0, 255, 255, 0.2)",
                      }
                    : {}
                }
              >
                <m.icon className="w-4 h-4" />
                <span>{m.label}</span>
                {m.id === "live" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ff00ff]/30 text-[#ff00ff] font-semibold uppercase">
                    AI
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="w-20" />
      </header>

      {/* Chat Mode */}
      {mode === "chat" && (
        <>
          <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      message.role === "assistant" ? "" : "bg-white/10"
                    }`}
                    style={
                      message.role === "assistant"
                        ? {
                            background: "linear-gradient(135deg, #00ffff, #ff00ff)",
                            boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
                          }
                        : { border: "1px solid rgba(255, 255, 255, 0.2)" }
                    }
                  >
                    {message.role === "assistant" ? (
                      <Sparkles className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-6 h-6 text-white/60" />
                    )}
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01, x: message.role === "user" ? -5 : 5 }}
                    className={`max-w-[80%] rounded-2xl p-5 relative overflow-hidden ${
                      message.role === "assistant" ? "holographic" : ""
                    }`}
                    style={
                      message.role === "assistant"
                        ? {
                            background: "rgba(0, 0, 0, 0.6)",
                            border: "1px solid rgba(0, 255, 255, 0.2)",
                            boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)",
                          }
                        : {
                            background: "linear-gradient(135deg, rgba(255, 0, 255, 0.15), rgba(0, 255, 255, 0.15))",
                            border: "1px solid rgba(255, 0, 255, 0.3)",
                          }
                    }
                  >
                    <p className={message.role === "assistant" ? "text-white/90" : "text-white"}>
                      {message.content}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #00ffff, #ff00ff)",
                    boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <div
                  className="rounded-2xl p-5 flex items-center gap-3"
                  style={{
                    background: "rgba(0, 0, 0, 0.6)",
                    border: "1px solid rgba(0, 255, 255, 0.2)",
                  }}
                >
                  <div className="flex gap-2">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                  <span className="text-white/50 text-sm ml-2">Thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div
            className="relative z-10 p-6 border-t border-white/10"
            style={{ background: "rgba(0, 0, 0, 0.9)" }}
          >
            <div className="max-w-4xl mx-auto flex gap-4">
              <motion.input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Ask me anything about your studies..."
                className="flex-1 rounded-xl px-6 py-4 text-white placeholder-white/30 focus:outline-none transition-all duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                whileFocus={{
                  boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)",
                  borderColor: "rgba(0, 255, 255, 0.5)",
                }}
              />

              <motion.button
                onClick={handleSendChat}
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white disabled:opacity-30"
                style={{
                  background: input.trim() ? "linear-gradient(135deg, #00ffff, #ff00ff)" : "rgba(255, 255, 255, 0.1)",
                  boxShadow: input.trim() ? "0 0 30px rgba(0, 255, 255, 0.4)" : "none",
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </>
      )}

      {/* Lecture Mode */}
      {mode === "lecture" && (
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Recording Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-neon rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Lecture Transcription</h2>
                  <p className="text-white/50">
                    {isRecording
                      ? "Recording... Speak clearly into your microphone"
                      : "Start recording to transcribe your lecture"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {isRecording && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff0080]/20 border border-[#ff0080]/50"
                    >
                      <div className="w-3 h-3 rounded-full bg-[#ff0080]" />
                      <span className="text-[#ff0080] font-mono">{formatTime(recordingTime)}</span>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-white transition-all",
                      isRecording ? "bg-[#ff0080]" : ""
                    )}
                    style={
                      !isRecording
                        ? {
                            background: "linear-gradient(135deg, #00ff88, #00ffff)",
                            boxShadow: "0 0 30px rgba(0, 255, 136, 0.4)",
                          }
                        : { boxShadow: "0 0 30px rgba(255, 0, 128, 0.4)" }
                    }
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-5 h-5" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Transcription Area */}
              <div
                className="min-h-[200px] max-h-[300px] overflow-y-auto rounded-2xl p-6"
                style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {transcription ? (
                  <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{transcription}</p>
                ) : (
                  <p className="text-white/30 italic">
                    Transcription will appear here as you speak...
                  </p>
                )}
              </div>

              {/* Generate Notes Button */}
              {transcription && !isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex justify-center"
                >
                  <motion.button
                    onClick={generateNotes}
                    disabled={isGeneratingNotes}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #ff00ff, #00ffff)",
                      boxShadow: "0 0 30px rgba(255, 0, 255, 0.4)",
                    }}
                  >
                    {isGeneratingNotes ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Notes...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        <span>Generate Study Notes</span>
                        <Zap className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>

            {/* Generated Notes */}
            {generatedNotes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-neon rounded-3xl p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gradient-text-animated">{generatedNotes.title}</h2>
                  <motion.button
                    onClick={saveNotes}
                    disabled={noteSaved}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
                      noteSaved ? "text-[#00ff88]" : "text-white"
                    )}
                    style={
                      noteSaved
                        ? {
                            background: "rgba(0, 255, 136, 0.1)",
                            border: "1px solid rgba(0, 255, 136, 0.3)",
                          }
                        : {
                            background: "rgba(0, 255, 255, 0.1)",
                            border: "1px solid rgba(0, 255, 255, 0.3)",
                          }
                    }
                  >
                    {noteSaved ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Notes</span>
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#00ffff] mb-2">Summary</h3>
                  <p className="text-white/70">{generatedNotes.summary}</p>
                </div>

                {generatedNotes.keyPoints.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#ff00ff] mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {generatedNotes.keyPoints.map((point, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 text-white/70"
                        >
                          <span className="text-[#ff00ff]">•</span>
                          {point}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedNotes.definitions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#00ff88] mb-3">Definitions</h3>
                    <div className="grid gap-3">
                      {generatedNotes.definitions.map((def, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl"
                          style={{
                            background: "rgba(0, 255, 136, 0.05)",
                            border: "1px solid rgba(0, 255, 136, 0.2)",
                          }}
                        >
                          <span className="text-[#00ff88] font-semibold">{def.term}:</span>
                          <span className="text-white/70 ml-2">{def.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* YouTube Recommendations */}
            {videoSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-neon rounded-3xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Youtube className="w-6 h-6 text-[#ff0000]" />
                  <h2 className="text-2xl font-bold text-white">Recommended Videos</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoSuggestions.map((video, i) => (
                    <motion.a
                      key={i}
                      href={video.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      whileHover={{ scale: 1.02, y: -3 }}
                      className="flex items-center gap-4 p-4 rounded-xl transition-all"
                      style={{
                        background: "rgba(255, 0, 0, 0.05)",
                        border: "1px solid rgba(255, 0, 0, 0.2)",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255, 0, 0, 0.1)" }}
                      >
                        <Youtube className="w-6 h-6 text-[#ff0000]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{video.title}</p>
                        <p className="text-white/40 text-sm">{video.topic}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-white/40" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Live Mode - Visual AI with Camera */}
      {mode === "live" && (
        <div className="relative z-10 flex-1 flex flex-col p-6 overflow-hidden">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-6">
            {/* Camera Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-neon rounded-3xl p-6 flex-shrink-0"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={geminiLive.isCameraActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: geminiLive.isCameraActive ? Infinity : 0 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: geminiLive.isCameraActive
                        ? "linear-gradient(135deg, #ff00ff, #00ffff)"
                        : "linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.2))",
                      boxShadow: geminiLive.isCameraActive
                        ? "0 0 30px rgba(255, 0, 255, 0.4)"
                        : "none",
                    }}
                  >
                    <Camera className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Gemini Live Vision</h2>
                    <p className="text-white/50">
                      {geminiLive.isCameraActive
                        ? "Show me your notes, textbooks, or problems!"
                        : "Enable camera for visual AI assistance"}
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={geminiLive.isCameraActive ? geminiLive.stopCamera : geminiLive.startCamera}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                  style={{
                    background: geminiLive.isCameraActive
                      ? "#ff0080"
                      : "linear-gradient(135deg, #00ff88, #00ffff)",
                    boxShadow: geminiLive.isCameraActive
                      ? "0 0 20px rgba(255, 0, 128, 0.4)"
                      : "0 0 20px rgba(0, 255, 136, 0.4)",
                  }}
                >
                  {geminiLive.isCameraActive ? (
                    <>
                      <CameraOff className="w-5 h-5" />
                      <span>Stop Camera</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>Start Camera</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Camera Preview */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(0, 0, 0, 0.8)",
                  border: geminiLive.isCameraActive
                    ? "2px solid rgba(255, 0, 255, 0.5)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  aspectRatio: "16/9",
                  maxHeight: "400px",
                }}
              >
                <video
                  ref={geminiLive.videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{
                    display: geminiLive.isCameraActive ? "block" : "none",
                    transform: "scaleX(-1)", // Mirror the video
                  }}
                />
                <canvas
                  ref={geminiLive.canvasRef}
                  className="hidden"
                />

                {!geminiLive.isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Camera className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-white/40 text-lg">Camera preview will appear here</p>
                    <p className="text-white/30 text-sm mt-2">
                      Point your camera at textbooks, notes, or problems
                    </p>
                  </div>
                )}

                {/* Analyzing overlay */}
                {geminiLive.isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(0, 0, 0, 0.7)" }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #ff00ff, #00ffff)",
                          boxShadow: "0 0 40px rgba(255, 0, 255, 0.5)",
                        }}
                      >
                        <Eye className="w-8 h-8 text-white" />
                      </motion.div>
                      <p className="text-white font-medium">Analyzing what you're showing me...</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Capture Button */}
              {geminiLive.isCameraActive && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex justify-center"
                >
                  <motion.button
                    onClick={() => geminiLive.captureAndAnalyze()}
                    disabled={geminiLive.isAnalyzing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #ff00ff, #00ffff)",
                      boxShadow: "0 0 30px rgba(255, 0, 255, 0.4)",
                    }}
                  >
                    <Eye className="w-5 h-5" />
                    <span>Analyze What I'm Showing</span>
                    <Sparkles className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>

            {/* Messages/Responses Section */}
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
              <AnimatePresence mode="popLayout">
                {geminiLive.messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          message.role === "ai"
                            ? "linear-gradient(135deg, #ff00ff, #00ffff)"
                            : "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {message.role === "ai" ? (
                        <Sparkles className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white/60" />
                      )}
                    </div>
                    <div
                      className="max-w-[75%] rounded-2xl p-5"
                      style={{
                        background:
                          message.role === "ai"
                            ? "rgba(255, 0, 255, 0.1)"
                            : "rgba(0, 255, 255, 0.1)",
                        border: `1px solid ${
                          message.role === "ai"
                            ? "rgba(255, 0, 255, 0.3)"
                            : "rgba(0, 255, 255, 0.3)"
                        }`,
                      }}
                    >
                      {/* Show captured image for user messages */}
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          alt="Captured"
                          className="rounded-lg mb-3 max-w-full max-h-48 object-contain"
                          style={{ transform: "scaleX(-1)" }}
                        />
                      )}
                      <p className="text-white/90 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {geminiLive.isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #ff00ff, #00ffff)" }}
                  >
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: "rgba(255, 0, 255, 0.1)",
                      border: "1px solid rgba(255, 0, 255, 0.3)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                      <span className="text-white/50">Analyzing image...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Empty state */}
              {geminiLive.messages.length === 0 && !geminiLive.isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Eye className="w-16 h-16 text-white/20 mb-4" />
                  <h3 className="text-xl font-semibold text-white/60 mb-2">Visual AI Assistant</h3>
                  <p className="text-white/40 max-w-md">
                    Enable your camera and show me your textbooks, notes, math problems, or diagrams.
                    I'll analyze them and help you understand!
                  </p>
                </div>
              )}
            </div>

            {/* Question Input */}
            <div
              className="p-4 rounded-2xl flex-shrink-0"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 0, 255, 0.2)",
              }}
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim()) {
                      if (geminiLive.isCameraActive) {
                        geminiLive.captureAndAnalyze(input);
                      } else {
                        geminiLive.sendMessage(input);
                      }
                      setInput("");
                    }
                  }}
                  placeholder={
                    geminiLive.isCameraActive
                      ? "Ask a question about what you're showing..."
                      : "Type a question..."
                  }
                  className="flex-1 bg-transparent text-white placeholder-white/30 px-4 py-3 focus:outline-none"
                />
                <motion.button
                  onClick={() => {
                    if (input.trim()) {
                      if (geminiLive.isCameraActive) {
                        geminiLive.captureAndAnalyze(input);
                      } else {
                        geminiLive.sendMessage(input);
                      }
                      setInput("");
                    } else if (geminiLive.isCameraActive) {
                      geminiLive.captureAndAnalyze();
                    }
                  }}
                  disabled={geminiLive.isAnalyzing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-medium text-white disabled:opacity-30"
                  style={{
                    background: "linear-gradient(135deg, #ff00ff, #00ffff)",
                  }}
                >
                  {geminiLive.isCameraActive ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
