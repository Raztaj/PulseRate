export interface Organization {
  id: string
  name: string
  subscription_plan: string
  created_at: string
}

export interface Admin {
  id: string
  user_id: string
  organization_id: string
  role: string
  created_at: string
}

export interface Staff {
  id: string
  organization_id: string
  name: string
  department: string
  position: string
  photo_url: string
  is_active: boolean
  form_id: string | null
  created_at: string
}

export interface Form {
  id: string
  organization_id: string
  title: string
  description: string
  is_active: boolean
  created_at: string
}

export interface Question {
  id: string
  form_id: string
  question_text: string
  question_type: 'star_rating' | 'text'
  is_required: boolean
  order_index: number
}

export interface Submission {
  id: string
  staff_id: string
  form_id: string
  submitted_at: string
}

export interface Answer {
  id: string
  submission_id: string
  question_id: string
  rating_value: number | null
  text_answer: string | null
}

export interface StaffWithStats extends Staff {
  avg_rating: number
  total_submissions: number
}

export interface DashboardStats {
  total_reviews: number
  avg_rating: number
  total_staff: number
  total_forms: number
}
