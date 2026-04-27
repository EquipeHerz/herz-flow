import type { Company } from "@/types/company";

const STORAGE_KEY = "herz_companies";

const readCompanies = (): Company[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Company[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCompanies = (companies: Company[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const companyService = {
  async getByCnpj(cnpj: string): Promise<Company | null> {
    await new Promise((r) => setTimeout(r, 400));
    const normalized = onlyDigits(cnpj);
    const companies = readCompanies();
    return companies.find((c) => onlyDigits(c.cnpj) === normalized) ?? null;
  },

  async create(company: Omit<Company, "id">): Promise<Company> {
    await new Promise((r) => setTimeout(r, 700));
    const normalized = onlyDigits(company.cnpj);
    const companies = readCompanies();

    if (companies.some((c) => onlyDigits(c.cnpj) === normalized)) {
      throw new Error("CNPJ já cadastrado");
    }

    const created: Company = {
      ...company,
      cnpj: normalized,
      id: crypto.randomUUID(),
    };

    writeCompanies([created, ...companies]);
    return created;
  },
};

