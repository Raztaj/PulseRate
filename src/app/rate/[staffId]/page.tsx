import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { RatingForm } from "@/components/rating-form";

export default async function RateStaffPage(props: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await props.params;

  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, department, position, organization_id")
    .eq("id", staffId)
    .eq("is_active", true)
    .single();

  if (!staff) notFound();

  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, description")
    .eq("organization_id", staff.organization_id)
    .eq("is_active", true);

  const activeForm = forms?.[0] ?? null;

  const questions = activeForm
    ? await supabase
        .from("questions")
        .select("*")
        .eq("form_id", activeForm.id)
        .order("order_index")
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center p-1.5">
            <img src="/logo.svg" alt="خاتون" className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-bold">{staff.name}</h1>
          <p className="text-muted-foreground">
            {staff.position}
            {staff.department && ` · ${staff.department}`}
          </p>
        </div>

        {activeForm && questions ? (
          <RatingForm
            staffId={staff.id}
            formId={activeForm.id}
            formTitle={activeForm.title}
            formDescription={activeForm.description}
            questions={questions.data ?? []}
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
