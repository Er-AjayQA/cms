import { CalendarClock, LayoutPanelLeft, PenSquare, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DashboardStat } from "@/components/dashboard-stat";
import { PreviewFrame } from "@/components/preview-frame";
import { Button } from "@/components/ui/button";

export default function ClientAdminPage() {
  return (
    <AppShell
      accent="cyan"
      eyebrow="Tenant Workspace"
      title="Client admin studio"
      description="A calmer surface for editors and client admins to manage pages, menus, publishing, and campaigns."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStat label="Draft pages" value="14" note="Five drafts were updated in the last 24 hours." />
        <DashboardStat label="Scheduled posts" value="06" note="Next publish window opens at 6:30 PM." />
        <DashboardStat label="Menus pending" value="03" note="Navigation changes await final review." />
        <DashboardStat label="Team seats" value="09" note="Two editors are currently active." />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <PreviewFrame
          title="Publishing rhythm"
          description="A tighter view for daily content operations."
        >
          <div className="grid gap-4 p-5">
            {[
              { icon: PenSquare, title: "Homepage refresh", copy: "Hero copy and campaign CTA ready for review." },
              { icon: LayoutPanelLeft, title: "Navigation cleanup", copy: "Header menu has three new pending links." },
              { icon: CalendarClock, title: "Launch window", copy: "Spring update scheduled for tomorrow morning." },
              { icon: Sparkles, title: "SEO nudges", copy: "Seven pages are missing featured descriptions." },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div className="flex items-start gap-4 rounded-[24px] border border-border/60 bg-background/70 p-4" key={item.title}>
                  <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </PreviewFrame>

        <PreviewFrame
          title="Quick actions"
          description="A simple launchpad for editors."
        >
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {["Create page", "Add menu", "Invite editor", "Preview site"].map((action) => (
              <div className="rounded-[24px] border border-border/60 bg-white/60 p-5" key={action}>
                <p className="font-medium">{action}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Hook this card into the tenant APIs once auth and data fetching are wired.
                </p>
                <Button className="mt-5" variant="outline">Open</Button>
              </div>
            ))}
          </div>
        </PreviewFrame>
      </section>
    </AppShell>
  );
}
