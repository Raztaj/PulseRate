import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StaffLeaderboard } from "@/components/staff-leaderboard";
import { RatingChart } from "@/components/rating-chart";
import { RecentFeedback } from "@/components/recent-feedback";
import { Star, Users, ClipboardList, MessageSquare } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: admin } = await supabase
    .from("admins")
    .select("organization_id")
    .limit(1)
    .single();

  if (!admin) redirect("/login");

  const orgId = admin.organization_id;

  const { data: orgStaff } = await supabase
    .from("staff")
    .select("id")
    .eq("organization_id", orgId);

  const staffIds = (orgStaff ?? []).map((s) => s.id);

  const { count: totalReviews } = staffIds.length > 0
    ? await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .in("staff_id", staffIds)
    : { count: 0 };

  let avgRating: string = "—";

  if (staffIds.length > 0) {
    const { data: orgSubs } = await supabase
      .from("submissions")
      .select("id")
      .in("staff_id", staffIds);

    const subIds = (orgSubs ?? []).map((s) => s.id);

    if (subIds.length > 0) {
      const { data: avgData } = await supabase
        .from("answers")
        .select("rating_value")
        .in("submission_id", subIds)
        .not("rating_value", "is", null);

      avgRating =
        avgData && avgData.length > 0
          ? (
              avgData.reduce((sum, a) => sum + (a.rating_value ?? 0), 0) /
              avgData.length
            ).toFixed(1)
          : "—";
    }
  }

  const { count: totalStaff } = await supabase
    .from("staff")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("is_active", true);

  const { count: totalForms } = await supabase
    .from("forms")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  const stats = [
    {
      title: "إجمالي التقييمات",
      value: totalReviews ?? 0,
      icon: MessageSquare,
    },
    {
      title: "متوسط التقييم",
      value: avgRating,
      icon: Star,
    },
    { title: "الموظفون النشطون", value: totalStaff ?? 0, icon: Users },
    { title: "النماذج", value: totalForms ?? 0, icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm">
          نظرة عامة على منشأتك
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ترتيب الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffLeaderboard orgId={orgId} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">اتجاهات التقييم</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingChart orgId={orgId} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أحدث التقييمات</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentFeedback orgId={orgId} />
        </CardContent>
      </Card>
    </div>
  );
}
