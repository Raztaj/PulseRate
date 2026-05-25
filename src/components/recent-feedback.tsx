import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

export async function RecentFeedback({
  orgId,
  limit = 10,
}: {
  orgId: string;
  limit?: number;
}) {
  const supabase = await createClient();

  const { data: orgStaff } = await supabase
    .from("staff")
    .select("id")
    .eq("organization_id", orgId);

  const staffIds = (orgStaff ?? []).map((s) => s.id);

  if (staffIds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No feedback yet.
      </p>
    );
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      `
      id,
      submitted_at,
      staff_id,
      staff:staff(name)
    `
    )
    .in("staff_id", staffIds)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (!submissions || submissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No feedback yet.
      </p>
    );
  }

  const submissionIds = submissions.map((s) => s.id);

  const { data: answers } = await supabase
    .from("answers")
    .select("submission_id, rating_value, text_answer, question_id")
    .in("submission_id", submissionIds);

  const answerMap = new Map<string, { ratings: number[]; comments: string[] }>();

  for (const sub of submissions) {
    answerMap.set(sub.id, { ratings: [], comments: [] });
  }

  for (const ans of answers ?? []) {
    const entry = answerMap.get(ans.submission_id);
    if (!entry) continue;
    if (ans.rating_value !== null) entry.ratings.push(ans.rating_value);
    if (ans.text_answer) entry.comments.push(ans.text_answer);
  }

  return (
    <div className="space-y-3">
      {submissions.map((sub) => {
        const entry = answerMap.get(sub.id);
        const avg =
          entry && entry.ratings.length > 0
            ? (
                entry.ratings.reduce((a, b) => a + b, 0) / entry.ratings.length
              ).toFixed(1)
            : null;

        const staffName =
          (sub.staff as unknown as { name: string } | null)?.name ?? "Unknown";

        return (
          <div key={sub.id} className="flex items-start gap-3 rounded-lg border p-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {getInitials(staffName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{staffName}</p>
                {avg && (
                  <Badge
                    variant={
                      Number(avg) >= 4
                        ? "default"
                        : Number(avg) >= 3
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {avg}
                  </Badge>
                )}
              </div>
              {entry?.comments.map((c, i) => (
                <p
                  key={i}
                  className="text-sm text-muted-foreground mt-1 line-clamp-2"
                >
                  &ldquo;{c}&rdquo;
                </p>
              ))}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
