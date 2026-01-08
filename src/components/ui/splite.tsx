"use client";

import { Suspense, lazy, useState, useEffect } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SpliteProps {
  className?: string;
  isSpeaking?: boolean;
}

function Loader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin [animation-delay:150ms] [animation-direction:reverse]" />
        <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-cyan-300 animate-spin [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function Splite({ className = "", isSpeaking = false }: SpliteProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`robot-container ${isSpeaking ? "robot-speaking" : ""} ${className}`}>
      <div className="robot-glow" />
      <Suspense fallback={<Loader />}>
        <Spline
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          onLoad={() => setIsLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />
      </Suspense>
    </div>
  );
}
