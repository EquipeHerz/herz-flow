import { describe, expect, it } from "vitest";
import { digitsOnly, formatCnpj } from "./inputMasks";

describe("inputMasks", () => {
  it("digitsOnly removes non-digits", () => {
    expect(digitsOnly("31.382.673/0001-87")).toBe("31382673000187");
    expect(digitsOnly("  000.000.000-00 ")).toBe("00000000000");
    expect(digitsOnly("RG 12.345.678")).toBe("12345678");
  });

  it("formatCnpj formats progressively and caps at 14 digits", () => {
    expect(formatCnpj("")).toBe("");
    expect(formatCnpj("3")).toBe("3");
    expect(formatCnpj("31")).toBe("31");
    expect(formatCnpj("313")).toBe("31.3");
    expect(formatCnpj("31382")).toBe("31.382");
    expect(formatCnpj("3138267")).toBe("31.382.67");
    expect(formatCnpj("3138267300")).toBe("31.382.673/00");
    expect(formatCnpj("313826730001")).toBe("31.382.673/0001");
    expect(formatCnpj("3138267300018")).toBe("31.382.673/0001-8");
    expect(formatCnpj("31382673000187")).toBe("31.382.673/0001-87");
    expect(formatCnpj("31.382.673/0001-87999")).toBe("31.382.673/0001-87");
  });
});

