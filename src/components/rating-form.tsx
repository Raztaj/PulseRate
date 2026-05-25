"use client";

import { useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import type { Question } from "@/types";

interface RatingFormProps {
  staffId: string;
  formId: string;
  formTitle: string;
  formDescription: string;
  questions: Question[];
}

async function submitFeedbackAction(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const staffId = formData.get("staffId") as string;
  const formId = formData.get("formId") as string;

  const supabase = createClient();

  const { data: submission, error: subError } = await supabase
    .from("submissions")
    .insert({ staff_id: staffId, form_id: formId })
    .select()
    .single();

  if (subError) return { error: "فشل إرسال التقييم." };
  if (!submission) return { error: "حدث خطأ ما." };

  const answers: {
    submission_id: string;
    question_id: string;
    rating_value: number | null;
    text_answer: string | null;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("rating_")) {
      const questionId = key.replace("rating_", "");
      answers.push({
        submission_id: submission.id,
        question_id: questionId,
        rating_value: Number(value),
        text_answer: null,
      });
    }
    if (key.startsWith("text_")) {
      const questionId = key.replace("text_", "");
      if (typeof value === "string" && value.trim()) {
        answers.push({
          submission_id: submission.id,
          question_id: questionId,
          rating_value: null,
          text_answer: value.trim(),
        });
      }
    }
  }

  if (answers.length > 0) {
    const { error: ansError } = await supabase.from("answers").insert(answers);
    if (ansError) return { error: "فشل حفظ الإجابات." };
  }

  return { success: true };
}

export function RatingForm({
  staffId,
  formId,
  formTitle,
  formDescription,
  questions,
}: RatingFormProps) {
  const [state, formAction, pending] = useActionState(
    submitFeedbackAction,
    null
  );

  if (state?.success) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">شكراً لك!</h2>
        <p className="text-muted-foreground">
          تم إرسال تقييمك بنجاح.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="staffId" value={staffId} />
      <input type="hidden" name="formId" value={formId} />

      {formTitle && (
        <div className="text-center">
          <h2 className="text-lg font-semibold">{formTitle}</h2>
          {formDescription && (
            <p className="text-sm text-muted-foreground">{formDescription}</p>
          )}
        </div>
      )}

      {questions.map((question) => (
        <div key={question.id} className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">
            {question.question_text}
            {question.is_required && (
              <span className="text-destructive mr-1">*</span>
            )}
          </p>

          {question.question_type === "star_rating" && (
            <StarRatingInput
              name={`rating_${question.id}`}
              required={question.is_required}
            />
          )}

          {question.question_type === "text" && (
            <textarea
              name={`text_${question.id}`}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
              placeholder="شارك تجربتك..."
              required={question.is_required}
            />
          )}
        </div>
      ))}

      {state?.error && (
        <p className="text-sm text-destructive text-center">{state.error}</p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الإرسال...
          </>
        ) : (
          "إرسال التقييم"
        )}
      </Button>
    </form>
  );
}

function StarRatingInput({
  name,
  required,
}: {
  name: string;
  required: boolean;
}) {
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <label
          key={star}
          className="cursor-pointer transition-transform hover:scale-110"
        >
          <input
            type="radio"
            name={name}
            value={star}
            required={required}
            className="peer sr-only"
          />
          <svg
            className="h-10 w-10 text-muted-foreground peer-checked:text-yellow-400 peer-checked:fill-yellow-400 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </label>
      ))}
    </div>
  );
}
