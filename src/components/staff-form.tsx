"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

async function addStaffAction(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const department = formData.get("department") as string;
  const position = formData.get("position") as string;
  const orgId = formData.get("orgId") as string;

  if (!name || !orgId) {
    return { error: "الاسم مطلوب." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("staff").insert({
    name,
    department: department || null,
    position: position || null,
    organization_id: orgId,
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export function StaffForm({ orgId, editId }: { orgId: string; editId?: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addStaffAction, null);

  if (state && !state.error) {
    if (editId) {
      router.push(`/dashboard/staff/${editId}`);
    } else {
      router.push("/dashboard/staff");
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orgId" value={orgId} />
      <div className="space-y-2">
        <Label htmlFor="name">الاسم الكامل *</Label>
        <Input
          id="name"
          name="name"
          placeholder="محمد الراشد"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">القسم</Label>
        <Input
          id="department"
          name="department"
          placeholder="تصفيف الشعر"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">المسمى الوظيفي</Label>
        <Input
          id="position"
          name="position"
          placeholder="مصفف أزياء"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...
            </>
          ) : (
            "حفظ"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}
