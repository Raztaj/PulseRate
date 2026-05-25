"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getDashboardStats(orgId: string) {
  const supabase = createAdminClient();

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

  return { totalReviews, avgRating, totalStaff, totalForms };
}

export async function getStaffList(orgId: string) {
  const supabase = createAdminClient();

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

  return staffWithStats;
}

export async function getStaffLeaderboard(orgId: string, limit = 5) {
  const supabase = createAdminClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, department, position")
    .eq("organization_id", orgId)
    .eq("is_active", true);

  if (!staff || staff.length === 0) return [];

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

  return staffWithRatings
    .filter((s) => s.total > 0)
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, limit);
}

export async function getRatingChartData(orgId: string) {
  const supabase = createAdminClient();

  const { data: orgStaff } = await supabase
    .from("staff")
    .select("id")
    .eq("organization_id", orgId);

  const staffIds = (orgStaff ?? []).map((s) => s.id);

  if (staffIds.length === 0) return [];

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, submitted_at")
    .in("staff_id", staffIds)
    .order("submitted_at", { ascending: true });

  if (!submissions || submissions.length === 0) return [];

  const submissionIds = submissions.map((s) => s.id);

  const { data: answers } = await supabase
    .from("answers")
    .select("submission_id, rating_value")
    .in("submission_id", submissionIds)
    .not("rating_value", "is", null);

  const answerMap = new Map<string, { ratings: number[]; date: string }>();

  for (const sub of submissions) {
    answerMap.set(sub.id, {
      ratings: [],
      date: new Date(sub.submitted_at).toLocaleDateString("ar-SA", {
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

  return Array.from(dailyMap.entries())
    .map(([date, vals]) => ({
      date,
      avg: Number((vals.total / vals.count).toFixed(1)),
    }))
    .slice(-14);
}

export async function getRecentFeedback(orgId: string, limit = 10) {
  const supabase = createAdminClient();

  const { data: orgStaff } = await supabase
    .from("staff")
    .select("id")
    .eq("organization_id", orgId);

  const staffIds = (orgStaff ?? []).map((s) => s.id);

  if (staffIds.length === 0) return [];

  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      "id, submitted_at, staff_id, staff:staff(name)"
    )
    .in("staff_id", staffIds)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (!submissions || submissions.length === 0) return [];

  const submissionIds = submissions.map((s) => s.id);

  const { data: answers } = await supabase
    .from("answers")
    .select("submission_id, rating_value, text_answer")
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

  return submissions.map((sub) => {
    const entry = answerMap.get(sub.id);
    const avg =
      entry && entry.ratings.length > 0
        ? (entry.ratings.reduce((a, b) => a + b, 0) / entry.ratings.length).toFixed(1)
        : null;

    return {
      id: sub.id,
      staffName: (sub.staff as unknown as { name: string } | null)?.name ?? "غير معروف",
      submittedAt: sub.submitted_at,
      ratings: entry?.ratings ?? [],
      comments: entry?.comments ?? [],
      avg,
    };
  });
}

export async function getForms(orgId: string) {
  const supabase = createAdminClient();

  const { data: formsRaw } = await supabase
    .from("forms")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const formsWithQuestions = await Promise.all(
    (formsRaw ?? []).map(async (form) => {
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .eq("form_id", form.id)
        .order("order_index");
      return { ...form, questions: questions ?? [] };
    })
  );

  return formsWithQuestions;
}

export async function getStaffDetail(staffId: string) {
  const supabase = createAdminClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("id", staffId)
    .single();

  if (!staff) return null;

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, submitted_at")
    .eq("staff_id", staffId)
    .order("submitted_at", { ascending: false });

  const { data: answers } = await supabase
    .from("answers")
    .select("rating_value, text_answer")
    .in(
      "submission_id",
      (submissions ?? []).map((s) => s.id)
    );

  const ratings = (answers ?? [])
    .map((a) => a.rating_value)
    .filter((r): r is number => r !== null);

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null;

  const comments = (answers ?? [])
    .map((a) => a.text_answer)
    .filter((t): t is string => t !== null && t.length > 0);

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r === star).length,
  }));

  return {
    staff,
    submissions: submissions ?? [],
    avgRating,
    ratings,
    comments,
    ratingDistribution,
  };
}

export async function getAdminByEmail(email: string) {
  const supabase = createAdminClient();

  const { data: admin } = await supabase
    .from("admins")
    .select("id, organization_id")
    .eq("email", email)
    .single();

  return admin;
}
