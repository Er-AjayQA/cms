import Link from "next/link";

import { cn } from "@/lib/utils";

export function AppShell({ eyebrow, title, description, children, accent = "amber" }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className={cn(
          "absolute inset-0 opacity-90",
          accent === "amber" &&
            "bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(180deg,_#fffdf7,_#f4efe2)]",
          accent === "cyan" &&
            "bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(180deg,_#f3fffd,_#e6f4f6)]",
          accent === "rose" &&
            "bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(180deg,_#fff8f7,_#f8ebe8)]",
        )}
      />
      <div className="relative container py-8 md:py-10">
        <header className="mb-10 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-3 text-sm uppercase tracking-[0.4em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="font-display text-4xl leading-none tracking-tight md:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              {description}
            </p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link className="rounded-full border border-border/70 px-4 py-2 text-sm" href="/">
              Control Hub
            </Link>
            <Link className="rounded-full border border-border/70 px-4 py-2 text-sm" href="/superadmin">
              Superadmin
            </Link>
            <Link className="rounded-full border border-border/70 px-4 py-2 text-sm" href="/client-admin">
              Client Admin
            </Link>
            <Link className="rounded-full border border-border/70 px-4 py-2 text-sm" href="/site/acme">
              Client Site
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
