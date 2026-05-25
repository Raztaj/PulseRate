import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export const dynamic = 'force-dynamic';
import { FormsList } from "@/components/forms-list";
import type { Question, Form } from "@/types";

export default async function FormsPage() {
  const supabase = await createClient();
  const { data: admin } = await supabase
    .from("admins")
    .select("organization_id")
    .limit(1)
    .maybeSingle();

  if (!admin) redirect("/login");

  const orgId = admin.organization_id;

  const { data: forms } = await supabase
    .from("forms")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const formsWithQuestions: (Form & { questions: Question[] })[] = await Promise.all(
    (forms ?? []).map(async (form) => {
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .eq("form_id", form.id)
        .order("order_index");

      return { ...form, questions: (questions ?? []) as Question[] };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">نماذج التقييم</h1>
        <p className="text-muted-foreground text-sm">
          إدارة نماذج وأسئلة التقييم
        </p>
      </div>

      {formsWithQuestions.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium">لا توجد نماذج بعد</h3>
          <p className="text-muted-foreground text-sm mt-1">
            تم إنشاء نموذج افتراضي أثناء التسجيل.
          </p>
        </div>
      ) : (
        <FormsList forms={formsWithQuestions} />
      )}
    </div>
  );
}
