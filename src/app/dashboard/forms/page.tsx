import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Question, Form } from "@/types";

export default async function FormsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

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
          <h1 className="text-2xl font-bold tracking-tight">Feedback Forms</h1>
          <p className="text-muted-foreground text-sm">
            Manage your rating forms and questions
          </p>
        </div>
        {formsWithQuestions.length > 0 && (
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Button>
        )}
      </div>

      {formsWithQuestions.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium">No forms yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            A default form was created during registration.
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
                    {form.is_active ? "Active" : "Inactive"}
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
                          className="ml-auto text-xs capitalize"
                        >
                          {q.question_type === "star_rating" ? "★ Stars" : "Text"}
                        </Badge>
                        {q.is_required && (
                          <span className="text-destructive text-xs">*</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No questions yet
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {form.questions.length} question
                  {form.questions.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
