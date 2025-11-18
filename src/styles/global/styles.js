import { createGlobalStyle } from "styled-components";

// Global styles and CSS reset leveraging existing design tokens
export const GlobalStyle = createGlobalStyle`
  /* Box model reset */
  *, *::before, *::after { box-sizing: border-box; }

  /* Base text and background synced with theme tokens (from index.css vars) */
  :root { color-scheme: light dark; }

  html { scroll-behavior: smooth; }

  body {
    margin: 0;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.foreground};
    font-family: ${({ theme }) => theme.typography.fontFamily};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Utility animations replicated from index.css */
  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    33% { transform: translateY(-20px) translateX(10px); }
    66% { transform: translateY(-10px) translateX(-10px); }
  }

  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default GlobalStyle;