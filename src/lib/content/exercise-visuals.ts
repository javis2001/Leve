import type { Pose } from "./types";

export type Segment = "neck" | "torso" | "upperArm" | "forearm" | "thigh" | "shin";

export interface ExerciseVisual {
  /** Partes do corpo destacadas em vermelho (músculos trabalhados) */
  focus: Segment[];
  /** Setas de movimento (caminhos SVG no espaço 200×160) */
  arrows: string[];
  /** Texto simples para a legenda */
  muscles: string;
}

const BY_SLUG: Record<string, ExerciseVisual> = {
  "circulos-de-ombros": { focus: ["upperArm", "neck"], arrows: ["M124 38 A11 11 0 1 1 116 58"], muscles: "Ombros e pescoço" },
  "rotacao-de-tronco-em-pe": { focus: ["torso"], arrows: ["M70 82 Q100 102 130 82"], muscles: "Costas e cintura" },
  "mobilidade-de-tornozelos": { focus: ["shin"], arrows: ["M178 88 A10 10 0 1 1 160 90"], muscles: "Tornozelos e panturrilhas" },
  "gato-e-vaca-adaptado": { focus: ["torso"], arrows: ["M68 60 Q96 34 126 60"], muscles: "Coluna (costas)" },
  "caminhada-de-10-minutos": { focus: ["thigh", "shin"], arrows: ["M128 155 L170 155"], muscles: "Pernas e coração" },
  "caminhada-de-20-minutos": { focus: ["thigh", "shin"], arrows: ["M128 155 L170 155"], muscles: "Pernas e coração" },
  "caminhada-com-intervalos": { focus: ["thigh", "shin"], arrows: ["M124 155 L150 155", "M156 155 L182 155"], muscles: "Pernas e coração" },
  "marcha-estacionaria": { focus: ["thigh"], arrows: ["M128 132 L128 104"], muscles: "Pernas e quadril" },
  "alongamento-de-panturrilha-na-parede": { focus: ["shin"], arrows: ["M154 118 L150 142"], muscles: "Panturrilha (batata da perna)" },
  "alongamento-de-pescoco": { focus: ["neck"], arrows: ["M116 22 Q128 36 116 50"], muscles: "Pescoço" },
  "alongamento-posterior-sentado": { focus: ["thigh"], arrows: ["M108 30 Q126 36 136 54"], muscles: "Parte de trás da coxa" },
  "alongamento-de-peitoral-na-porta": { focus: ["torso", "upperArm"], arrows: ["M100 74 L100 92"], muscles: "Peito e ombros" },
  "sentar-e-levantar-da-cadeira": { focus: ["thigh"], arrows: ["M138 110 Q146 80 132 56"], muscles: "Pernas e glúteos" },
  "flexao-na-parede": { focus: ["upperArm", "forearm", "torso"], arrows: ["M104 22 L64 22"], muscles: "Braços, peito e ombros" },
  "ponte-de-gluteos": { focus: ["thigh", "torso"], arrows: ["M116 116 L116 78"], muscles: "Glúteos e parte de trás da coxa" },
  "elevacao-de-calcanhares": { focus: ["shin"], arrows: ["M122 154 L122 126"], muscles: "Panturrilhas e equilíbrio" },
  "respiracao-4-6": { focus: ["torso"], arrows: [], muscles: "Respiração (diafragma)" },
  "relaxamento-progressivo": { focus: [], arrows: [], muscles: "Corpo todo (relaxamento)" },
  "pausa-de-cinco-sentidos": { focus: [], arrows: [], muscles: "Mente e respiração" },
  "postura-de-descanso-com-pernas-elevadas": { focus: ["shin"], arrows: [], muscles: "Pernas e lombar (descanso)" },
  "elevacao-de-joelhos-sentada": { focus: ["thigh"], arrows: ["M146 112 L146 84"], muscles: "Quadril e abdômen" },
  "extensao-de-joelho-sentada": { focus: ["thigh"], arrows: ["M138 144 Q166 134 174 108"], muscles: "Parte da frente da coxa" },
  "bracos-acima-da-cabeca-sentada": { focus: ["upperArm", "forearm"], arrows: ["M76 42 L76 14", "M124 42 L124 14"], muscles: "Ombros e braços" },
  "torcao-sentada": { focus: ["torso"], arrows: ["M80 90 Q100 106 120 90"], muscles: "Coluna e cintura" },
  "rotacao-espinhal-sentada": { focus: ["torso"], arrows: [], muscles: "Coluna, costas e quadril" },
  "borboleta-sentada": { focus: ["thigh"], arrows: [], muscles: "Parte interna das coxas e quadril" },
  "alongamento-da-cobra": { focus: ["torso"], arrows: [], muscles: "Abdômen e coluna" },
  "cachorro-olhando-para-baixo": { focus: ["thigh", "shin", "upperArm"], arrows: [], muscles: "Parte de trás das pernas, costas e ombros" },
  "afundo-profundo": { focus: ["thigh"], arrows: [], muscles: "Quadril e frente da coxa" },
  "meia-abertura": { focus: ["thigh"], arrows: [], muscles: "Parte de trás da coxa" },
  "afundo-crescente": { focus: ["thigh", "torso"], arrows: [], muscles: "Pernas, quadril e tronco" },
  "afundo-do-lagarto": { focus: ["thigh"], arrows: [], muscles: "Quadril e virilha" },
  "postura-do-camelo-adaptada": { focus: ["torso", "thigh"], arrows: [], muscles: "Abdômen, peito e frente do quadril" },
  "alongamento-do-psoas": { focus: ["thigh"], arrows: [], muscles: "Frente do quadril (psoas)" },
  "agachamento-malasana": { focus: ["thigh"], arrows: [], muscles: "Quadril, coxas e tornozelos" },
  "postura-da-crianca": { focus: ["torso"], arrows: [], muscles: "Costas e quadril (relaxamento)" },
};

