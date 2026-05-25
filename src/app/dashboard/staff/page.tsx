import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StaffCard } from "@/components/staff-card";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: admin } = await supabase
    .from("admins")
    .select("organization_id")
    .limit(1)
    .maybeSingle();

  if (!admin) redirect("/login");

  const orgId = admin.organization_id;

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const staffWithStats = await Promise.all(
    (staff ?? []).map(async (member) => {
      const { data: memberSubs } = await supabase
        .from("submissions")
        .select("id")
        .eq("staff_id", member.id);

      const subIds = (memberSubs ?? []).map((s) => s.id);
      let answers: { rating_value: number | null }[] | null = [];

      if (subIds.length > 0) {
        const result = await supabase
          .from("answers")
          .select("rating_value")
          .in("submission_id", subIds)
          .not("rating_value", "is", null);
        answers = result.data;
      }

      const ratings = answers?.map((a) => a.rating_value ?? 0) ?? [];
      const avg =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      return { ...member, avg_rating: avg, total_submissions: ratings.length };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الموظفين</h1>
          <p className="text-muted-foreground text-sm">
            إدارة فريق العمل
          </p>
        </div>
        <Link href="/dashboard/staff/new">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة موظف
          </Button>
        </Link>
      </div>

      {staffWithStats.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium">لا يوجد موظفون بعد</h3>
          <p className="text-muted-foreground text-sm mt-1">
            أضف أول موظف في فريقك لبدء جمع التقييمات.
          </p>
          <Link href="/dashboard/staff/new">
            <Button className="mt-4">
              <Plus className="ml-2 h-4 w-4" />
              إضافة موظف
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staffWithStats.map((member) => (
            <StaffCard key={member.id} staff={member} />
          ))}
        </div>
      )}
    </div>
  );
}
