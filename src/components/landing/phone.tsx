import Image from "next/image";
import { cn } from "@/lib/utils";

export function Phone({ src, alt, className, priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={cn("relative rounded-[2.6rem] bg-[#0d1f19] p-2.5 shadow-[0_40px_80px_-30px_rgb(7_63_47/0.6)] ring-1 ring-black/5", className)}>
      <div className="overflow-hidden rounded-[2.1rem] bg-cream">
        {/* barra de status: a "ilha" do celular fica aqui, sem cobrir o conteúdo da tela */}
        <div className="relative flex h-8 items-center justify-between px-6 text-[10px] font-semibold text-ink/80" aria-hidden>
          <span>9:41</span>
          <span className="absolute top-2 left-1/2 h-[18px] w-20 -translate-x-1/2 rounded-full bg-[#0d1f19]" />
          <span className="flex items-center gap-1">
            <span className="flex items-end gap-[2px]">
              <span className="h-1.5 w-[3px] rounded-sm bg-current" />
              <span className="h-2 w-[3px] rounded-sm bg-current" />
              <span className="h-2.5 w-[3px] rounded-sm bg-current" />
            </span>
            <span className="h-2.5 w-5 rounded-[3px] border border-current p-[1px]"><span className="block h-full w-3/4 rounded-[1px] bg-current" /></span>
          </span>
        </div>
        <Image src={src} alt={alt} width={390} height={844} priority={priority} sizes="(max-width: 640px) 70vw, 320px" className="h-auto w-full" />
      </div>
    </div>
  );
}
