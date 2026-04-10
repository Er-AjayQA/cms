import { cn } from "@/lib/utils";

export function CmsLogo({ compact = false, className = "" }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(145deg,hsl(var(--primary)),hsl(var(--chart-4)))] text-primary-foreground shadow-[0_16px_40px_-18px_hsl(var(--primary)/0.75)]">
        <span className="absolute inset-[7px] rounded-xl border border-white/30" />
        <span className="absolute h-6 w-[2px] rounded-full bg-white/60" />
        <span className="absolute w-6 h-[2px] rounded-full bg-white/45" />
        <span className="relative font-display text-lg tracking-[0.18em]">C</span>
      </div>

      {!compact && (
        <div>
          <p className="font-display text-lg leading-none tracking-tight text-foreground">
            Citrus CMS
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Multi Tenant Studio
          </p>
        </div>
      )}
    </div>
  );
}
