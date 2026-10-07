export type UserRole = 'admin' | 'customer';

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  customerId: number | null;
}
