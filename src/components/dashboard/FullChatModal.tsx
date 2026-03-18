import { useState, useEffect, useRef } from "react";
import { X, Send, User, Bot, Phone, Calendar, Clock, UserCheck, Building, CheckCircle, CheckCircle2, MoreVertical, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Interface compatível com o formato da API do Dashboard
interface ApiInteraction {
  id: string;
  from: string;
  msg?: string;
  send_msg?: string;
  timestamp?: string | number;
  tempo?: string | number;
  id_agente?: string;
  time_sended?: string | number | null;
  redesocial?: string;
}

interface FullChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: {
    id: string;
    clientName: string;
    empresa: string;
    date: string;
    originTimestamp?: string;
    status?: 'IA' | 'HUMANO' | 'FINALIZADO';
  };
  history: ApiInteraction[];
}

const formatDateTime = (timestamp: string | number | undefined | null) => {
  if (!timestamp) return "Data desconhecida";
  const ms = typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : Number(timestamp);
  if (isNaN(ms)) return String(timestamp);
  return new Date(ms).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
};

const toMillis = (v: any): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === "number") return v < 1e12 ? v * 1000 : v;
    if (typeof v === "string") {
      const d = Date.parse(v);
      if (!isNaN(d)) return d;
      const n = Number(v);
      if (!isNaN(n)) return n < 1e12 ? n * 1000 : n;
    }
    return null;
  };

