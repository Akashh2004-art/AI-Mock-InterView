import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles = {
  default: "bg-slate-800 text-slate-300 border-slate-700",
  success: "bg-green-900/30 text-green-400 border-green-500/30",
  warning: "bg-orange-900/30 text-orange-400 border-orange-500/30",
  danger: "bg-red-900/30 text-red-400 border-red-500/30",
  info: "bg-blue-900/30 text-blue-400 border-blue-500/30",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };