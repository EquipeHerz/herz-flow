import { createContext, useContext, useMemo, useState } from "react";
import type { Company } from "@/types/company";

type RegistrationState = {
  company: Company | null;
  setCompany: (company: Company | null) => void;
  clear: () => void;
};

const RegistrationContext = createContext<RegistrationState | undefined>(undefined);

export const RegistrationProvider = ({ children }: { children: React.ReactNode }) => {
  const [company, setCompany] = useState<Company | null>(null);

  const value = useMemo<RegistrationState>(
    () => ({
      company,
      setCompany,
      clear: () => setCompany(null),
    }),
    [company]
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
};

export const useRegistration = () => {
  const ctx = useContext(RegistrationContext);
  if (!ctx) {
    throw new Error("useRegistration must be used within a RegistrationProvider");
  }
  return ctx;
};

