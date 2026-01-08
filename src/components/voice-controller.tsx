"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceControllerProps {
  onTranscript: (text: string) => void;
  onAiResponse: (text: string) => void;
  onSpeakingChange: (isSpeaking: boolean) => void;
  onNavigate?: (route: string) => void;
}

// Navigation commands mapping
const navigationCommands: Record<string, string> = {
  "go to analytics": "/analytics",
  "open analytics": "/analytics",
  analytics: "/analytics",
  "go to journey": "/journey",
  "open journey": "/journey",
  journey: "/journey",
  "go to profile": "/profile",
  "open profile": "/profile",
  profile: "/profile",
  "go to classroom": "/classroom",
  "open classroom": "/classroom",
  classroom: "/classroom",
  "classroom assistant": "/classroom",
  "go home": "/",
  "go back": "/",
  home: "/",
};

// Simulated AI responses
const aiResponses: Record<string, string> = {
  hello: "Hello! I'm your Campus Assistant. How can I help you today?",
  "how are you":
    "I'm doing great, thank you for asking! I'm here to help you with your campus needs.",
  help: "I can help you navigate to Analytics, Journey, Profile, or Classroom Assistant. Just say 'go to' followed by the section name!",
  "what can you do":
    "I can help you navigate the campus assistant, answer questions, and provide information about your academic journey.",
  thanks: "You're welcome! Feel free to ask me anything else.",
  "thank you": "You're welcome! Is there anything else I can help you with?",
};

export default function VoiceController({
  onTranscript,
  onAiResponse,
  onSpeakingChange,
  onNavigate,
}: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check browser support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        onTranscript(transcript);

        // Process final results
        if (event.results[event.results.length - 1].isFinal) {
          processCommand(transcript.toLowerCase().trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setIsSupported(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };

      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const processCommand = useCallback(
    (command: string) => {
      // Check for navigation commands
      for (const [phrase, route] of Object.entries(navigationCommands)) {
        if (command.includes(phrase)) {
          const response = `Navigating to ${route.replace("/", "") || "home"}`;
          speak(response);
          onAiResponse(response);
          setTimeout(() => {
            onNavigate?.(route);
          }, 1500);
          return;
        }
      }

      // Check for AI responses
      for (const [trigger, response] of Object.entries(aiResponses)) {
        if (command.includes(trigger)) {
          speak(response);
          onAiResponse(response);
          return;
        }
      }

      // Default response
      const defaultResponse =
        "I heard you say: " +
        command +
        ". Try saying 'help' to see what I can do!";
      speak(defaultResponse);
      onAiResponse(defaultResponse);
    },
    [onAiResponse, onNavigate]
  );

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) return;

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => onSpeakingChange(true);
      utterance.onend = () => onSpeakingChange(false);
      utterance.onerror = () => onSpeakingChange(false);

      synthRef.current.speak(utterance);
    },
    [onSpeakingChange]
  );

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-sm">
        <MicOff className="w-5 h-5" />
        <span>Voice not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleListening}
        className={cn("voice-button", isListening && "listening")}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {isListening ? (
          <Volume2 className="w-6 h-6 text-white animate-pulse" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>

      <span className="text-sm text-gray-400">
        {isListening ? "Listening..." : "Click to speak"}
      </span>
    </div>
  );
}
