import React from 'react';

interface LogoProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ className, style }) => {
    return (
        <div
            className={`logo ${className || ''}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                ...style
            }}
        >
            {/* Icon */}
            <div
                className="icon"
                aria-hidden="true"
                style={{
                    width: 64,
                    height: 50,
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '16px',
                    boxShadow: '0 12px 34px rgba(14,54,120,0.12)',
                    flexShrink: 0
                }}
            >
                UKM
            </div>

            {/* Text */}
            <div>
                <div
                    className="title"
                    id="page-title"
                    style={{
                        fontWeight: 800,
                        fontSize: '18px',
                        lineHeight: '1.2'
                    }}
                >
                    UKM Students off School Rented System
                </div>

                <div
                    className="subtitle"
                    style={{
                        fontSize: '13px',
                        color: 'var(--muted-dark)',
                        marginTop: '2px'
                    }}
                >
                    Sign in to find & manage off-campus housing
                </div>
            </div>
        </div>
    );
};
