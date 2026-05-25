"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await registerUser(formData);
      if (result.success) {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email, password });
      }
      return result;
    },
    null
  );

  if (state?.success) {
    router.push("/dashboard");
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Your Name</Label>
        <Input id="name" name="name" placeholder="Ahmed" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="orgName">Business Name</Label>
        <Input id="orgName" name="orgName" placeholder="Elite Salon" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
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
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
            account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
