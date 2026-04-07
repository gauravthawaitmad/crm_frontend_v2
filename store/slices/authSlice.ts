import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  user_id: string;
  email: string;
  user_display_name: string;
  user_role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      // Persist to localStorage (api.ts reads 'auth' for the Bearer token)
      localStorage.setItem('auth', action.payload.token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      // Set cookie so Next.js middleware can read it for SSR redirect logic
      document.cookie = `auth_token=${action.payload.token}; path=/; max-age=86400; SameSite=lax`;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
      localStorage.removeItem('auth_user');
      document.cookie = 'auth_token=; path=/; max-age=0; SameSite=lax';
    },
    // Restore Redux state from localStorage on page reload (called by SessionRestorer)
    restoreSession(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
  },
});

export const { setCredentials, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
