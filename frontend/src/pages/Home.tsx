import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useAuthStore } from '../stores/authStore'

export default function Home() {
  const { isAuthenticated, user } = useAuthStore()
  
  return (
    <div className="container">
      <div className="header">
        <ThemeToggle />
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: '#6b7280'
              }}>
                {user?.nickname?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase()}
              </div>
              <span>{user?.nickname || user?.email}</span>
            </Link>
          </div>
        )}
      </div>
      <div className="card" style={{textAlign:'center'}}>
        <h1 className="title">House Rental Platform</h1>
        <p className="subtitle">
          {isAuthenticated 
            ? `Welcome back, ${user?.nickname || user?.email}!`
            : 'Sign in or create an account to continue'
          }
        </p>
        <div className="actions">
          {isAuthenticated ? (
            <>
              <Link className="btn" to="/dashboard">Dashboard</Link>
              <Link className="btn btn-outline" to="/profile">My Profile</Link>
            </>
          ) : (
            <>
              <Link className="btn" to="/login">Sign in</Link>
              <Link className="btn btn-outline" to="/register">Create account</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}