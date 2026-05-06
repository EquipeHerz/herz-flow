import styled from "styled-components";

export const StyledInput = styled.input`
  display: flex;
  height: 2.5rem;
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid ${({ theme }) => theme.colors.input};
  background-color: ${({ theme }) => theme.colors.background};
  padding: 0.5rem 0.75rem;
  font-size: 1rem;

  &::placeholder { color: ${({ theme }) => theme.colors.mutedForeground}; }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.ring},
      0 0 0 4px ${({ theme }) => theme.colors.background};
  }

  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.destructive};
  }

  &[aria-invalid="true"]:focus-visible {
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.destructive},
      0 0 0 4px ${({ theme }) => theme.colors.background};
  }

  &:disabled { cursor: not-allowed; opacity: 0.5; }

  &::file-selector-button {
    border: 0; background: transparent; color: ${({ theme }) => theme.colors.foreground};
    font-size: 0.875rem; font-weight: 500;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.sm};
  }
`;
