"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const SuperadminTenantMigrationDialog = ({
  tenant,
  onCancel,
  onConfirm,
}) => {
  const migrationStatus = tenant?.migrationStatus;
  const pending = migrationStatus?.pending || [];

  return (
    <AlertDialog open={Boolean(tenant)} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Run tenant migrations?</AlertDialogTitle>
          <AlertDialogDescription>
            {tenant?.companyName || "This tenant"} will run{" "}
            {migrationStatus?.pendingCount || 0} pending migration(s) on{" "}
            {tenant?.database?.dbName || "the tenant database"}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {pending.length ? (
          <div className="max-h-40 overflow-auto rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            {pending.map((migration) => (
              <div key={migration} className="break-all">
                {migration}
              </div>
            ))}
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Run Migration
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
