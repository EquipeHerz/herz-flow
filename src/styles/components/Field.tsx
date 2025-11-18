import styled from "styled-components";

/**
 * Field wrapper para inputs com ícone embutido.
 * Garante alinhamento consistente: posição do ícone, espaçamento, altura e padding do input.
 */
export const Field = styled.div`
  position: relative;

  /* Espaço fixo para o ícone à esquerda */
  & input {
    padding-left: 2.5rem; /* pl-10 */
    height: 2.5rem; /* h-10 - garante consistência */
  }

  /* Ícone com posição e espaçamento padronizados */
  & .field-icon {
    position: absolute;
    left: 0.75rem; /* left-3 */
    top: 50%;
    transform: translateY(-50%);
  }
`;