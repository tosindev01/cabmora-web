import { useAuth } from '@/features/auth/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <h1>Welcome, {user?.full_name}</h1>
      <p>
        Your projects will appear here — track progress, preview deliverables,
        leave comments and approve completed work.
      </p>
      {/* Phase 2: project list, media review, secure share links, ratings, payment */}
    </section>
  );
}
