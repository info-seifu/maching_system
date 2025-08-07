export interface Student {
  id: string
  user_id?: string
  name: string
  furigana?: string
  birthday: string
  gender: '男' | '女'
  expertise: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  user_id?: string
  name: string
  industry?: string
  location?: string
  contact_email: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  company_id: string
  title: string
  description?: string
  required_expertise: string[]
  start_date?: string
  end_date?: string
  status: 'OPEN' | 'CLOSED'
  created_at: string
  updated_at: string
  company?: Company
}

export interface Match {
  id: string
  student_id: string
  position_id: string
  match_score: number
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED'
  created_at: string
  updated_at: string
  student?: Student
  position?: Position
}

export interface Notification {
  id: string
  user_id: string
  type: string
  payload: any
  is_read: boolean
  created_at: string
}
