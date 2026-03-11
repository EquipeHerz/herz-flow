/**
 * TypingIndicator Component
 * 
 * Exibe um indicador animado de "digitando..." quando o bot está processando uma resposta.
 * Utiliza três pontos com animação de bounce em sequência para criar efeito de digitação.
 * 
 * @component
 * @example
 * {isTyping && <TypingIndicator />}
 */

export const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted text-foreground">
        <div className="flex gap-1">
          {/* Primeiro ponto - sem delay */}
          <div 
            className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" 
            style={{ animationDelay: "0ms" }} 
          />
          
          {/* Segundo ponto - delay de 150ms */}
          <div 
            className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" 
            style={{ animationDelay: "150ms" }} 
          />
          
          {/* Terceiro ponto - delay de 300ms */}
          <div 
            className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" 
            style={{ animationDelay: "300ms" }} 
          />
        </div>
      </div>
    </div>
  );
};
