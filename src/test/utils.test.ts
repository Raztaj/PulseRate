import { describe, it, expect } from "vitest";
import { cn, getInitials } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conflicting classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});

describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials("Mohammed Al-Rashid")).toBe("MA");
  });

  it("returns single initial for one word", () => {
    expect(getInitials("Ahmed")).toBe("A");
  });

  it("returns max 2 characters", () => {
    expect(getInitials("John Michael Smith")).toBe("JM");
  });

  it("handles empty string", () => {
    expect(getInitials("")).toBe("");
  });

  it("handles Arabic names", () => {
    expect(getInitials("محمد الراشد")).toBe("ما");
  });
});
