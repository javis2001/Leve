import {
  Apple, BookHeart, BookOpen, CalendarCheck, Coffee, Droplets, Flame, Footprints, Heart, Moon, Mountain, Salad, Smile, Sparkles, Sprout, Sun, Trophy,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Apple, BookHeart, BookOpen, CalendarCheck, Coffee, Droplets, Flame, Footprints, Heart, Moon, Mountain, Salad, Smile, Sparkles, Sprout, Sun, Trophy,
};

export function DynIcon({ name, className }: { name: string; className?: string }) {
  const I = MAP[name] ?? Heart;
  return <I className={className} aria-hidden />;
}
