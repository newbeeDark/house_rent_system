import React from "react";

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`admin-card ${className}`}>
    {children}
  </div>
);
