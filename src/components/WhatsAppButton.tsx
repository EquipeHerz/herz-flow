import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatModal from "./ChatModal";

const WhatsAppButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-auto px-6 py-3 rounded-full shadow-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground z-50 animate-pulse-slow flex items-center gap-2"
        aria-label="Conversar com a Bruna"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">Converse com a Bruna</span>
      </Button>
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default WhatsAppButton;
