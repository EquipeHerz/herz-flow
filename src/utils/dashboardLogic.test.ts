import { describe, it, expect } from 'vitest';

// Simulating the deduplication logic used in Dashboard.tsx
const formatAgentName = (agentId: string | null | undefined): string => {
  if (!agentId) return "Agente Bot";
  const agentStr = String(agentId);
  // Case insensitive check for "agente" prefix
  return agentStr.toLowerCase().startsWith("agente") ? agentStr : `Agente ${agentStr}`;
};

// Simulating the origin detection logic used in Dashboard.tsx
const determineOrigin = (redesocial: string | null | undefined): string => {
  const rawOrigin = String(redesocial || "").toLowerCase();
  
  if (rawOrigin.includes("sms")) return "ayla";
  if (rawOrigin.includes("facebook")) return "facebook";
  if (rawOrigin.includes("instagram")) return "instagram";
  return "whatsapp"; // Default fallback
};

describe('Agent Name Deduplication Logic', () => {
  it('should add "Agente" prefix if missing', () => {
    expect(formatAgentName("Bot")).toBe("Agente Bot");
    expect(formatAgentName("Support")).toBe("Agente Support");
    expect(formatAgentName("123")).toBe("Agente 123");
  });

  it('should NOT add "Agente" prefix if already present (case insensitive)', () => {
    expect(formatAgentName("Agente Bot")).toBe("Agente Bot");
    expect(formatAgentName("agente bot")).toBe("agente bot");
    expect(formatAgentName("AGENTE 007")).toBe("AGENTE 007");
  });

  it('should return "Agente Bot" for null/undefined/empty inputs', () => {
    expect(formatAgentName(null)).toBe("Agente Bot");
    expect(formatAgentName(undefined)).toBe("Agente Bot");
    expect(formatAgentName("")).toBe("Agente Bot");
  });
});

describe('Social Media Origin Detection Logic', () => {
  it('should identify SMS/Ayla correctly', () => {
    expect(determineOrigin("SMS")).toBe("ayla");
    expect(determineOrigin("sms gateway")).toBe("ayla");
  });

  it('should identify Facebook correctly', () => {
    expect(determineOrigin("Facebook")).toBe("facebook");
    expect(determineOrigin("facebook messenger")).toBe("facebook");
  });

  it('should identify Instagram correctly', () => {
    expect(determineOrigin("Instagram")).toBe("instagram");
    expect(determineOrigin("instagram direct")).toBe("instagram");
  });

  it('should identify WhatsApp correctly (explicit and default)', () => {
    expect(determineOrigin("Whatsapp")).toBe("whatsapp");
    expect(determineOrigin("whatsapp business")).toBe("whatsapp");
    
    // Default cases
    expect(determineOrigin(null)).toBe("whatsapp");
    expect(determineOrigin(undefined)).toBe("whatsapp");
    expect(determineOrigin("unknown source")).toBe("whatsapp");
  });
});
