import styled from "styled-components";

/**
 * Styled Button
 * Propósito original: Fornecer um botão com variantes (default, destructive, outline, secondary, ghost, link)
 * Contexto de uso: Ações primárias/secundárias em formulários, modais e navegação
 * Estados especiais: hover, focus-visible com anel (ring + ring-offset), disabled (inativo)
 * Responsabilidades específicas: Aplicar tipografia, espaçamentos e transições compatíveis com o design system
 */

type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type Size = "default" | "sm" | "lg" | "icon";

export interface StyledButtonProps {
  $variant?: Variant;
  $size?: Size;
}

export const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !["$variant", "$size", "asChild"].includes(String(prop)),
})<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* [&_svg]:size-4 and spacing */
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  transition: ${({ theme }) => theme.transitions.colors};
  pointer-events: auto;

  /* SVG children matching utility behavior */
  & svg { pointer-events: none; width: 1rem; height: 1rem; flex-shrink: 0; }

  /* Disabled state */
  &:disabled { opacity: 0.5; pointer-events: none; }

  /* Focus ring with offset to emulate ring-offset-background */
  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.ring},
      0 0 0 4px ${({ theme }) => theme.colors.background};
  }

  /* Sizes */
  ${({ $size }) => {
    switch ($size) {
      case "sm":
        return `height: 2.25rem; padding: 0 0.75rem; border-radius: var(--radius);`;
      case "lg":
        return `height: 2.75rem; padding: 0 2rem; border-radius: var(--radius);`;
      case "icon":
        return `height: 2.5rem; width: 2.5rem;`;
      default:
        return `height: 2.5rem; padding: 0 1rem;`;
    }
  }}

  /* Variants */
  ${({ $variant, theme }) => {
    switch ($variant) {
      case "destructive":
        return `
          background-color: ${theme.colors.destructive};
          color: ${theme.colors.destructiveForeground};
          &:hover { background-color: ${theme.colors.destructive}; filter: brightness(0.9); }
        `;
      case "outline":
        return `
          border: 1px solid ${theme.colors.input};
          background-color: ${theme.colors.background};
          color: inherit;
          &:hover { background-color: ${theme.colors.accent}; color: ${theme.colors.accentForeground}; }
        `;
      case "secondary":
        return `
          background-color: ${theme.colors.secondary};
          color: ${theme.colors.secondaryForeground};
          &:hover { background-color: ${theme.colors.secondary}; filter: brightness(0.8); }
        `;
      case "ghost":
        return `
          background-color: transparent;
          color: inherit;
          &:hover { background-color: ${theme.colors.accent}; color: ${theme.colors.accentForeground}; }
        `;
      case "link":
        return `
          background-color: transparent;
          color: ${theme.colors.primary};
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
          &:hover { text-decoration: underline; }
        `;
      default:
        return `
          background-color: ${theme.colors.primary};
          color: ${theme.colors.primaryForeground};
          &:hover { background-color: ${theme.colors.primary}; filter: brightness(0.9); }
        `;
    }
  }}
`;