"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

export function GlowingEffect({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 64,
  spread = 20,
  variant = "default",
  glow = false,
  className,
  disabled = false,
  movementDuration = 2,
  borderWidth = 1,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        glow && "opacity-100",
        className
      )}
      style={{
        "--blur": `${blur}px`,
        "--spread": `${spread}px`,
        "--border-width": `${borderWidth}px`,
      } as React.CSSProperties}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-[inherit]",
          variant === "default"
            ? "[background:radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(96,165,250,0.15),transparent_60%)]"
            : "[background:radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.15),transparent_60%)]"
        )}
      />
    </div>
  );
}