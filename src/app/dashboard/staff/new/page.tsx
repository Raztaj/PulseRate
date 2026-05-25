import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StaffForm } from "@/components/staff-form";

export default async function NewStaffPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!admin) redirect("/login");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Staff</h1>
        <p className="text-muted-foreground text-sm">
          Add a new team member to generate their QR code
        </p>
      </div>
      <StaffForm orgId={admin.organization_id} />
    </div>
  );
}
