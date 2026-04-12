import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardStat({ label, value, note }) {
  return (
    <Card className="animate-fade-up border-border/70 bg-white/80">
      <CardHeader className="p-5">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value ?? 0}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p className="text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}
