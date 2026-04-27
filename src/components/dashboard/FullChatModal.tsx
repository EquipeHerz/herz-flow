import { useState, useEffect, useRef, useMemo } from "react";
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
import { 
  ApiInteraction, 
  processHistory, 
  groupMessagesByDay, 
  formatDisplayDate,
  formatTimeStr
} from "@/utils/history";
import { useAuth } from "@/contexts/AuthContext";

type SacWebhookPayload = {
  id: string | number;
  sessao?: string;
  tempo?: string | number;
  time_sended?: string | number;
  from?: string;
  msg?: string;
  id_msg?: string;
  id_agente?: string;
  redesocial?: string;
  empresa?: string;
  send_msg: string;
  contato?: string;
  display_phone?: string;
  id_sessao?: string;
  stats_atend?: string;
  [k: string]: unknown;
};

type ApiInteractionForSac = ApiInteraction & Partial<SacWebhookPayload>;

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

export const FullChatModal = ({ isOpen, onClose, conversation, history: initialHistory }: FullChatModalProps) => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isAssuming, setIsAssuming] = useState(false);
  const [localStatus, setLocalStatus] = useState<FullChatModalProps["conversation"]["status"]>(conversation.status);
  const [localHistory, setLocalHistory] = useState<ApiInteraction[]>([]);
  const [hasSentViaChat, setHasSentViaChat] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const localHistoryRef = useRef<ApiInteraction[]>([]);
  const localStatusRef = useRef<FullChatModalProps["conversation"]["status"]>(conversation.status);
  const hasSentViaChatRef = useRef(false);
  const lastActivityAtRef = useRef<number>(Date.now());
  const processedHistoryRef = useRef<ReturnType<typeof processHistory>>([]);
  const timeoutsRef = useRef<{ alert?: number; close?: number }>({});
  const alertContextRef = useRef<{ sentAt: number; historyLength: number; lastClientId: string | null } | null>(null);
  
  // Sincroniza histórico local quando o histórico inicial mudar (prop)
  useEffect(() => {
    setLocalHistory(initialHistory);
    setHasSentViaChat(false);
    alertContextRef.current = null;
  }, [initialHistory]);

  useEffect(() => {
    localHistoryRef.current = localHistory;
  }, [localHistory]);

  useEffect(() => {
    localStatusRef.current = localStatus;
  }, [localStatus]);

  useEffect(() => {
    hasSentViaChatRef.current = hasSentViaChat;
  }, [hasSentViaChat]);

  const processedHistory = useMemo(() => processHistory(localHistory), [localHistory]);
  const groupedHistory = useMemo(() => groupMessagesByDay(processedHistory), [processedHistory]);

  useEffect(() => {
    processedHistoryRef.current = processedHistory;
  }, [processedHistory]);

  // Identifica o agente responsável (último agente que falou ou 'IA')
  const lastAgentInteraction = [...localHistory].reverse().find(i => i.send_msg);
  const agentName = lastAgentInteraction?.id_agente || "Assistente Virtual (IA)";

  const resolveCurrentAgentName = () => {
    const name = user?.name || user?.username || user?.email || "Operador";
    return String(name).trim() || "Operador";
  };

  const resolveCurrentAgentId = () => {
    const id = String(user?.id ?? "").trim();
    return id || null;
  };

  const toMillis = (v: unknown): number | null => {
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

  const normalizeAtendimentoStatus = (raw: unknown): FullChatModalProps["conversation"]["status"] => {
    const s = String(raw || "").trim().toUpperCase();
    if (s === "HUMANO") return "HUMANO";
    if (s === "FINALIZADO") return "FINALIZADO";
    return "IA";
  };

  const pickLastClientInteraction = (history: ApiInteraction[]) => {
    const candidates = history.filter(i => typeof i.msg === "string" && i.msg.trim() !== "");
    if (!candidates.length) return null;
    const ordered = candidates.slice().sort((a, b) => {
      const am = toMillis(a.tempo ?? a.timestamp) ?? 0;
      const bm = toMillis(b.tempo ?? b.timestamp) ?? 0;
      return am - bm;
    });
    return ordered[ordered.length - 1];
  };

  useEffect(() => {
    const lastStatusInteraction = [...localHistory].reverse().find(i => i.stats_atend);
    const next = lastStatusInteraction?.stats_atend ? normalizeAtendimentoStatus(lastStatusInteraction.stats_atend) : normalizeAtendimentoStatus(conversation.status);
    setLocalStatus(next);
  }, [localHistory, conversation.status]);

  const buildSacPayload = (
    base: ApiInteraction,
    sendMsg: string,
    override?: { stats_atend?: SacWebhookPayload["stats_atend"] }
  ): SacWebhookPayload => {
    const b = base as ApiInteractionForSac;
    const agentId = resolveCurrentAgentId();
    if (!agentId) {
      throw new Error("Usuário autenticado sem ID válido para preencher id_agente.");
    }

    const normalizedSendMsg = sendMsg.trim();
    const nowIso = new Date().toISOString();
    const status = override?.stats_atend ?? localStatus ?? b.stats_atend;

    return {
      ...b,
      id: b.id,
      tempo: nowIso,
      time_sended: nowIso,
      id_agente: agentId,
      msg: normalizedSendMsg !== "" ? normalizedSendMsg : (typeof b.msg === "string" ? b.msg : ""),
      ...(status ? { stats_atend: status } : {}),
      send_msg: normalizedSendMsg
    } satisfies SacWebhookPayload;
  };

  const postToSac = async (payload: SacWebhookPayload) => {
    const response = await fetch("https://n8n.srv1025595.hstgr.cloud/webhook/sac", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || `HTTP ${response.status}`);
    }
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return await response.json().catch(() => null);
    }
    return await response.text().catch(() => null);
  };

  const fetchLatestFromApi = async () => {
    const empresa = conversation.empresa || "Embeddixy";
    const url = `https://n8n.srv1025595.hstgr.cloud/webhook/bdembeddixy?empresa=${encodeURIComponent(empresa)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      const text = await response.text().catch(() => "");
      try {
        data = JSON.parse(text);
      } catch {
        data = [];
      }
    }

    const arr = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
    const phone = String(conversation.clientName || "");
    const list = (arr as ApiInteraction[]).filter((it) => String((it as any)?.from ?? "") === phone);

    const localOptimistic = localHistoryRef.current.filter((it) => !it.msg && !!it.send_msg && !!it.time_sended);
    const merged = [...list, ...localOptimistic];
    setLocalHistory(merged);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!conversation.clientName) return;
    if (localStatus === "FINALIZADO") return;

    let cancelled = false;
    const intervalMs = localStatus === "IA" || isAssuming ? 3000 : 10000;

    const tick = async () => {
      try {
        await fetchLatestFromApi();
      } catch (error) {
        if (!cancelled) console.error("[Polling] Falha ao atualizar status/mensagens:", error);
      }
    };

    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isOpen, conversation.clientName, conversation.empresa, localStatus, isAssuming]);

  const clearMonitorTimeouts = () => {
    if (timeoutsRef.current.alert) window.clearTimeout(timeoutsRef.current.alert);
    if (timeoutsRef.current.close) window.clearTimeout(timeoutsRef.current.close);
    timeoutsRef.current = {};
  };

  const lastActivityAt = useMemo(() => {
    if (!processedHistory.length) return Date.now();
    return processedHistory[processedHistory.length - 1].timestamp;
  }, [processedHistory]);

  useEffect(() => {
    lastActivityAtRef.current = lastActivityAt;
  }, [lastActivityAt]);

  const sendAutomaticMessage = async (text: string, overrideStatus?: SacWebhookPayload["stats_atend"]) => {
    const base = pickLastClientInteraction(localHistoryRef.current);
    if (!base) return false;

    const optimisticId = Date.now().toString();
    const statusToStore = overrideStatus ?? localStatusRef.current;
    const optimistic: ApiInteraction = {
      id: optimisticId,
      from: conversation.clientName,
      send_msg: text,
      time_sended: Date.now(),
      id_agente: resolveCurrentAgentId() ?? resolveCurrentAgentName(),
      stats_atend: statusToStore
    };

    setLocalHistory(prev => [...prev, optimistic]);

    try {
      const payload = buildSacPayload(base, text, overrideStatus ? { stats_atend: overrideStatus } : undefined);
      await postToSac(payload);
      if (overrideStatus === "FINALIZADO") setLocalStatus("FINALIZADO");
      return true;
    } catch (error) {
      console.error("[AutoAtendimento] Falha ao enviar mensagem automática:", error);
      setLocalHistory(prev => prev.filter(m => m.id !== optimisticId));
      return false;
    }
  };

  useEffect(() => {
    const canMonitor = localStatus === "HUMANO" && hasSentViaChat && localStatus !== "FINALIZADO";
    if (!canMonitor) {
      clearMonitorTimeouts();
      alertContextRef.current = null;
      return;
    }

    if (alertContextRef.current && localHistory.length !== alertContextRef.current.historyLength) {
      alertContextRef.current = null;
      clearMonitorTimeouts();
    }

    clearMonitorTimeouts();

    const now = Date.now();
    const alertCtx = alertContextRef.current;

    if (!alertCtx) {
      const delay = Math.max(0, lastActivityAt + 5 * 60 * 1000 - now);
      const baselineActivity = lastActivityAt;

      timeoutsRef.current.alert = window.setTimeout(async () => {
        const stillCanMonitor = localStatusRef.current === "HUMANO" && hasSentViaChatRef.current && localStatusRef.current !== "FINALIZADO";
        if (!stillCanMonitor) return;
        if (alertContextRef.current) return;
        if (lastActivityAtRef.current !== baselineActivity) return;

        const lastClientIdNow = pickLastClientInteraction(localHistoryRef.current)?.id ?? null;
        const lastMsgs = processedHistoryRef.current.slice(-6).map(m => ({ sender: m.sender, text: m.text, ts: m.timestamp }));
        console.info("[AutoAtendimento] Alerta de inatividade (5min)", {
          conversationId: conversation.id,
          from: conversation.clientName,
          empresa: conversation.empresa,
          lastClientId: lastClientIdNow,
          lastMsgs
        });

        const beforeLen = localHistoryRef.current.length;
        const ok = await sendAutomaticMessage("Sem interação por muito tempo, posso te ajudar em mais alguma coisa ou posso encerrar o atendimento?");
        if (!ok) return;

        alertContextRef.current = {
          sentAt: Date.now(),
          historyLength: beforeLen + 1,
          lastClientId: lastClientIdNow
        };
      }, delay);

      return () => clearMonitorTimeouts();
    }

    const delay = Math.max(0, alertCtx.sentAt + 2 * 60 * 1000 - now);
    timeoutsRef.current.close = window.setTimeout(async () => {
      const stillCanMonitor = localStatusRef.current === "HUMANO" && hasSentViaChatRef.current && localStatusRef.current !== "FINALIZADO";
      if (!stillCanMonitor) return;

      const ctx = alertContextRef.current;
      if (!ctx) return;
      if (localHistoryRef.current.length !== ctx.historyLength) return;

      const currentLastClientId = pickLastClientInteraction(localHistoryRef.current)?.id ?? null;
      if (currentLastClientId !== ctx.lastClientId) {
        alertContextRef.current = null;
        return;
      }

      console.info("[AutoAtendimento] Encerramento automático (7min)", {
        conversationId: conversation.id,
        from: conversation.clientName,
        empresa: conversation.empresa,
        lastClientId: ctx.lastClientId
      });

      await sendAutomaticMessage("Atendimento encerrado automaticamente por inatividade.", "FINALIZADO");
      alertContextRef.current = null;
    }, delay);

    return () => clearMonitorTimeouts();
  }, [localStatus, hasSentViaChat, localHistory.length, lastActivityAt, conversation.id, conversation.clientName, conversation.empresa]);

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

  const handleAssumeConversation = async () => {
    if (isAssuming) return;
    if (localStatus !== "IA") return;
    if (!isOpen) return;

    const base = pickLastClientInteraction(localHistoryRef.current);
    if (!base) {
      toast.error("Não foi possível localizar a última interação do contato.");
      return;
    }

    setIsAssuming(true);

    try {
      const payload = buildSacPayload(base, "", { stats_atend: "IA" });
      const resp = await postToSac(payload);
      const respStatus = (resp && typeof resp === "object") ? (resp as Record<string, unknown>)["stats_atend"] : undefined;
      const nextStatus = normalizeAtendimentoStatus(respStatus);
      if (nextStatus === "HUMANO") {
        setLocalStatus("HUMANO");
        return;
      }

      const start = Date.now();
      while (Date.now() - start < 30000) {
        await new Promise((r) => setTimeout(r, 1500));
        if (!isOpen) return;
        if (localStatusRef.current === "HUMANO") return;
      }

      toast.error("Aguardando confirmação do atendimento HUMANO. Tente novamente.");
    } catch (error) {
      console.error("[AssumirConversa] Falha:", error);
      toast.error("Não foi possível assumir a conversa. Tente novamente.");
    } finally {
      setIsAssuming(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;
    if (isAssuming) return;
    if (localStatus === "IA" || localStatus === "FINALIZADO") return;

    const agentId = resolveCurrentAgentId();
    if (!agentId) {
      toast.error("Não foi possível identificar o ID do usuário autenticado.");
      return;
    }
    
    setIsSending(true);
    const messageText = inputMessage.trim();
    setInputMessage(""); // Limpa o input imediatamente para melhor UX

    const base = pickLastClientInteraction(localHistory);
    if (!base) {
      toast.error("Não foi possível identificar a última mensagem do contato para montar o envio.");
      setIsSending(false);
      setInputMessage(messageText);
      return;
    }

    setHasSentViaChat(true);

    // Prepara a nova mensagem simulando a resposta da API
    const newMessage: ApiInteraction = {
      id: Date.now().toString(),
      from: conversation.clientName, // ou o ID do operador
      send_msg: messageText,
      time_sended: Date.now(),
      id_agente: agentId,
      stats_atend: localStatus
    };

    // Adiciona ao histórico local otimista (antes de confirmar com a API)
    setLocalHistory(prev => [...prev, newMessage]);

    try {
      const payload = buildSacPayload(base, messageText);
      await postToSac(payload);
      
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
    if (isFinishing || localStatus === 'FINALIZADO') return;
    
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
                {localStatus === 'HUMANO' && (
                  <Badge variant="outline" className="border-orange-500 text-orange-500 text-[10px] h-5">
                    Prioridade Humana
                  </Badge>
                )}
                {localStatus === 'FINALIZADO' && (
                  <Badge variant="outline" className="border-green-500 text-green-500 text-[10px] h-5">
                    Finalizado
                  </Badge>
                )}
                {localStatus === 'IA' && (
                  <Badge variant="secondary" className="text-muted-foreground text-[10px] h-5">
                    IA
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
               
               {localStatus !== 'IA' && (
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" disabled={isAssuming}>
                       <MoreVertical className="h-4 w-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-48">
                     <DropdownMenuItem 
                       onClick={handleFinishChat}
                       disabled={isFinishing || isAssuming || localStatus === 'FINALIZADO'}
                       className={`gap-2 cursor-pointer ${localStatus === 'FINALIZADO' ? 'opacity-50' : 'text-green-600 focus:text-green-700'}`}
                     >
                       {isFinishing ? (
                         <div className="h-4 w-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
                       ) : (
                         <CheckCircle2 className="h-4 w-4" />
                       )}
                       Finalizar Atendimento
                     </DropdownMenuItem>
                     {localStatus !== 'FINALIZADO' && (
                       <DropdownMenuItem 
                         className="gap-2 cursor-pointer text-orange-600 focus:text-orange-700"
                         onClick={() => {
                           toast.success("Conversa sinalizada para prioridade.");
                         }}
                         disabled={isAssuming}
                       >
                         <Flag className="h-4 w-4" />
                         Sinalizar Prioridade
                       </DropdownMenuItem>
                     )}
                   </DropdownMenuContent>
                 </DropdownMenu>
               )}
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
              {groupedHistory.length === 0 ? (
                 <div className="text-center text-muted-foreground py-10">
                    Nenhuma mensagem registrada.
                 </div>
              ) : (
                groupedHistory.map((group) => (
                  <div key={group.dateStr} className="space-y-4">
                    {/* Separador de Data */}
                    <div className="flex justify-center my-4">
                      <Badge variant="secondary" className="text-xs font-normal bg-muted/50 text-muted-foreground hover:bg-muted/50">
                        {formatDisplayDate(group.dateStr)}
                      </Badge>
                    </div>

                    {group.messages.map((item) => (
                      <div key={item.id} className="space-y-4">
                        {/* Mensagem do Cliente */}
                        {item.sender === 'client' && (
                          <div className="flex justify-start">
                            <div className="max-w-[70%] bg-white dark:bg-slate-900 border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                               <p className="text-sm text-foreground whitespace-pre-wrap">{item.text}</p>
                               <div className="flex items-center justify-end gap-1 mt-1">
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatTimeStr(item.timestamp)}
                                  </span>
                               </div>
                            </div>
                          </div>
                        )}

                        {/* Mensagem do Agente/Bot */}
                        {item.sender === 'agent' && (
                          <div className="flex justify-end">
                            <div className={`max-w-[70%] rounded-2xl rounded-tr-none px-4 py-3 shadow-sm ${
                               (item.agentName || '').toLowerCase().includes('ia') || !item.agentName 
                               ? 'bg-muted text-foreground' 
                               : 'bg-primary text-primary-foreground'
                            }`}>
                               <p className="text-sm font-medium text-xs opacity-90 mb-0.5">
                                  {item.agentName || "Agente"}
                               </p>
                               <p className="text-sm text-white whitespace-pre-wrap">{item.text}</p>
                               <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-white">
                                  <span className="text-[10px]">
                                    {formatTimeStr(item.timestamp)}
                                  </span>
                                  <CheckCircle className="h-3 w-3" />
                               </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Área de Input */}
        <div className="p-4 bg-background border-t border-border shrink-0 mt-auto">
          {localStatus === 'FINALIZADO' ? (
            <div className="text-center p-2 bg-muted/30 rounded-lg text-sm text-muted-foreground">
              Esta conversa foi finalizada e não pode receber novas mensagens.
            </div>
          ) : localStatus === 'IA' ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Button 
                onClick={handleAssumeConversation} 
                className="gap-2 bg-primary hover:bg-primary/90"
                disabled={isAssuming}
              >
                {isAssuming && (
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                )}
                Assumir conversa
              </Button>
              <span className="text-[10px] text-muted-foreground">
                Para responder, assuma o atendimento.
              </span>
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
                    disabled={isSending || isAssuming}
                  />
                </div>
                <Button 
                   onClick={handleSendMessage} 
                   size="icon" 
                   className="shrink-0 rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                   disabled={isSending || isAssuming || !inputMessage.trim()}
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
