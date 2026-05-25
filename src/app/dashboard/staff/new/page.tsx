import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StaffForm } from "@/components/staff-form";

export default async function NewStaffPage() {
  const supabase = await createClient();
  const { data: admin } = await supabase
    .from("admins")
    .select("organization_id")
    .limit(1)
    .single();

  if (!admin) redirect("/login");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إضافة موظف</h1>
        <p className="text-muted-foreground text-sm">
          أضف عضو جديد لفريق العمل لإنشاء رمز QR خاص به
        </p>
      </div>
      <StaffForm orgId={admin.organization_id} />
    </div>
  );
}