const BY_POSE: Record<Pose, ExerciseVisual> = {
  standing: { focus: [], arrows: [], muscles: "Corpo todo" },
  "standing-arms-up": { focus: ["upperArm"], arrows: [], muscles: "Ombros" },
  "standing-side": { focus: ["torso"], arrows: ["M70 82 Q100 102 130 82"], muscles: "Costas e cintura" },
  walking: { focus: ["thigh", "shin"], arrows: ["M128 155 L170 155"], muscles: "Pernas" },
  squat: { focus: ["thigh"], arrows: [], muscles: "Pernas" },
  "wall-push": { focus: ["upperArm"], arrows: [], muscles: "Braços" },
  seated: { focus: [], arrows: [], muscles: "Postura" },
  "seated-arms-up": { focus: ["upperArm"], arrows: [], muscles: "Ombros" },
  "seated-leg": { focus: ["thigh"], arrows: [], muscles: "Pernas" },
  lying: { focus: [], arrows: [], muscles: "Relaxamento" },
  "lying-bridge": { focus: ["thigh"], arrows: [], muscles: "Glúteos" },
  "all-fours": { focus: ["torso"], arrows: [], muscles: "Coluna" },
  breathing: { focus: ["torso"], arrows: [], muscles: "Respiração" },
  "floor-twist": { focus: ["torso"], arrows: [], muscles: "Coluna" },
  butterfly: { focus: ["thigh"], arrows: [], muscles: "Quadril" },
  cobra: { focus: ["torso"], arrows: [], muscles: "Coluna" },
  "down-dog": { focus: ["thigh", "shin"], arrows: [], muscles: "Pernas e costas" },
  "low-lunge": { focus: ["thigh"], arrows: [], muscles: "Quadril" },
  "half-split": { focus: ["thigh"], arrows: [], muscles: "Posterior da coxa" },
  "crescent-lunge": { focus: ["thigh"], arrows: [], muscles: "Pernas" },
  lizard: { focus: ["thigh"], arrows: [], muscles: "Quadril" },
  camel: { focus: ["torso"], arrows: [], muscles: "Tronco" },
  "kneeling-lunge": { focus: ["thigh"], arrows: [], muscles: "Quadril" },
  malasana: { focus: ["thigh"], arrows: [], muscles: "Quadril" },
  child: { focus: ["torso"], arrows: [], muscles: "Costas" },
};

export function exerciseVisual(slug: string | undefined, pose: Pose): ExerciseVisual {
  return (slug && BY_SLUG[slug]) || BY_POSE[pose];
}
