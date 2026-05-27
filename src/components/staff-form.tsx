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

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .insert({
      name,
      department: department || null,
      position: position || null,
      organization_id: orgId,
    })
    .select("id")
    .single();

  if (staffError || !staff) {
    return { error: "فشل إضافة الموظف." };
  }

  const { data: form, error: formError } = await supabase
    .from("forms")
    .insert({
      organization_id: orgId,
      title: `نموذج ${name}`,
      description: "نموذج تقييم مخصص",
    })
    .select("id")
    .single();

  if (formError || !form) {
    return { error: "فشل إنشاء النموذج." };
  }

  const { error: qError } = await supabase.from("questions").insert([
    {
      form_id: form.id,
      question_text: "كيف كانت جودة الخدمة؟",
      question_type: "star_rating",
      is_required: true,
      order_index: 0,
    },
    {
      form_id: form.id,
      question_text: "كيف كانت الاحترافية؟",
      question_type: "star_rating",
      is_required: true,
      order_index: 1,
    },
    {
      form_id: form.id,
      question_text: "تعليقات إضافية",
      question_type: "text",
      is_required: false,
      order_index: 2,
    },
  ]);

  if (qError) {
    return { error: "فشل إضافة الأسئلة." };
  }

  return { success: true, staffId: staff.id, formId: form.id };
}

export function StaffForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addStaffAction, null);

  if (state && !state.error && state.staffId) {
    router.push(`/dashboard/staff/${state.staffId}`);
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
