"use server";

import { createClient } from "@/lib/supabase/server";

export async function exportCsv(orgId: string) {
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, department, position")
    .eq("organization_id", orgId)
    .eq("is_active", true);

  if (!staff || staff.length === 0) return null;

  const staffWithStats = await Promise.all(
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

      return {
        Name: member.name,
        Department: member.department || "—",
        Position: member.position || "—",
        "Avg Rating": avg.toFixed(1),
        "Total Reviews": ratings.length,
      };
    })
  );

  const headers = Object.keys(staffWithStats[0]).join(",");
  const rows = staffWithStats.map((row) =>
    Object.values(row)
      .map((v) => `"${v}"`)
      .join(",")
  );

  return [headers, ...rows].join("\n");
}
