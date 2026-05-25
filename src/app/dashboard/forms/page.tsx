import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">نماذج التقييم</h1>
          <p className="text-muted-foreground text-sm">
            إدارة نماذج وأسئلة التقييم
          </p>
        </div>
        {formsWithQuestions.length > 0 && (
          <Button disabled>
            نموذج جديد
          </Button>
        )}
      </div>

      {formsWithQuestions.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium">لا توجد نماذج بعد</h3>
          <p className="text-muted-foreground text-sm mt-1">
            تم إنشاء نموذج افتراضي أثناء التسجيل.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {formsWithQuestions.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{form.title}</CardTitle>
                  <Badge variant={form.is_active ? "default" : "secondary"}>
                    {form.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
                {form.description && (
                  <p className="text-sm text-muted-foreground">
                    {form.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {form.questions.length > 0 ? (
                  <ul className="space-y-1.5">
                    {form.questions.map((q, i) => (
                      <li
                        key={q.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-muted-foreground">{i + 1}.</span>
                        <span>{q.question_text}</span>
                        <Badge
                          variant="outline"
                          className="mr-auto text-xs capitalize"
                        >
                          {q.question_type === "star_rating" ? "★ نجوم" : "نص"}
                        </Badge>
                        {q.is_required && (
                          <span className="text-destructive text-xs">*</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد أسئلة بعد
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {form.questions.length} سؤال
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
