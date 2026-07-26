import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary mb-3 sm:mb-4">
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance">{title}</h1>
          {subtitle && <p className="text-sm sm:text-base text-muted-foreground mt-2 text-balance">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-5 sm:mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}