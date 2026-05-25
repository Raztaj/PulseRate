import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExportButton } from "@/components/export-button";
import { FileDown, FileText } from "lucide-react";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: admin } = await supabase
    .from("admins")
    .select("organization_id")
    .limit(1)
    .maybeSingle();

  if (!admin) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">التقارير</h1>
        <p className="text-muted-foreground text-sm">
          تصدير بياناتك
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              ملف CSV لتقييمات الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              تحميل ملف CSV يحتوي على جميع الموظفين ومتوسط تقييماتهم وإجمالي عدد التقييمات.
            </p>
            <ExportButton orgId={admin.organization_id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-4 w-4" />
              تقرير ملخص
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              قريباً: تقرير PDF مع الرسوم البيانية والاتجاهات والتحليلات.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
