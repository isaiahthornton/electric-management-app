export type UserRole = 'admin' | 'customer';

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  customerId: number | null;
}

// What the app keeps after login: the user record without the password
export type SessionUser = Omit<User, 'password'>;
