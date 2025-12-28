import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileSidebar: React.FC<Props> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden'; // Prevent scroll
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!user) return null;

    const handleLogout = () => {
        onClose();
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 9998,
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 0.3s ease'
                }}
            />

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100vh',
                    width: '300px',
                    background: '#fff',
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
                    zIndex: 9999,
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.2, 0.9, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{ padding: '24px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: 'white'
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '16px' }}>{user.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'capitalize' }}>{user.role} Account</div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link to="/profile" onClick={onClose} className="sidebar-link">
                        👤 My Profile Note
                    </Link>
                    <Link to="/profile" onClick={onClose} className="sidebar-link">
                        ⚙️ Application Settings
                    </Link>
                    <div style={{ height: 1, background: '#eee', margin: '8px 0' }}></div>
                    <Link to="/messages" onClick={onClose} className="sidebar-link">
                        🔔 Messages
                    </Link>
                    <Link to="/favorites" onClick={onClose} className="sidebar-link">
                        ❤️ Favorites
                    </Link>
                    <Link to="/applications" onClick={onClose} className="sidebar-link">
                        📋 My Applications
                    </Link>
                    <div style={{ height: 1, background: '#eee', margin: '8px 0' }}></div>
                    <Link to="/terms" onClick={onClose} className="sidebar-link">
                        📄 Terms & Privacy
                    </Link>
                </div>

                <div style={{ padding: 20, borderTop: '1px solid #f0f0f0' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 8,
                            border: '1px solid var(--danger)',
                            color: 'var(--danger)',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
            <style>{`
                .sidebar-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    color: var(--ink);
                    text-decoration: none;
                    transition: background 0.1s;
                    font-size: 14px;
                    font-weight: 500;
                }
                .sidebar-link:hover {
                    background: #f5f7fa;
                    color: var(--accent);
                }
            `}</style>
        </>
    );
};
