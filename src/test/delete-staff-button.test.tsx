import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeleteStaffButton } from "@/components/delete-staff-button";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}));

describe("DeleteStaffButton", () => {
  it("renders with delete button", () => {
    render(<DeleteStaffButton staffId="test-id" />);
    expect(screen.getByRole("button", { name: /حذف الموظف/ })).toBeInTheDocument();
  });

  it("has destructive variant", () => {
    render(<DeleteStaffButton staffId="test-id" />);
    const btn = screen.getByRole("button", { name: /حذف الموظف/ });
    expect(btn.className).toContain("destructive");
  });
});
