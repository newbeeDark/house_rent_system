import React from 'react';

/**
 * Terms of Service Content Component
 * Extracted from src/pages/Terms.tsx
 */
export const TermsContent: React.FC = () => {
    return (
        <>
            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>1. Overview</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    These Terms of Service govern your access and use of the platform known as
                    "UKM Students off School Rented System". By creating an account or using
                    the System, you acknowledge and agree to comply with these Terms and any
                    referenced policies.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>2. Services</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    The System provides off-campus rental search, listing management, favourites,
                    comparison tools, document uploads, messaging features, and electronic contract
                    support for tenants, landlords, and registered agents.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>3. Account Eligibility</h2>
                <ul style={{ lineHeight: 1.8, marginBottom: 12, paddingLeft: 24 }}>
                    <li>All information provided during registration must be accurate.</li>
                    <li>You are responsible for maintaining confidentiality of your login credentials.</li>
                    <li>Users must have legal capacity to enter tenancy agreements.</li>
                </ul>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>4. User Obligations</h2>
                <ul style={{ lineHeight: 1.8, marginBottom: 12, paddingLeft: 24 }}>
                    <li>Do not upload fraudulent, misleading, or illegal documents.</li>
                    <li>Landlords and agents must upload only authorised and legitimate documentation.</li>
                    <li>Students must ensure accuracy of submitted identification details.</li>
                </ul>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>5. Electronic Contracts</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    Tenancy agreements formed on this System follow Malaysian contract law, including
                    the Contracts Act 1950.
                    Electronic submissions and signatures are recognised under the Electronic Commerce
                    Act 2006.
                    Users must ensure that the chosen signing method meets evidentiary requirements.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>6. Liability</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    The System acts solely as a technological platform. It is not a party to tenancy
                    contracts unless explicitly stated.
                    The System shall not be held responsible for disputes, misrepresentations, or losses
                    caused by user or third-party conduct.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>7. Consumer Rights</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    Users who qualify as consumers are protected under the Consumer Protection Act 1999,
                    including rights to fair information and safe transaction practices.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>8. Amendments</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    These Terms may be updated periodically. Continued use of the System after updates
                    constitutes acceptance of the latest version.
                </p>
            </section>

            <footer style={{ marginTop: 24, padding: 16, background: '#fff3cd', borderRadius: 8, fontSize: 13, color: '#856404', textAlign: 'center' }}>
                This is a placeholder Terms of Service. Legal review is required before production use.
            </footer>
        </>
    );
};

/**
 * Privacy Policy Content Component
 * Extracted from src/pages/Privacy.tsx
 */
export const PrivacyContent: React.FC = () => {
    return (
        <>
            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>1. Introduction</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    This Privacy Policy explains how the UKM Students off School Rented System
                    collects, processes, stores, and protects your personal data in accordance
                    with the Personal Data Protection Act 2010 (PDPA).
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>2. Data We Collect</h2>
                <ul style={{ lineHeight: 1.8, marginBottom: 12, paddingLeft: 24 }}>
                    <li>Account details: name, email, phone, hashed password.</li>
                    <li>Verification files: student ID, property ownership proof, agency licenses.</li>
                    <li>Listing & rental data: property info, pricing, location metadata.</li>
                    <li>Technical logs: device info, access logs, cookies for security and functionality.</li>
                </ul>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>3. Purpose of Processing</h2>
                <ul style={{ lineHeight: 1.8, marginBottom: 12, paddingLeft: 24 }}>
                    <li>Provide rental listing, search, and booking services.</li>
                    <li>Verify identity, property ownership, and agency legitimacy.</li>
                    <li>Prevent fraud and ensure platform safety.</li>
                    <li>Fulfill legal or regulatory requirements.</li>
                </ul>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>4. Legal Basis under PDPA</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    Processing is based on user consent and legitimate purposes relevant to the
                    System's functions, including notice, choice, disclosure, security, retention,
                    and access/correction requirements under PDPA.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>5. Security & Retention</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    We apply reasonable safeguards such as encryption, controlled access, and
                    secure cloud storage.
                    Retention periods depend on rental contract requirements and legal obligations.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>6. Your Rights</h2>
                <ul style={{ lineHeight: 1.8, marginBottom: 12, paddingLeft: 24 }}>
                    <li>Request access to your personal data.</li>
                    <li>Request correction of inaccurate information.</li>
                    <li>Withdraw consent where permitted.</li>
                    <li>Request deletion, subject to legal limitations.</li>
                </ul>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>7. Sharing with Third Parties</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    Data may be shared with verification vendors, cloud storage services, and
                    authorities when required.
                    All third parties must follow PDPA-compliant data handling standards.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>8. Cookies</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    Cookies help improve user experience, security, and analytics.
                    You may adjust cookie preferences through browser settings.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '17px', color: '#2c5282', margin: '18px 0 10px', fontWeight: 700 }}>9. Changes</h2>
                <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
                    Updates may occur periodically. Continued use after changes constitutes
                    acceptance of the revised policy.
                </p>
            </section>

            <footer style={{ marginTop: 24, padding: 16, background: '#e7f5ff', borderRadius: 8, fontSize: 13, color: '#1864ab', textAlign: 'center' }}>
                This is a placeholder Privacy Policy. A legal team should review before production deployment.
            </footer>
        </>
    );
};
