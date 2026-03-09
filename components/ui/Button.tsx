import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  glow?: boolean;
  href?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-si-primary text-primary-foreground hover:bg-si-primary-light shadow-[0_0_12px_rgba(57,255,20,0.4)] hover:shadow-[0_0_18px_rgba(57,255,20,0.5)]",
  secondary:
    "bg-si-secondary text-background hover:bg-si-secondary-light shadow-[0_0_12px_rgba(0,229,255,0.3)] hover:shadow-[0_0_16px_rgba(0,229,255,0.4)]",
  outline:
    "border-2 border-si-primary text-si-primary bg-transparent hover:bg-si-primary/10",
  ghost: "text-foreground-secondary hover:bg-surface-2 hover:text-foreground",
  danger:
    "bg-danger text-white hover:bg-danger/90 shadow-[0_0_10px_rgba(255,82,82,0.3)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-5 text-base rounded-xl",
  lg: "h-12 px-8 text-lg rounded-xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  glow,
  href,
  children,
  ...props
}: ButtonProps) {
  const styles = cn(
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-si-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    glow && "animate-[si-glow-pulse_2s_ease-in-out_infinite]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
