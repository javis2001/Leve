import { exerciseVisual, type Segment } from "@/lib/content/exercise-visuals";
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
  "floor-twist": { head: [94, 44], neck: [96, 58], hip: [98, 114], arms: [[[110, 82], [124, 96]], [[84, 86], [74, 122]]], legs: [[[124, 92], [118, 126]], [[140, 120], [174, 126]]], props: ["mat"] },
  butterfly: { head: [100, 46], neck: [100, 60], hip: [100, 112], arms: [[[88, 92], [98, 124]], [[112, 92], [102, 124]]], legs: [[[68, 118], [96, 128]], [[132, 118], [104, 128]]], props: ["mat"] },
  cobra: { head: [52, 80], neck: [64, 94], hip: [112, 122], arms: [[[60, 110], [64, 126]], [[64, 110], [68, 126]]], legs: [[[142, 124], [174, 126]], [[144, 125], [176, 127]]], props: ["mat"] },
  "down-dog": { head: [62, 104], neck: [72, 94], hip: [110, 52], arms: [[[62, 110], [52, 126]], [[66, 110], [56, 126]]], legs: [[[134, 88], [158, 126]], [[136, 90], [162, 126]]], props: ["mat"] },
  "low-lunge": { head: [96, 40], neck: [98, 54], hip: [106, 100], arms: [[[90, 80], [80, 98]], [[94, 82], [84, 100]]], legs: [[[76, 100], [72, 126]], [[140, 124], [174, 126]]], props: ["mat"] },
  "half-split": { head: [72, 58], neck: [84, 68], hip: [114, 104], arms: [[[76, 92], [70, 124]], [[80, 94], [76, 124]]], legs: [[[70, 116], [40, 122]], [[118, 126], [152, 126]]], props: ["mat"] },
  "crescent-lunge": { head: [98, 38], neck: [98, 52], hip: [102, 96], arms: [[[94, 32], [92, 12]], [[104, 32], [106, 12]]], legs: [[[72, 100], [70, 128]], [[138, 114], [170, 128]]], props: ["floor"] },
  lizard: { head: [60, 88], neck: [74, 92], hip: [118, 96], arms: [[[70, 108], [68, 126]], [[74, 108], [72, 126]]], legs: [[[88, 98], [84, 126]], [[150, 124], [180, 126]]], props: ["mat"] },
  camel: { head: [132, 50], neck: [122, 62], hip: [108, 98], arms: [[[130, 86], [136, 118]], [[126, 88], [132, 120]]], legs: [[[100, 126], [138, 126]], [[102, 126], [140, 127]]], props: ["mat"] },
  "kneeling-lunge": { head: [106, 38], neck: [106, 52], hip: [108, 100], arms: [[[96, 76], [104, 98]], [[116, 76], [112, 98]]], legs: [[[78, 100], [74, 126]], [[132, 124], [166, 126]]], props: ["mat"] },
  malasana: { head: [100, 52], neck: [100, 66], hip: [100, 114], arms: [[[80, 100], [98, 88]], [[120, 100], [102, 88]]], legs: [[[70, 110], [86, 142]], [[130, 110], [114, 142]]], props: ["floor"] },
  child: { head: [72, 118], neck: [86, 112], hip: [140, 108], arms: [[[60, 116], [34, 124]], [[62, 118], [36, 126]]], legs: [[[106, 124], [150, 126]], [[108, 125], [152, 127]]], props: ["mat"] },
};

type Tone = "gray" | "red";
const STOPS: Record<Tone, Record<"near" | "far", [string, string, string, string]>> = {
  gray: { near: ["#7e8a85", "#f6f8f7", "#cfd7d3", "#86928d"], far: ["#68736e", "#d7dedb", "#b0bbb6", "#727e79"] },
  red: { near: ["#7c1a14", "#ff8b7a", "#d8432f", "#8e2016"], far: ["#651410", "#ec6a58", "#bb3524", "#741913"] },
};
const WIDTH: Record<Segment, number> = { neck: 8, torso: 21, upperArm: 9, forearm: 7.5, thigh: 13, shin: 10 };

