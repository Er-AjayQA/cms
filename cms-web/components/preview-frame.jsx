import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function PreviewFrame({
  title,
  description,
  buttonLabel = null,
  buttonRedirect = null,
  children,
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row justify-between border-b border-border/60 bg-white/40">
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        {buttonLabel && <Link href={buttonRedirect}>{buttonLabel}</Link>}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
