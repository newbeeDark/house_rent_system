import React from 'react';

export const Privacy: React.FC = () => {
    return (
        <div style={{ background: 'linear-gradient(180deg,#eef3fb,#fff)', minHeight: '100vh', padding: '26px' }}>
            <main className="doc-wrap" role="main" aria-labelledby="title">
                <header className="doc-header">
                    <div className="auth-header-logo">UKM</div>
                    <div>
                        <h1 id="title" className="title" style={{ fontSize: '20px' }}>Privacy Policy — UKM Students off School Rented System</h1>
                        <div className="meta" style={{ color: 'var(--muted)', fontSize: '13px' }}>Last updated: 2025-12-07</div>
                    </div>
                </header>

                <hr style={{ border: 0, borderTop: '1px solid rgba(10,16,28,0.06)', margin: '14px 0' }} />

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>1. Introduction</h2>
                    <p>
                        This Privacy Policy explains how the UKM Students off School Rented System
                        collects, processes, stores, and protects your personal data in accordance
                        with the Personal Data Protection Act 2010 (PDPA).
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>2. Data We Collect</h2>
                    <ul>
                        <li>Account details: name, email, phone, hashed password.</li>
                        <li>Verification files: student ID, property ownership proof, agency licenses.</li>
                        <li>Listing & rental data: property info, pricing, location metadata.</li>
                        <li>Technical logs: device info, access logs, cookies for security and functionality.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>3. Purpose of Processing</h2>
                    <ul>
                        <li>Provide rental listing, search, and booking services.</li>
                        <li>Verify identity, property ownership, and agency legitimacy.</li>
                        <li>Prevent fraud and ensure platform safety.</li>
                        <li>Fulfill legal or regulatory requirements.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>4. Legal Basis under PDPA</h2>
                    <p>
                        Processing is based on user consent and legitimate purposes relevant to the
                        System's functions, including notice, choice, disclosure, security, retention,
                        and access/correction requirements under PDPA.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>5. Security & Retention</h2>
                    <p>
                        We apply reasonable safeguards such as encryption, controlled access, and
                        secure cloud storage.
                        Retention periods depend on rental contract requirements and legal obligations.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>6. Your Rights</h2>
                    <ul>
                        <li>Request access to your personal data.</li>
                        <li>Request correction of inaccurate information.</li>
                        <li>Withdraw consent where permitted.</li>
                        <li>Request deletion, subject to legal limitations.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>7. Sharing with Third Parties</h2>
                    <p>
                        Data may be shared with verification vendors, cloud storage services, and
                        authorities when required.
                        All third parties must follow PDPA-compliant data handling standards.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>8. Cookies</h2>
                    <p>
                        Cookies help improve user experience, security, and analytics.
                        You may adjust cookie preferences through browser settings.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>9. Changes</h2>
                    <p>
                        Updates may occur periodically. Continued use after changes constitutes
                        acceptance of the revised policy.
                    </p>
                </section>

                <div className="actions" style={{ marginTop: '16px' }}>
                    <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
                </div>

                <footer style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                    This is a placeholder Privacy Policy. A legal team should review before production deployment.
                </footer>
            </main>
        </div>
    );
};
