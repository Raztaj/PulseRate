"use client";

import { useActionState } from "react";
import { exportCsv } from "@/actions/export";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

async function exportAction(
  _prev: { csv?: string; error?: string } | null,
  formData: FormData
) {
  const orgId = formData.get("orgId") as string;
  const csv = await exportCsv(orgId);

  if (!csv) {
    return { error: "No data to export." };
  }

  return { csv };
}

export function ExportButton({ orgId }: { orgId: string }) {
  const [state, formAction, pending] = useActionState(exportAction, null);

  if (state?.csv) {
    const blob = new Blob([state.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff_ratings.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="orgId" value={orgId} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...
          </>
        ) : (
          <>
            <Loader2 className="mr-2 h-4 w-4" /> Export CSV
          </>
        )}
      </Button>
      {state?.error && (
        <p className="text-sm text-destructive mt-2">{state.error}</p>
      )}
    </form>
  );
}
