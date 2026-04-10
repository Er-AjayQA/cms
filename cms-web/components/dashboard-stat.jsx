import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardStat({ label, value, note }) {
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}
