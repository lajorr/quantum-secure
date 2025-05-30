import type { User } from "../../../shared/types/User";

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};
