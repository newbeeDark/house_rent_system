import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProfileSidebar } from './ProfileSidebar';

export const Navbar: React.FC = () => {
    const { user, login, logout } = useAuth();
    const [isManagementMode, setIsManagementMode] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    // Permission check placeholder
    const canManageProperties = true;

    const toggleManagementMode = () => {
        setIsManagementMode(prev => !prev);
    };

    return (
        <>
            <header className="appbar" role="banner" aria-label="Top navigation">
                <div className="brand">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}>
                        <div className="logo" aria-hidden="true">UKM</div>
                        <div>
                            <div className="title">UKM Students off School Rented System</div>
                            <div className="subtitle">Find trusted off-campus housing near you</div>
                        </div>
                    </Link>
                </div>

                <nav className="actions" role="navigation" aria-label="Main actions" id="topNav">
                    {/* Dynamic Navigation Links Based on Mode */}
                    {!isManagementMode ? (
                        // Standard Navigation Mode
                        <>
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/favorites" className="nav-link">Favorites</Link>
                            <Link to="/terms" className="nav-link" style={{ color: 'var(--muted)' }}>Terms</Link>
                            <Link to="/privacy" className="nav-link" style={{ color: 'var(--muted)' }}>Privacy</Link>
                        </>
                    ) : (
                        // Management Navigation Mode
                        <>
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/create-listing" className="nav-link">Create Listing</Link>
                            <Link to="/applications" className="nav-link">Applications</Link>
                            <Link to="/messages" className="nav-link">Messages</Link>
                        </>
                    )}

                    {/* Managing Properties Toggle Button (Dropdown Content Removed) */}
                    {canManageProperties && (
                        <button
                            onClick={toggleManagementMode}
                            className={`nav-link ${isManagementMode ? 'active' : ''}`}
                            style={{
                                border: '1px solid rgba(0,0,0,0.06)',
                                fontWeight: 600
                            }}
                        >
                            Managing Properties
                        </button>
                    )}

                    {/* Divider */}
                    {user && <div style={{ width: 1, height: 20, background: '#e0e0e0', margin: '0 4px' }}></div>}

                    {/* User Section */}
                    {user ? (
                        <div className="user-greet" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="nav-link"
                                style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8, border: 0, background: 'transparent' }}
                            >
                                <div style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'white'
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>Profile</span>
                            </button>
                            <button
                                onClick={logout}
                                className="nav-link"
                                style={{ color: 'var(--danger)', fontWeight: 500 }}
                            >
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 16px' }}>
                                Log in
                            </Link>
                            <Link to="/register" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px', borderRadius: 10 }}>
                                Sign up
                            </Link>
                            <button
                                onClick={() => login('guest')}
                                className="btn btn-ghost"
                                title="Continue as guest"
                                style={{ fontSize: '12px', opacity: 0.7 }}
                            >
                                Guest
                            </button>
                        </>
                    )}
                </nav>
            </header>

            <ProfileSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
        </>
    );
};
