import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingForm } from "@/components/rating-form";
import type { Question } from "@/types";

const mockQuestions: Question[] = [
  {
    id: "q1",
    form_id: "f1",
    question_text: "كيف كانت جودة الخدمة؟",
    question_type: "star_rating",
    is_required: true,
    order_index: 0,
  },
  {
    id: "q2",
    form_id: "f1",
    question_text: "تعليقات إضافية",
    question_type: "text",
    is_required: false,
    order_index: 1,
  },
];

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: "sub-1" },
              error: null,
            })
          ),
        })),
      })),
    })),
  })),
}));

describe("RatingForm", () => {
  it("renders all questions", () => {
    render(
      <RatingForm
        staffId="staff-1"
        formId="f1"
        formTitle="نموذج التقييم"
        formDescription="قيم تجربتك"
        questions={mockQuestions}
      />
    );

    expect(screen.getByText("كيف كانت جودة الخدمة؟")).toBeInTheDocument();
    expect(screen.getByText("تعليقات إضافية")).toBeInTheDocument();
  });

  it("renders form title and description", () => {
    render(
      <RatingForm
        staffId="staff-1"
        formId="f1"
        formTitle="نموذج التقييم"
        formDescription="قيم تجربتك"
        questions={mockQuestions}
      />
    );

    expect(screen.getByText("نموذج التقييم")).toBeInTheDocument();
    expect(screen.getByText("قيم تجربتك")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(
      <RatingForm
        staffId="staff-1"
        formId="f1"
        formTitle="نموذج التقييم"
        formDescription="قيم تجربتك"
        questions={mockQuestions}
      />
    );

    expect(
      screen.getByRole("button", { name: /إرسال التقييم/ })
    ).toBeInTheDocument();
  });

  it("marks required questions with asterisk", () => {
    render(
      <RatingForm
        staffId="staff-1"
        formId="f1"
        formTitle="نموذج التقييم"
        formDescription=""
        questions={mockQuestions}
      />
    );

    const requiredQuestion = screen.getByText("كيف كانت جودة الخدمة؟");
    expect(requiredQuestion.parentElement?.querySelector(".text-destructive")).toBeInTheDocument();
  });
});
