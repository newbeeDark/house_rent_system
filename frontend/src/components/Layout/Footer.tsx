import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="site-footer" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', padding: '10px 0' }}>
            © 2025 UKM Students off School Rented System. Links: <Link to="/login">Login</Link> · <Link to="/register">Register</Link>
        </footer>
    );
};
