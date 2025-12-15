import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="page" role="document">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
};
