import { cn } from "@/lib/utils";

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/70 bg-card/90 text-card-foreground shadow-[0_30px_90px_-45px_rgba(15,23,42,0.55)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("font-display text-2xl leading-tight tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />
  );
}

function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
