"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Question } from "@/types";

interface EditableQuestion {
  id?: string;
  text: string;
  type: string;
  required: boolean;
}

async function saveFormAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const formId = formData.get("formId") as string;
  if (!formId) return { error: "معرف النموذج مطلوب." };

  const questionsJson = formData.get("questions") as string;
  if (!questionsJson) return { error: "بيانات الأسئلة مطلوبة." };

  const questions: EditableQuestion[] = JSON.parse(questionsJson);
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("questions")
    .select("id")
    .eq("form_id", formId);

  const existingIds = new Set((existing ?? []).map((q) => q.id));
  const incomingIds = new Set(questions.filter((q) => q.id).map((q) => q.id));
  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  if (toDelete.length > 0) {
    await supabase.from("questions").delete().in("id", toDelete);
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (q.id && existingIds.has(q.id)) {
      await supabase
        .from("questions")
        .update({
          question_text: q.text,
          question_type: q.type,
          is_required: q.required,
          order_index: i,
        })
        .eq("id", q.id);
    } else {
      await supabase.from("questions").insert({
        form_id: formId,
        question_text: q.text,
        question_type: q.type,
        is_required: q.required,
        order_index: i,
      });
    }
  }

  return { success: true };
}

export function StaffFormEditor({
  formId,
  initialQuestions,
}: {
  formId: string;
  initialQuestions: Question[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveFormAction, null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const startQuestions: EditableQuestion[] =
    initialQuestions.length > 0
      ? initialQuestions.map((q) => ({
          id: q.id,
          text: q.question_text,
          type: q.question_type,
          required: q.is_required,
        }))
      : [
          { text: "كيف كانت جودة الخدمة؟", type: "star_rating", required: true },
          { text: "كيف كانت الاحترافية؟", type: "star_rating", required: true },
          { text: "تعليقات إضافية", type: "text", required: false },
        ];

  const [items, setItems] = useState<EditableQuestion[]>(startQuestions);

  function addQuestion() {
    setItems([...items, { text: "", type: "star_rating", required: false }]);
  }

  function removeQuestion(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof EditableQuestion, value: string | boolean) {
    setItems(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (hiddenRef.current) {
      hiddenRef.current.value = JSON.stringify(items);
    }
  }

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} onSubmit={handleFormSubmit} className="space-y-4">
      <input type="hidden" name="formId" value={formId} />
      <input ref={hiddenRef} type="hidden" name="questions" value="" />

      {items.map((q, i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={q.text}
              onChange={(e) => updateItem(i, "text", e.target.value)}
              placeholder="نص السؤال"
              required
              className="flex-1"
            />
            <select
              value={q.type}
              onChange={(e) => updateItem(i, "type", e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="star_rating">★ نجوم</option>
              <option value="text">نص</option>
            </select>
            <button
              type="button"
              onClick={() => removeQuestion(i)}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={q.required}
              onChange={(e) => updateItem(i, "required", e.target.checked)}
            />
            مطلوب
          </label>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
        <Plus className="ml-1 h-4 w-4" />
        إضافة سؤال
      </Button>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        حفظ التغييرات
      </Button>
    </form>
  );
}
