import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Minus, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession, chatService } from "@/services/chatService";
import { ChatMessage } from "@/components/chat/ChatMessage";

interface FloatingChatWindowProps {
  session: ChatSession;
  onClose: () => void;
  onMinimize: () => void;
  position: { x: number; y: number };
}

export const FloatingChatWindow = ({ session, onClose, onMinimize, position }: FloatingChatWindowProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom (newest messages at bottom for attendant, standard chat style)
  // Note: The user requested reverse order for the END USER modal.
  // For the attendant interface (similar to Facebook/LinkedIn), standard bottom-up is usually preferred.
  // I'll stick to standard bottom-up for admin unless specified otherwise.
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [session.messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    chatService.sendMessage(session.id, inputMessage, true); // true = sent by agent/bot
    setInputMessage("");
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: position.x, y: position.y, opacity: 0, scale: 0.9 }}
      animate={{ x: position.x, y: position.y, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 w-80 h-96 bg-background border border-border rounded-t-lg shadow-xl flex flex-col overflow-hidden"
      style={{ bottom: 0, right: 0 }} // Positioning handled by parent via props/motion, but initial style needed
    >
      {/* Header - Draggable Area */}
      <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between cursor-move" onPointerDown={(e) => e.preventDefault()}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-semibold text-sm truncate max-w-[150px]">
            {session.userName || `Visitante ${session.id.substr(0,4)}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary-foreground/20" onClick={onMinimize}>
            <Minus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary-foreground/20" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-3 bg-muted/30" ref={scrollAreaRef}>
        <div className="space-y-3">
          {session.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                msg.isBot 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-white border border-border text-foreground'
              }`}>
                <p>{msg.text}</p>
                <span className="text-[10px] opacity-70 block mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite..."
            className="h-8 text-sm"
          />
          <Button size="icon" className="h-8 w-8" onClick={handleSendMessage}>
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
