export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

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
            ? 'bg-muted text-foreground'
            : 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
        }`}
      >
        <p className="text-sm">{text}</p>
        
        <p className={`text-xs mt-1 ${isBot ? 'text-foreground/50' : 'text-primary-foreground/70'}`}>
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
};
