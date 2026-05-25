import { createClient } from "@/lib/supabase/server";
import { RatingChartClient } from "./rating-chart-client";

export async function RatingChart({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const { data: orgStaff } = await supabase
    .from("staff")
    .select("id")
    .eq("organization_id", orgId);

  const staffIds = (orgStaff ?? []).map((s) => s.id);

  if (staffIds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No data yet.
      </p>
    );
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, submitted_at")
    .in("staff_id", staffIds)
    .order("submitted_at", { ascending: true });

  if (!submissions || submissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No data yet.
      </p>
    );
  }

  const submissionIds = submissions.map((s) => s.id);

  const { data: answers } = await supabase
    .from("answers")
    .select("submission_id, rating_value")
    .in("submission_id", submissionIds)
    .not("rating_value", "is", null);

  const answerMap = new Map<
    string,
    { ratings: number[]; date: string }
  >();

  for (const sub of submissions) {
    answerMap.set(sub.id, {
      ratings: [],
      date: new Date(sub.submitted_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    });
  }

  for (const ans of answers ?? []) {
    const entry = answerMap.get(ans.submission_id);
    if (entry && ans.rating_value !== null) {
      entry.ratings.push(ans.rating_value);
    }
  }

  const dailyMap = new Map<string, { total: number; count: number }>();

  for (const [, entry] of answerMap) {
    for (const r of entry.ratings) {
      const existing = dailyMap.get(entry.date) ?? { total: 0, count: 0 };
      existing.total += r;
      existing.count += 1;
      dailyMap.set(entry.date, existing);
    }
  }

  const data = Array.from(dailyMap.entries())
    .map(([date, vals]) => ({
      date,
      avg: Number((vals.total / vals.count).toFixed(1)),
    }))
    .slice(-14);

  return <RatingChartClient data={data} />;
}
