import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand">
          Cabmora
        </Link>
        <nav>
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button type="button" className="link-button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Sign up</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        © {new Date().getFullYear()} Cabmora Limited
      </footer>
    </div>
  );
}
