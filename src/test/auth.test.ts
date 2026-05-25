import { describe, it, expect, vi } from "vitest";

// Mock the supabase admin client
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
}));

import { registerUser } from "@/actions/auth";

function createFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("email", overrides.email ?? "test@example.com");
  fd.set("password", overrides.password ?? "password123");
  fd.set("orgName", overrides.orgName ?? "Test Org");
  fd.set("name", overrides.name ?? "Test User");
  return fd;
}

describe("registerUser", () => {
  it("returns error when fields are missing", async () => {
    const fd = new FormData();
    fd.set("email", "");
    fd.set("password", "");
    fd.set("orgName", "");
    fd.set("name", "");

    const result = await registerUser(fd);
    expect(result).toEqual({ error: "جميع الحقول مطلوبة." });
  });

  it("returns error when password is too short", async () => {
    const fd = createFormData({ password: "12345" });
    const result = await registerUser(fd);
    expect(result).toEqual({
      error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
    });
  });

  it("returns error when email is missing", async () => {
    const fd = createFormData({ email: "" });
    const result = await registerUser(fd);
    expect(result).toEqual({ error: "جميع الحقول مطلوبة." });
  });
});
