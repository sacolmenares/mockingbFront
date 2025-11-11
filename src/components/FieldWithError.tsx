import React from "react";

interface FieldWithErrorProps {
  children: React.ReactNode;
  error?: string;
}

export const FieldWithError: React.FC<FieldWithErrorProps> = ({ children, error }) => (
  <div className="mb-4">
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);
