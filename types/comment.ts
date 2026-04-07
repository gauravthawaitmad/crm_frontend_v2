export interface Comment {
  id: number
  partner_id: number
  user_id: number
  comment_text: string
  is_edited: boolean
  edited_at?: string
  createdAt: string
  updatedAt: string
  author?: {
    user_display_name: string
    user_role: string
  }
}
