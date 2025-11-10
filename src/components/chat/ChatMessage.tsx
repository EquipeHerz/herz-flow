/**
 * ChatMessage Component
 * 
 * Exibe uma mensagem individual no chat, com estilo diferente
 * para mensagens do bot e do usuário.
 * 
 * @component
 * @example
 * <ChatMessage
 *   text="Olá, como posso ajudar?"
 *   isBot={true}
 *   timestamp={new Date()}
 * />
 */

/**
 * Interface para as propriedades do componente de mensagem
 */
export interface Message {
  /** ID único da mensagem */
  id: string;
  /** Conteúdo de texto da mensagem */
  text: string;
  /** Indica se a mensagem é do bot (true) ou do usuário (false) */
  isBot: boolean;
  /** Timestamp de quando a mensagem foi enviada */
  timestamp: Date;
}

interface ChatMessageProps {
  /** Dados completos da mensagem */
  message: Message;
}

/**
 * Formata o timestamp para exibição (HH:MM)
 * @param date - Data a ser formatada
 * @returns String formatada no formato HH:MM
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { text, isBot, timestamp } = message;

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isBot
            ? 'bg-muted text-foreground' // Mensagem do bot: fundo neutro
            : 'bg-gradient-to-r from-primary to-accent text-primary-foreground' // Mensagem do usuário: gradiente colorido
        }`}
      >
        {/* Conteúdo da mensagem */}
        <p className="text-sm">{text}</p>
        
        {/* Timestamp da mensagem */}
        <p className={`text-xs mt-1 ${isBot ? 'text-foreground/50' : 'text-primary-foreground/70'}`}>
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
};
