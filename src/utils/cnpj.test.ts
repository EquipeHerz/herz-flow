import { describe, expect, it } from "vitest";
import { generateCnpj } from "./cnpj";
import { isValidCNPJ } from "@/validation/companyRegistration";

describe("generateCnpj", () => {
  it("should generate a valid CNPJ", () => {
    const cnpj = generateCnpj();
    expect(cnpj).toMatch(/^\d{14}$/);
    expect(isValidCNPJ(cnpj)).toBe(true);
  });
});

