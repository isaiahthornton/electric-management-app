import { SessionUser } from './user';

// What POST /api/auth/login and /api/auth/register return
export interface AuthResponse {
  token: string; // the signed JWT, sent back on every request as "Authorization: Bearer <token>"
  expiresAt: string; // ISO date (UTC) when the token stops working
  user: SessionUser;
}
