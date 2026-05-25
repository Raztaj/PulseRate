"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/actions/auth";
import { setAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();

  async function wrappedLogin(
    _prev: { error?: string } | null,
    formData: FormData
  ) {
    const result = await loginUser(formData);
    if (result.success) {
      setAuth(result.adminId!, result.orgId!);
      router.push("/dashboard");
    }
    return result;
  }

  const [state, formAction, pending] = useActionState(wrappedLogin, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="بريدك@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري تسجيل الدخول...
          </>
        ) : (
          "تسجيل الدخول"
        )}
      </Button>
    </form>
  );
}
