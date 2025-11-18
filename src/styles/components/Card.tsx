import styled from "styled-components";

/**
 * Styled Card set
 * Propósito original: Agrupar conteúdos com header, body e footer em um container
 * Contexto de uso: Dashboard, estatísticas, listagens de clientes e modais
 * Estados especiais: N/A (estático), respeita modo claro/escuro via tokens
 * Responsabilidades específicas: Aplicar borda, sombra, tipografia e espaçamento; manter pixel-perfect
 */

export const StyledCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.cardForeground};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const StyledCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem; /* space-y-1.5 */
  padding: 1.5rem; /* p-6 */
`;

export const StyledCardTitle = styled.h3`
  font-size: 1.5rem; /* text-2xl */
  font-weight: 600; /* font-semibold */
  line-height: 1.25; /* leading-none */
  letter-spacing: -0.025em; /* tracking-tight */
`;

export const StyledCardDescription = styled.p`
  font-size: 0.875rem; /* text-sm */
  color: ${({ theme }) => theme.colors.mutedForeground};
`;

export const StyledCardContent = styled.div`
  padding: 1.5rem; /* p-6 */
  padding-top: 0; /* pt-0 */
`;

export const StyledCardFooter = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem; /* p-6 */
  padding-top: 0; /* pt-0 */
`;