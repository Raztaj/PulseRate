import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { StaffWithStats } from "@/types";

export function StaffCard({ staff }: { staff: StaffWithStats }) {
  const initials = getInitials(staff.name);

  return (
    <Link href={`/dashboard/staff/${staff.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{staff.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {staff.position || staff.department || "—"}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {staff.total_submissions} تقييم
            </span>
            {staff.total_submissions > 0 ? (
              <Badge
                variant={
                  staff.avg_rating >= 4
                    ? "default"
                    : staff.avg_rating >= 3
                    ? "secondary"
                    : "destructive"
                }
              >
                {staff.avg_rating.toFixed(1)} متوسط
              </Badge>
            ) : (
              <Badge variant="outline">لا توجد تقييمات</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
