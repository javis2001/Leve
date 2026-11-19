import Image from "next/image";
import { cn } from "@/lib/utils";

export function Phone({ src, alt, className, priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={cn("relative rounded-[2.6rem] bg-[#0d1f19] p-2.5 shadow-[0_40px_80px_-30px_rgb(7_63_47/0.6)] ring-1 ring-black/5", className)}>
      <div className="absolute top-3.5 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0d1f19]" />
      <div className="overflow-hidden rounded-[2.1rem] bg-cream">
        <Image src={src} alt={alt} width={390} height={844} priority={priority} sizes="(max-width: 640px) 70vw, 320px" className="h-auto w-full" />
      </div>
    </div>
  );
}
