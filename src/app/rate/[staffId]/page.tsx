import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
export const dynamic = 'force-dynamic';
import { RatingForm } from "@/components/rating-form";
import type { Question } from "@/types";

export default async function RateStaffPage(props: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await props.params;

  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, department, position, form_id")
    .eq("id", staffId)
    .eq("is_active", true)
    .maybeSingle();

  if (!staff) notFound();

  let questions: Question[] = [];
  let formData: { id: string; title: string; description: string } | null = null;

  if (staff.form_id) {
    const { data: form } = await supabase
      .from("forms")
      .select("id, title, description")
      .eq("id", staff.form_id)
      .eq("is_active", true)
      .maybeSingle();

    if (form) {
      formData = form;
      const { data: qs } = await supabase
        .from("questions")
        .select("*")
        .eq("form_id", form.id)
        .order("order_index");
      questions = (qs ?? []) as Question[];
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-white shadow-sm border border-[#E5DEC9] flex items-center justify-center p-1">
            <img src="/logo.svg" alt="خاتون" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold">{staff.name}</h1>
          <p className="text-muted-foreground">
            {staff.position}
            {staff.department && ` · ${staff.department}`}
          </p>
        </div>

        {formData ? (
          <RatingForm
            staffId={staff.id}
            formId={formData.id}
            formTitle={formData.title}
            formDescription={formData.description}
            questions={questions}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              لا توجد استمارة تقييم متاحة لهذا الموظف.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">منذ 1436</p>
      </div>
    </div>
  );
}
