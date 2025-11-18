import styled from "styled-components";

/**
 * Styled Input
 * Propósito original: Campo de texto com suporte a placeholder e upload (file selector)
 * Contexto de uso: Formulários de login, filtros e modais
 * Estados especiais: focus-visible com anel (ring + ring-offset), disabled, placeholder visível
 * Responsabilidades específicas: Garantir responsividade (md:text-sm) e acessibilidade visual
 */

export const StyledInput = styled.input`
  display: flex;
  height: 2.5rem; /* h-10 */
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid ${({ theme }) => theme.colors.input};
  background-color: ${({ theme }) => theme.colors.background};
  padding: 0.5rem 0.75rem; /* px-3 py-2 */
  font-size: 1rem; /* text-base */

  &::placeholder { color: ${({ theme }) => theme.colors.mutedForeground}; }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.ring},
      0 0 0 4px ${({ theme }) => theme.colors.background};
  }

  &:disabled { cursor: not-allowed; opacity: 0.5; }

  /* File input tweaks */
  &::file-selector-button {
    border: 0; background: transparent; color: ${({ theme }) => theme.colors.foreground};
    font-size: 0.875rem; font-weight: 500;
  }

  /* md:text-sm */
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.sm};
  }
`;