import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRDisplay } from "@/components/qr-display";
import { DeleteStaffButton } from "@/components/delete-staff-button";
import { getInitials } from "@/lib/utils";
import { Star, MessageSquare } from "lucide-react";

export default async function StaffDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .single();

  if (!staff) notFound();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, submitted_at")
    .eq("staff_id", id)
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

  const initials = getInitials(staff.name ?? "");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{staff.name}</h1>
            {avgRating && (
              <Badge
                variant={
                  Number(avgRating) >= 4
                    ? "default"
                    : Number(avgRating) >= 3
                    ? "secondary"
                    : "destructive"
                }
                className="text-sm"
              >
                {avgRating}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {staff.position && `${staff.position}`}
            {staff.department && ` · ${staff.department}`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {ratings.length} تقييم
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-4 w-4" />
              توزيع التقييمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ratings.length > 0 ? (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratings.filter((r) => r === star).length;
                  const pct = (count / ratings.length) * 100;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-8">{star}★</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                لا توجد تقييمات بعد
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              رمز الاستجابة السريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <QRDisplay
              value={`${baseUrl}/rate/${staff.id}`}
              staffName={staff.name}
            />
          </CardContent>
        </Card>
      </div>

      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">أحدث التعليقات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comments.slice(0, 10).map((comment, i) => (
                <div key={i} className="rounded-lg border p-3 text-sm">
                  &ldquo;{comment}&rdquo;
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <DeleteStaffButton staffId={staff.id} />
      </div>
    </div>
  );
}
