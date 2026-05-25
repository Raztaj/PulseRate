"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

async function deleteStaffAction(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const staffId = formData.get("staffId") as string;
  if (!staffId) return { error: "معرف الموظف مفقود." };

  const supabase = createClient();
  const { error } = await supabase.from("staff").delete().eq("id", staffId);

  if (error) return { error: error.message };

  return {};
}

export function DeleteStaffButton({ staffId }: { staffId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deleteStaffAction, null);

  if (state && !state.error) {
    router.push("/dashboard/staff");
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="staffId" value={staffId} />
      <Button
        type="submit"
        variant="destructive"
        disabled={pending}
        onClick={(e) => {
          if (!confirm("هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.")) {
            e.preventDefault();
          }
        }}
      >
        {pending ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="ml-2 h-4 w-4" />
        )}
        حذف الموظف
      </Button>
    </form>
  );
}
