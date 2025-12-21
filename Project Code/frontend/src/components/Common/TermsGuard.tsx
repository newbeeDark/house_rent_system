import { useAuth } from '../../context/AuthContext';
import { TermsModal } from './TermsModal';

export default function TermsGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // While loading auth state, render children normally (avoid flash)
  if (loading) {
    return <>{children}</>;
  }

  // If user is NOT logged in, no terms check needed (public pages)
  if (!user) {
    return <>{children}</>;
  }

  // Strict Check: If terms NOT accepted, show modal OVERLAY
  if (!user.terms_accepted_at) {
    return (
      <>
        {/* Render children but make them non-interactive */}
        <div
          style={{
            filter: 'blur(3px)',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          {children}
        </div>

        {/* Modal Overlay */}
        <TermsModal />
      </>
    );
  }

  // Terms accepted - render normally
  return <>{children}</>;
}
