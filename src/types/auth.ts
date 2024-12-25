import { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
  isAdmin?: boolean;
}

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
};