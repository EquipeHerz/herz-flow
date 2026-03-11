import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppButton = () => (
  <div id="jonas-launcher" className="contents">
    <Button
      onClick={(e) => {
        e.stopPropagation();
        const w: any = window;
        if (typeof w.__initZaiaWidget === 'function') w.__initZaiaWidget();
        if (typeof w.toggleChatbot === 'function') w.toggleChatbot();
        else w.__zaiaRequestedOpen = true;
      }}
      className="fixed bottom-6 right-6 h-auto px-6 py-3 rounded-full shadow-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground z-50 animate-pulse-slow flex items-center gap-2"
      aria-label="Conversar com o Jonas"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="font-medium">Converse com o Jonas</span>
    </Button>
  </div>
);

export default WhatsAppButton;
