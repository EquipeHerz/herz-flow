/**
 * ChatModal Component
 * 
 * Modal de chat interativo com a assistente virtual Bruna.
 * Exibe mensagens em tempo real, indicador de digitação e campo de input.
 * Utiliza os componentes ChatMessage e TypingIndicator para melhor organização.
 * 
 * @component
 * @example
 * <ChatModal isOpen={isOpen} onClose={handleClose} />
 */

import { useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, Message } from "./chat/ChatMessage";
import { TypingIndicator } from "./chat/TypingIndicator";

interface ChatModalProps {
  /** Se o modal está visível */
  isOpen: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
}

const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  /**
   * Lista de mensagens do chat
   * Inicializa com mensagem de boas-vindas da Bruna
   */
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Eu sou a Bruna, assistente virtual do Grupo Herz. Como posso ajudá-lo hoje?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  
  /** Texto atual do campo de input */
  const [inputMessage, setInputMessage] = useState("");
  
  /** Indica se o bot está "digitando" (para mostrar o indicador) */
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Manipula o envio de uma nova mensagem
   * Adiciona mensagem do usuário, mostra indicador de digitação
   * e simula resposta do bot após delay
   */
  const handleSendMessage = () => {
    // Ignora se a mensagem estiver vazia
    if (!inputMessage.trim()) return;

    // Cria mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    // Adiciona mensagem do usuário ao chat
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Simula resposta do bot com indicador de digitação
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Obrigada pela sua mensagem! Nossa equipe irá responder em breve. Como posso ajudar com mais alguma coisa?",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1500); // Delay de 1.5s para simular digitação
  };

  // Não renderiza nada se o modal estiver fechado
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Cabeçalho do chat com avatar e nome da assistente */}
        <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar da Bruna */}
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-bold">
              B
            </div>
            
            {/* Nome e cargo */}
            <div>
              <h3 className="font-semibold text-primary-foreground">Bruna</h3>
              <p className="text-xs text-primary-foreground/80">Assistente Virtual</p>
            </div>
          </div>
          
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Área de mensagens com scroll */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Renderiza todas as mensagens */}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Indicador de digitação (exibido enquanto o bot está "digitando") */}
            {isTyping && <TypingIndicator />}
          </div>
        </ScrollArea>

        {/* Área de input para enviar mensagens */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            {/* Campo de texto */}
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1"
            />
            
            {/* Botão de enviar */}
            <Button 
              onClick={handleSendMessage} 
              size="icon" 
              className="bg-accent hover:bg-accent/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
