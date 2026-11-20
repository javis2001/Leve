"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Phone } from "./phone";

export const SCREENS = [
  { src: "/screens/dashboard.png", title: "Dashboard", text: "Seu dia atual, progresso, hábitos de hoje e conquistas em uma única tela." },
  { src: "/screens/receitas.png", title: "Receitas", text: "50 receitas com filtros por refeição, tempo e ingredientes, favoritos e lista de compras." },
  { src: "/screens/jornada.png", title: "Jornada", text: "Os 30 dias organizados em 4 semanas, com conteúdo novo a cada dia." },
  { src: "/screens/exercicios.png", title: "Exercícios", text: "Movimentos leves com passo a passo ilustrado, adaptações e cuidados." },
  { src: "/screens/calendario.png", title: "Calendário", text: "Rastreador de hábitos com calendário de conclusão e evolução semanal." },
  { src: "/screens/progresso.png", title: "Progresso", text: "Painel de evolução com conquistas, gráficos de hábitos e bem-estar." },
];

export function ScreensCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const go = (i: number) => {
    const box = ref.current;
    const el = box?.children[i] as HTMLElement | undefined;
    if (!box || !el) return;
    const offset = box.scrollLeft + el.getBoundingClientRect().left - box.getBoundingClientRect().left;
    const desktop = window.matchMedia("(min-width: 640px)").matches;
    const left = desktop ? offset - parseFloat(getComputedStyle(box).paddingLeft) : offset - (box.clientWidth - el.offsetWidth) / 2;
    box.scrollTo({ left, behavior: "smooth" });
  };
  return (
    <div>
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          const w = (el.children[0] as HTMLElement)?.offsetWidth ?? 1;
          setActive(Math.min(SCREENS.length - 1, Math.round(el.scrollLeft / (w + 24))));
        }}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-[calc(50%-140px)] pb-6 sm:scroll-px-[max(2rem,calc((100%-72rem)/2+2rem))] sm:px-[max(2rem,calc((100%-72rem)/2+2rem))]"
        role="region"
        aria-roledescription="carrossel"
        aria-label="Telas da plataforma"
      >
        {SCREENS.map((s, i) => (
          <figure key={s.src} className="w-[280px] shrink-0 snap-center sm:w-[300px] sm:snap-start" aria-roledescription="slide" aria-label={`${i + 1} de ${SCREENS.length}: ${s.title}`}>
            <Phone src={s.src} alt={`Tela real da plataforma: ${s.title}`} className={cn("transition duration-500", active === i ? "scale-100" : "scale-95 opacity-70 sm:scale-100 sm:opacity-100")} />
            <figcaption className="mt-5 text-center">
              <p className="font-bold text-forest">{s.title}</p>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(Math.max(0, active - 1))} className="grid size-11 place-items-center rounded-full border border-line bg-white hover:bg-mint" aria-label="Tela anterior">
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex gap-1.5">
          {SCREENS.map((s, i) => (
            <button key={s.src} type="button" onClick={() => go(i)} aria-label={`Ver ${s.title}`} aria-current={active === i} className={cn("h-2 rounded-full transition-all", active === i ? "w-6 bg-emerald" : "w-2 bg-line")} />
          ))}
        </div>
        <button type="button" onClick={() => go(Math.min(SCREENS.length - 1, active + 1))} className="grid size-11 place-items-center rounded-full border border-line bg-white hover:bg-mint" aria-label="Próxima tela">
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
