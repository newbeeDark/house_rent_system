import React from 'react';
import { Layout } from '../components/Layout/Layout';

export const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <Layout>
        <div style={{ padding: 40, textAlign: 'center' }}>
            <h1 className="title" style={{ fontSize: 24 }}>{title}</h1>
            <p className="subtitle">This page is under construction or requires authentication logic.</p>
        </div>
    </Layout>
);