export const FullChatModal = ({ isOpen, onClose, conversation, history: initialHistory }: FullChatModalProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [localHistory, setLocalHistory] = useState<ApiInteraction[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Sincroniza histórico local quando o histórico inicial mudar (prop)
  useEffect(() => {
    setLocalHistory(initialHistory);
  }, [initialHistory]);

  // Identifica o agente responsável (último agente que falou ou 'IA')
  const lastAgentInteraction = [...localHistory].reverse().find(i => i.send_msg);
  const agentName = lastAgentInteraction?.id_agente || "Assistente Virtual (IA)";

  // Ordena histórico por tempo
  const sortedHistory = [...localHistory].sort((a, b) => {
    const ta = toMillis(a.tempo ?? a.timestamp) ?? 0;
    const tb = toMillis(b.tempo ?? b.timestamp) ?? 0;
    return ta - tb;
  });

  // Auto-scroll to bottom and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Pequeno delay para garantir que a renderização terminou antes do scroll
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, 50);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, localHistory]); // Atualiza o scroll quando o localHistory mudar

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;
    
    setIsSending(true);
    const messageText = inputMessage;
    setInputMessage(""); // Limpa o input imediatamente para melhor UX

    // Prepara a nova mensagem simulando a resposta da API
    const newMessage: ApiInteraction = {
      id: Date.now().toString(),
      from: conversation.clientName, // ou o ID do operador
      send_msg: messageText,
      time_sended: Date.now(),
      id_agente: "Operador (Você)", // Aqui entraria o nome do usuário logado na vida real
      stats_atend: conversation.status
    };

    // Adiciona ao histórico local otimista (antes de confirmar com a API)
    setLocalHistory(prev => [...prev, newMessage]);

    try {
      // TODO: Substituir por chamada real à API
      /*
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: messageText,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error('Falha ao enviar mensagem');
      */
      
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Opcional: Aqui você pode atualizar o ID da mensagem com o ID real retornado pela API
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Não foi possível enviar a mensagem. Tente novamente.");
      // Em caso de erro, você poderia remover a mensagem otimista ou marcá-la como erro
      setLocalHistory(prev => prev.filter(m => m.id !== newMessage.id));
      setInputMessage(messageText); // Devolve o texto pro input
    } finally {
      setIsSending(false);
    }
  };

  const handleFinishChat = async () => {
    if (isFinishing || conversation.status === 'FINALIZADO') return;
    
    setIsFinishing(true);
    try {
      // TODO: Substituir por chamada real à API
      /*
      const response = await fetch('/api/conversations/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          status: 'FINALIZADO'
        })
      });
      if (!response.ok) throw new Error('Falha ao finalizar atendimento');
      */
      
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Atendimento finalizado com sucesso!");
      
      // Fecha o modal ou atualiza o estado local para mostrar que acabou
      // Como não temos um gerenciador de estado global robusto aqui para refletir de volta na lista,
      // a melhor ação para UX é apenas fechar o modal. Ao reabrir/atualizar, a lista pegará o novo status da API real.
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      toast.error("Ocorreu um erro ao finalizar o atendimento.");
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[95vh] sm:h-[90vh] md:h-[85vh] p-0 flex flex-col gap-0 overflow-hidden bg-background">
        
        {/* Header da Conversa */}
        <div className="bg-muted/40 border-b border-border p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {conversation.clientName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{conversation.clientName}</h2>
                {conversation.status === 'HUMANO' && (
                  <Badge variant="outline" className="border-orange-500 text-orange-500 text-[10px] h-5">
                    Prioridade Humana
                  </Badge>
                )}
                {conversation.status === 'FINALIZADO' && (
                  <Badge variant="outline" className="border-green-500 text-green-500 text-[10px] h-5">
                    Finalizado
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {conversation.clientName.split('@')[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" /> {conversation.empresa}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
             <div className="flex items-center gap-2">
               <div className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded border border-border/50">
                  <UserCheck className="h-3 w-3 text-primary" />
                  <span>Responsável: <strong className="text-foreground">{agentName}</strong></span>
               </div>
               
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                     <MoreVertical className="h-4 w-4" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuItem 
                     onClick={handleFinishChat}
                     disabled={isFinishing || conversation.status === 'FINALIZADO'}
                     className={`gap-2 cursor-pointer ${conversation.status === 'FINALIZADO' ? 'opacity-50' : 'text-green-600 focus:text-green-700'}`}
                   >
                     {isFinishing ? (
                       <div className="h-4 w-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
                     ) : (
                       <CheckCircle2 className="h-4 w-4" />
                     )}
                     Finalizar Atendimento
                   </DropdownMenuItem>
                   {conversation.status !== 'FINALIZADO' && (
                     <DropdownMenuItem 
                       className="gap-2 cursor-pointer text-orange-600 focus:text-orange-700"
                       onClick={() => {
                         toast.success("Conversa sinalizada para prioridade.");
                       }}
                     >
                       <Flag className="h-4 w-4" />
                       Sinalizar Prioridade
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
             
             <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Início: {formatDateTime(conversation.originTimestamp)}</span>
             </div>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 relative bg-slate-50 dark:bg-slate-950/50 min-h-0">
          <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
            <div className="space-y-4 p-4 pb-8">
              {/* Separador de Data */}
              <div className="flex justify-center my-4">
                <Badge variant="secondary" className="text-xs font-normal bg-muted/50 text-muted-foreground hover:bg-muted/50">
                  {new Date(conversation.date).toLocaleDateString()}
                </Badge>
              </div>

              {sortedHistory.length === 0 ? (
                 <div className="text-center text-muted-foreground py-10">
                    Nenhuma mensagem registrada.
                 </div>
              ) : (
                sortedHistory.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="space-y-4">
                    {/* Mensagem do Cliente */}
                    {item.msg && (
                      <div className="flex justify-start">
                        <div className="max-w-[70%] bg-white dark:bg-slate-900 border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                           <p className="text-sm text-foreground">{item.msg}</p>
                           <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-[10px] text-muted-foreground">
                                {item.tempo || item.timestamp ? new Date(toMillis(item.tempo ?? item.timestamp) as number).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                              </span>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Mensagem do Agente/Bot */}
                    {item.send_msg && (
                      <div className="flex justify-end">
                        <div className={`max-w-[70%] rounded-2xl rounded-tr-none px-4 py-3 shadow-sm ${
                           (item.id_agente || '').toLowerCase().includes('ia') || !item.id_agente 
                           ? 'bg-muted text-foreground' 
                           : 'bg-primary text-primary-foreground'
                        }`}>
                           <p className="text-sm font-medium text-xs opacity-90 mb-0.5">
                              {item.id_agente || "Agente"}
                           </p>
                           <p className="text-sm text-white">{item.send_msg}</p>
                           <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-white">
                              <span className="text-[10px]">
                                {item.time_sended ? new Date(toMillis(item.time_sended) as number).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                              </span>
                              <CheckCircle className="h-3 w-3" />
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Área de Input */}
        <div className="p-4 bg-background border-t border-border shrink-0 mt-auto">
          {conversation.status === 'FINALIZADO' ? (
            <div className="text-center p-2 bg-muted/30 rounded-lg text-sm text-muted-foreground">
              Esta conversa foi finalizada e não pode receber novas mensagens.
            </div>
          ) : (
            <>
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Input 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder="Digite sua mensagem..."
                    className="pr-10 h-10 rounded-full"
                    disabled={isSending}
                  />
                </div>
                <Button 
                   onClick={handleSendMessage} 
                   size="icon" 
                   className="shrink-0 rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                   disabled={isSending || !inputMessage.trim()}
                >
                  {isSending ? (
                    <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-center mt-2 flex items-center justify-between px-2">
                 <span className="text-[10px] text-muted-foreground">
                    Pressione Enter para enviar.
                 </span>
                 {isSending && <span className="text-[10px] text-primary animate-pulse">Enviando...</span>}
              </div>
            </>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};
