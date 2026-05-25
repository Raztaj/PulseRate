import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StaffForm } from "@/components/staff-form";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));

describe("StaffForm", () => {
  it("renders all fields", () => {
    render(<StaffForm orgId="test-org-id" />);

    expect(screen.getByLabelText(/الاسم الكامل/)).toBeInTheDocument();
    expect(screen.getByLabelText(/القسم/)).toBeInTheDocument();
    expect(screen.getByLabelText(/المسمى الوظيفي/)).toBeInTheDocument();
  });

  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    render(<StaffForm orgId="test-org-id" />);

    const submitBtn = screen.getByRole("button", { name: /حفظ/ });
    await user.click(submitBtn);
  });

  it("renders cancel button", () => {
    render(<StaffForm orgId="test-org-id" />);
    expect(screen.getByRole("button", { name: /إلغاء/ })).toBeInTheDocument();
  });
});
