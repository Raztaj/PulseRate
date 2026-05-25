"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const orgName = formData.get("orgName") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !orgName || !name) {
    return { error: "جميع الحقول مطلوبة." };
  }

  if (password.length < 6) {
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." };
  }

  const supabase = createAdminClient();

  const { data: authData, error: authError } = await supabase.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
    }
  );

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "فشل إنشاء المستخدم." };
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName })
    .select()
    .single();

  if (orgError) {
    return { error: "فشل إنشاء المنشأة." };
  }

  const { error: adminError } = await supabase.from("admins").insert({
    user_id: authData.user.id,
    organization_id: org.id,
    role: "admin",
  });

  if (adminError) {
    return { error: "فشل إعداد حساب المسؤول." };
  }

  const { error: formError } = await supabase.from("forms").insert({
    organization_id: org.id,
    title: "نموذج التقييم الافتراضي",
    description: "قم بتقييم تجربة الخدمة",
  });

  if (formError) {
    return { error: "فشل إنشاء النموذج الافتراضي." };
  }

  const { data: questionsData } = await supabase
    .from("forms")
    .select("id")
    .eq("organization_id", org.id)
    .single();

  if (questionsData) {
    await supabase.from("questions").insert([
      {
        form_id: questionsData.id,
        question_text: "كيف كانت جودة الخدمة؟",
        question_type: "star_rating",
        is_required: true,
        order_index: 0,
      },
      {
        form_id: questionsData.id,
        question_text: "كيف كانت الاحترافية؟",
        question_type: "star_rating",
        is_required: true,
        order_index: 1,
      },
      {
        form_id: questionsData.id,
        question_text: "تعليقات إضافية",
        question_type: "text",
        is_required: false,
        order_index: 2,
      },
    ]);
  }

  return { success: true };
}
