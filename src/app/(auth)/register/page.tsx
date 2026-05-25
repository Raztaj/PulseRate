import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <img src="/logo.svg" alt="خاتون" width={64} height={64} className="mx-auto rounded-xl" />
          <h1 className="text-2xl font-bold">خاتون</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إنشاء حساب جديد
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <a href="/login" className="underline underline-offset-4 hover:text-primary">
            تسجيل الدخول
          </a>
        </p>
      </div>
    </div>
  );
}
