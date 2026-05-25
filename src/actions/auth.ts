"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const orgName = formData.get("orgName") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !orgName || !name) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
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
    return { error: "Failed to create user." };
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName })
    .select()
    .single();

  if (orgError) {
    return { error: "Failed to create organization." };
  }

  const { error: adminError } = await supabase.from("admins").insert({
    user_id: authData.user.id,
    organization_id: org.id,
    role: "admin",
  });

  if (adminError) {
    return { error: "Failed to setup admin account." };
  }

  const { error: formError } = await supabase.from("forms").insert({
    organization_id: org.id,
    title: "Default Feedback Form",
    description: "Rate your service experience",
  });

  if (formError) {
    return { error: "Failed to create default form." };
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
        question_text: "How was the service quality?",
        question_type: "star_rating",
        is_required: true,
        order_index: 0,
      },
      {
        form_id: questionsData.id,
        question_text: "How was the professionalism?",
        question_type: "star_rating",
        is_required: true,
        order_index: 1,
      },
      {
        form_id: questionsData.id,
        question_text: "Additional comments",
        question_type: "text",
        is_required: false,
        order_index: 2,
      },
    ]);
  }

  return { success: true };
}
