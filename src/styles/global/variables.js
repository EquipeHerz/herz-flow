// Shared variables/constants for styled-components usage
export const breakpoints = {
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};

export const radii = {
  lg: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  sm: "calc(var(--radius) - 4px)",
};

export const shadows = {
  sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
};

export const transitions = {
  colors: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
};