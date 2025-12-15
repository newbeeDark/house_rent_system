import React from 'react';


export const Terms: React.FC = () => {
    return (
        <div style={{ background: 'linear-gradient(180deg,#eef3fb,#fff)', minHeight: '100vh', padding: '28px' }}>
            <main className="doc-wrap" role="main" aria-labelledby="title">
                <header className="doc-header">
                    <div className="auth-header-logo">UKM</div>
                    <div>
                        <h1 id="title" className="title" style={{ fontSize: '20px' }}>Terms of Service — UKM Students off School Rented System</h1>
                        <div className="meta" style={{ color: 'var(--muted)', fontSize: '13px' }}>Last updated: 2025-12-07</div>
                    </div>
                </header>

                <hr style={{ border: 0, borderTop: '1px solid rgba(10,16,28,0.06)', margin: '16px 0' }} />

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>1. Overview</h2>
                    <p>
                        These Terms of Service govern your access and use of the platform known as
                        “UKM Students off School Rented System”. By creating an account or using
                        the System, you acknowledge and agree to comply with these Terms and any
                        referenced policies.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>2. Services</h2>
                    <p>
                        The System provides off-campus rental search, listing management, favourites,
                        comparison tools, document uploads, messaging features, and electronic contract
                        support for tenants, landlords, and registered agents.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>3. Account Eligibility</h2>
                    <ul>
                        <li>All information provided during registration must be accurate.</li>
                        <li>You are responsible for maintaining confidentiality of your login credentials.</li>
                        <li>Users must have legal capacity to enter tenancy agreements.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>4. User Obligations</h2>
                    <ul>
                        <li>Do not upload fraudulent, misleading, or illegal documents.</li>
                        <li>Landlords and agents must upload only authorised and legitimate documentation.</li>
                        <li>Students must ensure accuracy of submitted identification details.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>5. Electronic Contracts</h2>
                    <p>
                        Tenancy agreements formed on this System follow Malaysian contract law, including
                        the Contracts Act 1950.
                        Electronic submissions and signatures are recognised under the Electronic Commerce
                        Act 2006.
                        Users must ensure that the chosen signing method meets evidentiary requirements.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>6. Liability</h2>
                    <p>
                        The System acts solely as a technological platform. It is not a party to tenancy
                        contracts unless explicitly stated.
                        The System shall not be held responsible for disputes, misrepresentations, or losses
                        caused by user or third-party conduct.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>7. Consumer Rights</h2>
                    <p>
                        Users who qualify as consumers are protected under the Consumer Protection Act 1999,
                        including rights to fair information and safe transaction practices.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '17px', color: 'var(--accent-2)', margin: '18px 0 10px' }}>8. Amendments</h2>
                    <p>
                        These Terms may be updated periodically. Continued use of the System after updates
                        constitutes acceptance of the latest version.
                    </p>
                </section>

                <div className="actions" style={{ marginTop: '16px' }}>
                    <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
                </div>

                <footer style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                    This is a placeholder Terms of Service. Legal review is required before production use.
                </footer>
            </main>
        </div>
    );
};
