import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

export async function StaffLeaderboard({
  orgId,
  limit = 5,
}: {
  orgId: string;
  limit?: number;
}) {
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, department, position")
    .eq("organization_id", orgId)
    .eq("is_active", true);

  if (!staff || staff.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        لا يوجد موظفون بعد. أضف موظفين لرؤية التقييمات.
      </p>
    );
  }

  const staffWithRatings = await Promise.all(
    staff.map(async (member) => {
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

      return { ...member, avg_rating: avg, total: ratings.length };
    })
  );

  const sorted = staffWithRatings
    .filter((s) => s.total > 0)
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, limit);

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        لا توجد تقييمات بعد. شارك رموز QR للموظفين لجمع التقييمات.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((member, index) => (
        <div
          key={member.id}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <span className="text-sm font-bold text-muted-foreground w-5">
            {index + 1}
          </span>
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {member.department || member.position || "—"}
            </p>
          </div>
          <div className="text-left">
            <Badge
              variant={
                member.avg_rating >= 4
                  ? "default"
                  : member.avg_rating >= 3
                  ? "secondary"
                  : "destructive"
              }
            >
              {member.avg_rating.toFixed(1)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-0.5">
              {member.total} تقييم
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
