import styled from "styled-components";

export const Field = styled.div`
  position: relative;

  & input {
    padding-left: 2.5rem;
    height: 2.5rem;
  }

  & .field-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
`;
