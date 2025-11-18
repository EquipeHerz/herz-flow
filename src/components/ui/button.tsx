import * as React from "react";
import { StyledButton } from "@/styles/components/Button";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "default", size = "default", ...props }, ref) => {
  return <StyledButton $variant={variant} $size={size} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button };
