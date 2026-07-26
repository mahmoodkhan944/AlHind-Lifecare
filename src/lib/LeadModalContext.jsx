import React, { createContext, useContext, useState, useCallback } from "react";

const LeadModalContext = createContext(null);

export function LeadModalProvider({ children }) {
  const [state, setState] = useState({ open: false, context: null });

  const openLeadModal = useCallback((context = {}) => {
    setState({ open: true, context });
  }, []);

  const closeLeadModal = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <LeadModalContext.Provider value={{ ...state, openLeadModal, closeLeadModal }}>
      {children}
    </LeadModalContext.Provider>
  );
}

export function useLeadModal() {
  const ctx = useContext(LeadModalContext);
  if (!ctx) throw new Error("useLeadModal must be used within a LeadModalProvider");
  return ctx;
}
