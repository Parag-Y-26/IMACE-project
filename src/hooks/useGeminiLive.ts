"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface GeminiLiveMessage {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface UseGeminiLiveOptions {
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
}

interface UseGeminiLiveReturn {
  isConnected: boolean;
  isCameraActive: boolean;
  isAnalyzing: boolean;
  messages: GeminiLiveMessage[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureAndAnalyze: (question?: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export function useGeminiLive(options: UseGeminiLiveOptions = {}): UseGeminiLiveReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<GeminiLiveMessage[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // Prefer back camera for showing things
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to start camera:", error);
      options.onError?.(error as Error);
      throw error;
    }
  }, [options]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setIsConnected(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    ctx.drawImage(video, 0, 0);

    // Convert to base64 JPEG
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  const captureAndAnalyze = useCallback(async (question?: string) => {
    if (!isCameraActive) {
      options.onError?.(new Error("Camera is not active"));
      return;
    }

    const imageData = captureFrame();
    if (!imageData) {
      options.onError?.(new Error("Failed to capture frame"));
      return;
    }

    // Add user message with image
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question || "Analyze what you see",
        timestamp: new Date(),
        imageUrl: imageData,
      },
    ]);

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/gemini-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze-image",
          imageData,
          message: question,
        }),
      });

      const data = await response.json();

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.response || "I couldn't analyze the image.",
          timestamp: new Date(),
        },
      ]);

      options.onResponse?.(data.response);
    } catch (error) {
      console.error("Analysis error:", error);
      options.onError?.(error as Error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "I had trouble analyzing what you showed me. Please try again!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isCameraActive, captureFrame, options]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // If camera is active, include current frame
    if (isCameraActive) {
      await captureAndAnalyze(text);
      return;
    }

    // Text-only message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
        timestamp: new Date(),
      },
    ]);

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.response || "I couldn't generate a response.",
          timestamp: new Date(),
        },
      ]);

      options.onResponse?.(data.response);
    } catch (error) {
      console.error("Message error:", error);
      options.onError?.(error as Error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isCameraActive, captureAndAnalyze, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    isCameraActive,
    isAnalyzing,
    messages,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureAndAnalyze,
    sendMessage,
    clearMessages,
  };
}
