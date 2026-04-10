import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PreviewFrame({ title, description, children }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-white/40">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
