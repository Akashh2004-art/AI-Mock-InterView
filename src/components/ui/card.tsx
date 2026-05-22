import { cn } from "@/lib/utils";
import { GlowingEffect } from "./glowing-effect";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

function Card({ className, glow = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-slate-800 bg-[#1d2027] p-6",
        className
      )}
      {...props}
    >
      {glow && <GlowingEffect />}
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold text-white", className)}
      style={{ fontFamily: "Space Grotesk" }}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };