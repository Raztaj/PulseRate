import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QRDisplay } from "@/components/qr-display";

describe("QRDisplay", () => {
  it("renders QR code with given value", () => {
    render(<QRDisplay value="https://example.com/rate/123" staffName="Ahmed" />);
    const svg = document.getElementById("qr-code");
    expect(svg).toBeInTheDocument();
  });

  it("renders download button", () => {
    render(<QRDisplay value="https://example.com/rate/123" staffName="Ahmed" />);
    expect(screen.getByRole("button", { name: /تحميل PNG/ })).toBeInTheDocument();
  });

  it("displays the URL", () => {
    render(<QRDisplay value="https://example.com/rate/123" staffName="Ahmed" />);
    expect(screen.getByText("https://example.com/rate/123")).toBeInTheDocument();
  });
});
