"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function QRDisplay({
  value,
  staffName,
}: {
  value: string;
  staffName: string;
}) {
  function handleDownload() {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      const png = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${staffName.replace(/\s+/g, "_")}_QR.png`;
      link.href = png;
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border bg-white p-4">
        <QRCodeSVG
          id="qr-code"
          value={value}
          size={200}
          level="M"
          includeMargin
        />
      </div>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download PNG
      </Button>
      <p className="text-xs text-muted-foreground break-all text-center max-w-[250px]">
        {value}
      </p>
    </div>
  );
}
