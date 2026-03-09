"use client";

import type { MovementCategory } from "@/lib/types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  Car,
  CircleDollarSign,
  Gamepad2,
  Heart,
  PlusCircle,
  ShoppingBag,
  Tv,
  UtensilsCrossed,
  Wallet,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconProps = { className?: string; size?: number; "aria-hidden"?: boolean };

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  Car,
  CircleDollarSign,
  Gamepad2,
  Heart,
  PlusCircle,
  ShoppingBag,
  Tv,
  UtensilsCrossed,
  Wallet,
  Wrench,
};

interface CategoryIconProps {
  category: MovementCategory | undefined;
  className?: string;
  size?: number;
}

export function CategoryIcon({ category, className, size = 20 }: CategoryIconProps) {
  if (!category) {
    const DefaultIcon = CircleDollarSign;
    return <DefaultIcon className={cn("text-muted", className)} size={size} aria-hidden />;
  }
  const Icon = ICON_MAP[category.icon] ?? CircleDollarSign;
  return (
    <Icon
      className={cn(category.color, className)}
      size={size}
      aria-hidden
    />
  );
}
