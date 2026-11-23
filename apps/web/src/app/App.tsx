import { BrowserRouter } from 'react-router-dom';

import AppRouter from '@/app/router';
import { AuthProvider } from '@/shared/auth';

export default function App() {
  return (
    // AuthProvider was written months ago and never mounted, so `useAuth()`
    // would have thrown the moment a screen called it. It sits outside the
    // router because the session is app-wide state, not per-route: one
    // /auth/me on mount decides whether the cookie the browser is holding is
    // still a session.
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}
