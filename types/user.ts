export interface User {
  user_id: string;
  email: string;
  user_login: string;
  user_display_name: string;
  user_role: string;
  reporting_manager_user_id?: string;
  reporting_manager_role_code?: string;
  reporting_manager_user_login?: string;
  city?: string;
  state?: string;
  center?: string;
  contact?: string;
}

export interface UserPassword {
  id: number;
  user_id: string;
  emailVerified: boolean;
  authType?: string;
  reset_token?: string;
  reset_token_expiry?: string;
}
