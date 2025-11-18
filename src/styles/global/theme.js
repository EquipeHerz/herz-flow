// Theme definitions using current CSS variables for pixel-perfect fidelity
// Colors reference the exact HSL variables defined in src/index.css

const colorVar = (name) => `hsl(var(--${name}))`;

export const theme = {
  colors: {
    background: colorVar("background"),
    foreground: colorVar("foreground"),
    card: colorVar("card"),
    cardForeground: colorVar("card-foreground"),
    popover: colorVar("popover"),
    popoverForeground: colorVar("popover-foreground"),
    primary: colorVar("primary"),
    primaryForeground: colorVar("primary-foreground"),
    secondary: colorVar("secondary"),
    secondaryForeground: colorVar("secondary-foreground"),
    muted: colorVar("muted"),
    mutedForeground: colorVar("muted-foreground"),
    accent: colorVar("accent"),
    accentForeground: colorVar("accent-foreground"),
    destructive: colorVar("destructive"),
    destructiveForeground: colorVar("destructive-foreground"),
    border: colorVar("border"),
    input: colorVar("input"),
    ring: colorVar("ring"),
    heroGradientStart: colorVar("hero-gradient-start"),
    heroGradientEnd: colorVar("hero-gradient-end"),
  },
  radii: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    xxl: "2rem",
  },
  typography: {
    fontFamily: `system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"`,
    baseSize: "16px",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    weightMedium: 500,
    weightSemibold: 600,
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
    md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  },
  transitions: {
    colors: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
    smooth: "var(--transition-smooth)",
    bounce: "var(--transition-bounce)",
  },
  breakpoints: {
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
};

export default theme;