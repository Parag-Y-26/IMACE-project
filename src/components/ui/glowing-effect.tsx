"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface GlowingMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  color?: string;
}

interface GlowingEffectMenuProps {
  items: GlowingMenuItem[];
  className?: string;
}

function GlowingCard({
  item,
  index,
}: {
  item: GlowingMenuItem;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const IconComponent = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={item.href}>
        <div
          ref={cardRef}
          className="menu-item relative p-6 cursor-pointer min-h-[140px] flex flex-col items-center justify-center gap-3"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Glow following cursor */}
          {isHovered && (
            <div
              className="absolute w-32 h-32 rounded-full pointer-events-none transition-opacity duration-300"
              style={{
                left: position.x - 64,
                top: position.y - 64,
                background: `radial-gradient(circle, ${item.color || "rgba(0, 212, 255, 0.4)"} 0%, transparent 70%)`,
                filter: "blur(20px)",
              }}
            />
          )}

          {/* Icon */}
          <div
            className={cn(
              "relative z-10 p-4 rounded-xl transition-all duration-300",
              isHovered ? "scale-110" : "scale-100"
            )}
            style={{
              background: isHovered
                ? `linear-gradient(135deg, ${item.color || "rgba(0, 212, 255, 0.2)"}, rgba(124, 58, 237, 0.2))`
                : "rgba(255, 255, 255, 0.05)",
            }}
          >
            <IconComponent
              className="w-8 h-8 transition-colors duration-300"
              style={{
                color: isHovered ? item.color || "#00d4ff" : "#888",
              }}
            />
          </div>

          {/* Label */}
          <span
            className={cn(
              "relative z-10 text-sm font-medium transition-all duration-300",
              isHovered ? "text-white" : "text-gray-400"
            )}
          >
            {item.label}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function GlowingEffectMenu({
  items,
  className = "",
}: GlowingEffectMenuProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-4",
        className
      )}
    >
      {items.map((item, index) => (
        <GlowingCard key={item.href} item={item} index={index} />
      ))}
    </div>
  );
}
