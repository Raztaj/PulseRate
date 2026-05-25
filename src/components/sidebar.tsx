"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/dashboard/staff", label: "الموظفين", icon: Users },
  { href: "/dashboard/forms", label: "النماذج", icon: ClipboardList },
  { href: "/dashboard/reports", label: "التقارير", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex h-full w-60 flex-col border-l bg-card">
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-1">
          <img src="/logo.svg" alt="خاتون" className="w-full h-full" />
        </div>
        <span className="text-xl font-bold">خاتون</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 space-y-2">
        <p className="text-xs text-muted-foreground text-center">منذ 1436</p>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="ml-2 h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );
}
