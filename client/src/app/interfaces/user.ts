export type UserRole = 'admin' | 'customer';

// The signed-in user, as the API returns it. The API never sends a password (or its hash) to the browser.
export interface User {
  id: number;
  email: string;
  role: UserRole;
  customerId: number | null;
}

// What the app keeps after login
export type SessionUser = User;
