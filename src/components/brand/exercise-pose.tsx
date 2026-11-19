import type { Pose } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type P = [number, number];
interface Figure {
  head: P;
  neck: P;
  hip: P;
  arms: [P, P][]; // [cotovelo, mão]
  legs: [P, P][]; // [joelho, pé]
  props?: ("chair" | "wall" | "floor" | "mat" | "arrow" | "breath" | "path")[];
}

const FIGURES: Record<Pose, Figure> = {
  standing: { head: [100, 30], neck: [100, 46], hip: [100, 96], arms: [[[88, 70], [84, 94]], [[112, 70], [116, 94]]], legs: [[[95, 122], [93, 148]], [[105, 122], [107, 148]]], props: ["floor"] },
  "standing-arms-up": { head: [100, 34], neck: [100, 50], hip: [100, 98], arms: [[[80, 50], [62, 50]], [[120, 50], [138, 50]]], legs: [[[95, 124], [93, 148]], [[105, 124], [107, 148]]], props: ["floor"] },
  "standing-side": { head: [100, 30], neck: [100, 46], hip: [100, 96], arms: [[[90, 64], [112, 62]], [[110, 66], [88, 66]]], legs: [[[95, 122], [93, 148]], [[105, 122], [107, 148]]], props: ["floor", "arrow"] },
  walking: { head: [104, 30], neck: [102, 46], hip: [98, 96], arms: [[[112, 68], [120, 86]], [[90, 70], [82, 88]]], legs: [[[88, 122], [76, 148]], [[110, 120], [118, 148]]], props: ["floor", "path"] },
  squat: { head: [86, 46], neck: [90, 60], hip: [120, 102], arms: [[[76, 72], [62, 80]], [[78, 76], [64, 84]]], legs: [[[96, 112], [100, 148]], [[100, 114], [104, 148]]], props: ["chair", "floor"] },
  "wall-push": { head: [76, 40], neck: [84, 52], hip: [120, 98], arms: [[[62, 54], [44, 52]], [[64, 60], [44, 62]]], legs: [[[130, 124], [142, 148]], [[124, 124], [130, 148]]], props: ["wall", "floor"] },
  seated: { head: [100, 40], neck: [100, 56], hip: [100, 104], arms: [[[106, 80], [122, 100]], [[110, 82], [126, 102]]], legs: [[[130, 104], [130, 146]], [[134, 106], [136, 146]]], props: ["chair", "floor"] },
  "seated-arms-up": { head: [100, 42], neck: [100, 58], hip: [100, 106], arms: [[[86, 44], [88, 20]], [[114, 44], [112, 20]]], legs: [[[130, 106], [130, 146]], [[134, 108], [136, 146]]], props: ["chair", "floor"] },
  "seated-leg": { head: [98, 40], neck: [99, 56], hip: [100, 104], arms: [[[94, 80], [88, 104]], [[106, 80], [112, 104]]], legs: [[[130, 104], [168, 98]], [[132, 106], [132, 146]]], props: ["chair", "floor"] },
  lying: { head: [34, 118], neck: [48, 120], hip: [104, 120], arms: [[[66, 126], [86, 128]], [[66, 124], [84, 124]]], legs: [[[134, 96], [154, 124]], [[136, 98], [158, 124]]], props: ["mat"] },
  "lying-bridge": { head: [34, 122], neck: [48, 122], hip: [104, 92], arms: [[[66, 126], [86, 128]], [[66, 124], [84, 124]]], legs: [[[136, 86], [152, 124]], [[138, 88], [156, 124]]], props: ["mat"] },
  "all-fours": { head: [46, 70], neck: [58, 78], hip: [132, 80], arms: [[[60, 102], [62, 124]], [[64, 102], [66, 124]]], legs: [[[132, 124], [168, 124]], [[136, 124], [172, 124]]], props: ["mat"] },
  breathing: { head: [100, 40], neck: [100, 56], hip: [100, 110], arms: [[[84, 82], [98, 92]], [[116, 70], [104, 68]]], legs: [[[70, 122], [112, 128]], [[130, 122], [88, 128]]], props: ["mat", "breath"] },
};

export function ExercisePose({ pose, className, label }: { pose: Pose; className?: string; label?: string }) {
  const f = FIGURES[pose];
  const line = (a: P, b: P) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
  const props = f.props ?? [];
  return (
    <svg viewBox="0 0 200 160" className={cn("h-full w-full", className)} role="img" aria-label={label ?? "Ilustração do exercício"}>
      <rect width="200" height="160" fill="#E8F6EF" />
      <circle cx="166" cy="30" r="16" fill="#D6B36A" opacity="0.25" />
      {props.includes("floor") && <path d="M16 149h168" stroke="#0B6249" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />}
      {props.includes("mat") && <rect x="14" y="128" width="172" height="8" rx="4" fill="#138A65" opacity="0.22" />}
      {props.includes("wall") && <rect x="28" y="12" width="12" height="138" rx="3" fill="#0B6249" opacity="0.14" />}
      {props.includes("chair") && (
        <g stroke="#9A7A32" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8">
          <path d="M92 108h40" />
          <path d="M94 108v40M130 108v40" />
          <path d="M92 108V64" />
        </g>
      )}
      {props.includes("path") && <path d="M20 156c40-6 120-6 160 0" stroke="#D6B36A" strokeWidth="2" strokeDasharray="4 6" fill="none" />}
      {props.includes("arrow") && (
        <g stroke="#D6B36A" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M70 84c10 10 50 10 60 0" />
          <path d="M124 78l6 6-8 3" />
        </g>
      )}
      {props.includes("breath") && (
        <g stroke="#138A65" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6">
          <path d="M122 34c8-6 14 6 22 0" />
          <path d="M126 46c8-6 14 6 22 0" />
        </g>
      )}
      <g stroke="#0B6249" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={line(f.neck, f.hip)} />
        {f.legs.map(([k, ft], i) => (
          <path key={`l${i}`} d={`${line(f.hip, k)}L${ft[0]} ${ft[1]}`} opacity={i === 0 ? 1 : 0.7} />
        ))}
        {f.arms.map(([e, h], i) => (
          <path key={`a${i}`} d={`${line(f.neck, e)}L${h[0]} ${h[1]}`} stroke={i === 0 ? "#138A65" : "#0B6249"} opacity={i === 0 ? 1 : 0.75} />
        ))}
      </g>
      <circle cx={f.head[0]} cy={f.head[1]} r="11" fill="#0B6249" />
    </svg>
  );
}
