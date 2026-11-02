
/*
Purpose:
- Save the current user's session after login.
- Retrieve the token for protected API calls.
- Clear the session when the user logs out.
*/

export type SessionUser = {
  id: number | string;
  username: string;
  email: string;
  role: 'user' | 'admin';
};

// Purpose: Save the token and public user information after successful login.
export function saveSession(token: string, user: SessionUser): void {
  localStorage.setItem('booknest_token', token);
  localStorage.setItem('booknest_user', JSON.stringify(user));
}

// Purpose: Retrieve the current login token.
export function getToken(): string | null {
  return localStorage.getItem('booknest_token');
}

// Purpose: Read the current user's public profile from browser storage.
export function getSessionUser(): SessionUser | null {
  const storedUser = localStorage.getItem('booknest_user');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as SessionUser;
  } catch {
    return null;
  }
}

// Purpose: Remove local session data when the user logs out.
export function clearSession(): void {
  localStorage.removeItem('booknest_token');
  localStorage.removeItem('booknest_user');
}
