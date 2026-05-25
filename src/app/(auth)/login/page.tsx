import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-xl bg-white shadow-sm border border-[#E5DEC9] flex items-center justify-center p-1">
            <img src="/logo.svg" alt="خاتون" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold">خاتون</h1>
          <p className="text-muted-foreground text-sm">
            تسجيل الدخول إلى حسابك
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <a href="/register" className="underline underline-offset-4 hover:text-primary">
            إنشاء حساب
          </a>
        </p>
      </div>
    </div>
  );
}
