import * as React from "react";
import { StyledInput } from "@/styles/components/Input";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ type, ...props }, ref) => {
  return <StyledInput type={type} ref={ref} {...props} />;
});
Input.displayName = "Input";

export { Input };