function Cyl({ id, a, b, seg, tone, depth }: { id: string; a: P; b: P; seg: Segment; tone: Tone; depth: "near" | "far" }) {
  const w = WIDTH[seg];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const c = STOPS[tone][depth];
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={mx - (nx * w) / 2} y1={my - (ny * w) / 2} x2={mx + (nx * w) / 2} y2={my + (ny * w) / 2}>
          <stop offset="0" stopColor={c[0]} />
          <stop offset="0.32" stopColor={c[1]} />
          <stop offset="0.68" stopColor={c[2]} />
          <stop offset="1" stopColor={c[3]} />
        </linearGradient>
      </defs>
      <path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke={`url(#${id})`} strokeWidth={w} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Joint({ at, r, tone, gid }: { at: P; r: number; tone: Tone; gid: string }) {
  return <circle cx={at[0]} cy={at[1]} r={r} fill={`url(#${gid}-${tone})`} />;
}

/**
 * Ilustração em estilo 3D: corpo com volume (luz e sombra), músculos trabalhados em vermelho
 * e setas indicando a direção do movimento.
 */
export function ExercisePose({ pose, slug, className, label }: { pose: Pose; slug?: string; className?: string; label?: string }) {
  const f = FIGURES[pose];
  const v = exerciseVisual(slug, pose);
  const uid = `ex-${slug ?? pose}`;
  const props = f.props ?? [];
  const tone = (seg: Segment): Tone => (v.focus.includes(seg) ? "red" : "gray");
  const pts = [f.head, f.neck, f.hip, ...f.arms.flat(), ...f.legs.flat()];
  const groundY = Math.max(...pts.map((p) => p[1])) + 4;
  const minX = Math.min(...pts.map((p) => p[0]));
  const maxX = Math.max(...pts.map((p) => p[0]));

  const limb = (i: number, depth: "near" | "far") => {
    const [elbow, hand] = f.arms[i];
    const [knee, foot] = f.legs[i];
    return (
      <g key={`${depth}${i}`}>
        <Cyl id={`${uid}-th${i}`} a={f.hip} b={knee} seg="thigh" tone={tone("thigh")} depth={depth} />
        <Cyl id={`${uid}-sh${i}`} a={knee} b={foot} seg="shin" tone={tone("shin")} depth={depth} />
        <Joint at={knee} r={5.4} tone={tone("thigh")} gid={uid} />
        <ellipse cx={foot[0] + 3} cy={foot[1] + 1} rx={7} ry={3.6} fill={depth === "near" ? "#9aa6a1" : "#7f8b86"} />
        <Cyl id={`${uid}-ua${i}`} a={f.neck} b={elbow} seg="upperArm" tone={tone("upperArm")} depth={depth} />
        <Cyl id={`${uid}-fa${i}`} a={elbow} b={hand} seg="forearm" tone={tone("forearm")} depth={depth} />
        <Joint at={elbow} r={4.2} tone={tone("upperArm")} gid={uid} />
        <circle cx={hand[0]} cy={hand[1]} r={4} fill={`url(#${uid}-gray)`} />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 200 160" className={cn("h-full w-full", className)} role="img" aria-label={label ?? `Ilustração do exercício. Trabalha: ${v.muscles}`}>
      <defs>
        <radialGradient id={`${uid}-bg`} cx="0.5" cy="0.35" r="0.85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e3eae6" />
        </radialGradient>
        <radialGradient id={`${uid}-gray`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#c9d2ce" />
          <stop offset="1" stopColor="#7a8681" />
        </radialGradient>
        <radialGradient id={`${uid}-red`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffb3a7" />
          <stop offset="0.55" stopColor="#d8432f" />
          <stop offset="1" stopColor="#7c1a14" />
        </radialGradient>
        <radialGradient id={`${uid}-shadow`}>
          <stop offset="0" stopColor="#0b6249" stopOpacity="0.28" />
          <stop offset="1" stopColor="#0b6249" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-wood`} x1="0" x2="1">
          <stop offset="0" stopColor="#b8925a" />
          <stop offset="0.5" stopColor="#e0c48f" />
          <stop offset="1" stopColor="#9a7a32" />
        </linearGradient>
        <marker id={`${uid}-tip`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10Z" fill="#d8432f" />
        </marker>
      </defs>

      <rect width="200" height="160" fill={`url(#${uid}-bg)`} />
      {props.includes("mat") && <rect x="12" y="127" width="176" height="9" rx="4.5" fill="#138A65" opacity="0.25" />}
      {props.includes("wall") && <rect x="26" y="8" width="14" height="146" rx="3" fill="#c7d2cd" />}
      <ellipse cx={(minX + maxX) / 2} cy={Math.min(groundY, 152)} rx={(maxX - minX) / 2 + 14} ry="6" fill={`url(#${uid}-shadow)`} />

      {props.includes("chair") && (
        <g strokeLinecap="round" fill="none">
          <path d="M92 109h42" stroke={`url(#${uid}-wood)`} strokeWidth="7" />
          <path d="M95 112v38M131 112v38" stroke="#9a7a32" strokeWidth="4" />
          <path d="M91 109V62" stroke={`url(#${uid}-wood)`} strokeWidth="5" />
        </g>
      )}

      {/* Lado mais distante (mais escuro) */}
      {limb(1, "far")}

      {/* Tronco, pescoço e cabeça */}
      <Cyl id={`${uid}-to`} a={f.neck} b={f.hip} seg="torso" tone={tone("torso")} depth="near" />
      <Joint at={f.hip} r={10} tone={tone("torso")} gid={uid} />
      <Joint at={f.neck} r={8.5} tone={tone("torso")} gid={uid} />
      <Cyl id={`${uid}-nk`} a={f.neck} b={f.head} seg="neck" tone={tone("neck")} depth="near" />
      <circle cx={f.head[0]} cy={f.head[1]} r="10.5" fill={`url(#${uid}-gray)`} />

      {/* Lado mais próximo */}
      {limb(0, "near")}

      {props.includes("breath") && (
        <g stroke="#138A65" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75">
          <path d="M122 30c8-6 14 6 22 0" />
          <path d="M126 42c8-6 14 6 22 0" />
        </g>
      )}

      {/* Setas de movimento */}
      {v.arrows.map((d, i) => (
        <g key={i} fill="none" strokeLinecap="round">
          <path d={d} stroke="#ffffff" strokeWidth="6.5" opacity="0.9" />
          <path d={d} stroke="#d8432f" strokeWidth="3.4" markerEnd={`url(#${uid}-tip)`} />
        </g>
      ))}
    </svg>
  );
}
