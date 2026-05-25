"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaffFormEditor } from "@/components/staff-form-editor";
import { Edit3 } from "lucide-react";
import type { Question, Form } from "@/types";

export function FormsList({
  forms: initial,
}: {
  forms: (Form & { questions: Question[] })[];
}) {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {initial.map((form) => (
        <Card key={form.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{form.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={form.is_active ? "default" : "secondary"}>
                  {form.is_active ? "نشط" : "غير نشط"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEditing(editing === form.id ? null : form.id)
                  }
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {form.description && (
              <p className="text-sm text-muted-foreground">
                {form.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {editing === form.id ? (
              <StaffFormEditor
                formId={form.id}
                initialQuestions={form.questions}
                onSaved={() => setEditing(null)}
              />
            ) : (
              <>
                {form.questions.length > 0 ? (
                  <ul className="space-y-1.5">
                    {form.questions.map((q, i) => (
                      <li
                        key={q.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {i + 1}.
                        </span>
                        <span>{q.question_text}</span>
                        <Badge
                          variant="outline"
                          className="mr-auto text-xs capitalize"
                        >
                          {q.question_type === "star_rating"
                            ? "★ نجوم"
                            : "نص"}
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
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
