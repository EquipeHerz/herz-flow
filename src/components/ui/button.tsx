import * as React from "react";
import { StyledButton } from "@/styles/components/Button";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Button (Wrapper)
 * 
 * Descrição:
 * - Componente de botão de alto nível que encapsula o StyledButton e
 *   expõe uma API compatível com React ButtonHTMLAttributes.
 * - Centraliza o uso de variantes e tamanhos definidos no design system.
 * 
 * Parâmetros:
 * - variant: tipo visual do botão (default | destructive | outline | secondary | ghost | link)
 * - size: tamanho do botão (default | sm | lg | icon)
 * - ...props: quaisquer atributos padrão de <button> (onClick, disabled, aria-*, etc.)
 * 
 * Dependências/Requisitos:
 * - StyledButton baseado em styled-components e tokens de tema (ThemeProvider).
 * - Requer ambiente com suporte a React 18+.
 * 
 * Valor de retorno:
 * - JSX.Element representando um botão estilizado e acessível.
 * 
 * Erros/Exceções:
 * - Sem exceções em tempo de execução; props inválidas resultam em estilos padrão.
 * 
 * Exemplo:
 *  <Button variant="outline" size="lg" aria-label="Salvar" onClick={handleSave}>
 *    Salvar
 *  </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "default", size = "default", ...props }, ref) => {
  return <StyledButton $variant={variant} $size={size} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button };
