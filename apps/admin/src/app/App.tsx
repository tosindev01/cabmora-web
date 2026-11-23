import { BrowserRouter } from 'react-router-dom';

import AdminRouter from '@/app/router';
import { AdminAuthProvider } from '@/shared/auth';
import { AdminProvider } from '@/shared/store';

export default function App() {
  return (
    // Auth wraps the store: the session is app-wide state decided by one
    // /auth/me on mount, while AdminProvider holds domain data the screens
    // render. They were tangled together before, which is how a `useState(true)`
    // login flag ended up guarding the console.
    <AdminAuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <AdminRouter />
        </BrowserRouter>
      </AdminProvider>
    </AdminAuthProvider>
  );
}
