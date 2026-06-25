import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BellOff,
  BellRing,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
  House,
  Info,
  Settings2,
} from "lucide-react";

interface AppIconProps {
  icon: LucideIcon;
  className?: string;
  strokeWidth?: number;
}

export function AppIcon({
  icon: Icon,
  className = "icon-glyph",
  strokeWidth = 1.8,
}: AppIconProps) {
  return (
    <Icon aria-hidden="true" className={className} strokeWidth={strokeWidth} />
  );
}

export {
  BadgeCheck,
  BellOff,
  BellRing,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
  House,
  Info,
  Settings2,
};
