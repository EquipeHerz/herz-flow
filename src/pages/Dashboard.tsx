import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, MessageSquare, TrendingUp, Users, Calendar, Building, FileText, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ConversationCard, Conversation } from "@/components/dashboard/ConversationCard";
import { ConversationFilters } from "@/components/dashboard/ConversationFilters";
import { FullChatModal } from "@/components/dashboard/FullChatModal";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { processHistory, groupMessagesByDay, formatDisplayDate, formatTimeStr } from "@/utils/history";
import { features } from "@/config/features";

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
  stats_atend?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: session, logout } = useAuth();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const [chatConversation, setChatConversation] = useState<Conversation | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");

  const [dateStart, setDateStart] = useState("");

  const [filterEmpresa, setFilterEmpresa] = useState("all");

  const itemsPerPage = 8;

  const [apiInteractions, setApiInteractions] = useState<ApiInteraction[]>([]);
  const [apiByPhone, setApiByPhone] = useState<Record<string, ApiInteraction[]>>({});
  const [apiConversations, setApiConversations] = useState<Conversation[]>([]);
  const conversationIdMapRef = useRef<Map<string, string>>(new Map());
  const nextConversationIdRef = useRef(1);
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
  const relativeFromNow = (v: any): string => {
    const ms = toMillis(v);
    if (ms === null) return "Atualizado";
    const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    if (diffSec < 60) return "há poucos segundos";
    if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)} minutos`;
    if (diffSec < 86400) return `há ${Math.floor(diffSec / 3600)} horas`;
    if (diffSec >= 7 * 86400) {
      const d = new Date(ms);
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    return `há ${Math.floor(diffSec / 86400)} dias`;
  };
  const maskPhone = (raw: string) => String(raw || "").split("@")[0];
  const formatHMDate = (v: any): string => {
    const ms = toMillis(v);
    if (ms === null) return "";
    const d = new Date(ms);
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
    const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${time} — ${date}`;
  };
  const formatHour = (v: any): string => {
    const ms = toMillis(v);
    if (ms === null) return "";
    return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
  };
  const formatDate = (v: any): string => {
    const ms = toMillis(v);
    if (ms === null) return "";
    return new Date(ms).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const selectedTimestamp = useMemo(() => {
    if (!selectedConversation) return null;
    if (session?.role === "ADMIN_SISTEMA") {
      const list = apiByPhone[selectedConversation.clientName] || [];
      if (list.length) {
        const ordered = list.slice().sort((a, b) => {
          const am = toMillis(a.tempo ?? a.timestamp) ?? 0;
          const bm = toMillis(b.tempo ?? b.timestamp) ?? 0;
          return am - bm;
        });
        const last = ordered[ordered.length - 1];
        return last?.tempo ?? last?.timestamp ?? null;
      }
    }
    return selectedConversation.originTimestamp ?? null;
  }, [selectedConversation, session, apiByPhone]);

  const showTimeBadge = useMemo(() => {
    if (!selectedConversation) return false;
    if (session?.role !== "ADMIN_SISTEMA") return false;
    const list = apiByPhone[selectedConversation.clientName] || [];
    return list.length > 0;
  }, [selectedConversation, session, apiByPhone]);

  const getOrigin = (redesocial?: string): "whatsapp" | "instagram" | "facebook" | "sms" => {
    const rs = (redesocial || "").toLowerCase();
    if (rs.includes("insta")) return "instagram";
    if (rs.includes("face")) return "facebook";
    if (rs === "sms" || rs === "ayla") return "sms";
    return "whatsapp";
  };

  const fetchApiData = useCallback(async () => {
    try {
      const empresa =
        session?.role === "ADMIN_SISTEMA"
          ? (filterEmpresa !== "all" ? filterEmpresa : "Embeddixy")
          : (session?.companyName || "Embeddixy");

      const response = await fetch(`https://n8n.srv1025595.hstgr.cloud/webhook/bdembeddixy?empresa=${encodeURIComponent(empresa)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = [];
        }
      }
      let interactions: ApiInteraction[] = [];
      if (Array.isArray(data)) {
        interactions = data as ApiInteraction[];
      } else if ((data as any)?.data && Array.isArray((data as any).data)) {
        interactions = (data as any).data as ApiInteraction[];
      }
      setApiInteractions(interactions);
      const byPhone = interactions.reduce<Record<string, ApiInteraction[]>>((acc, it) => {
        const phone = String((it as any).from ?? "");
        if (!acc[phone]) acc[phone] = [];
        acc[phone].push(it);
        return acc;
      }, {});
      setApiByPhone(byPhone);
      const conversations: Conversation[] = Object.entries(byPhone).map(([phone, list], idx) => {
        const stableId = (() => {
          const existing = conversationIdMapRef.current.get(phone);
          if (existing) return existing;
          const next = String(nextConversationIdRef.current++).padStart(3, "0");
          conversationIdMapRef.current.set(phone, next);
          return next;
        })();

        const ordered = list.slice().sort((a, b) => {
          const am = toMillis(a.tempo ?? a.timestamp) ?? 0;
          const bm = toMillis(b.tempo ?? b.timestamp) ?? 0;
          return am - bm;
        });
        const last = ordered[ordered.length - 1];
        const lastMsg = last?.msg ?? "";
        const lastMs = toMillis(last?.tempo ?? last?.timestamp) ?? Date.now();
        const dateStr = new Date(lastMs).toISOString().slice(0, 10);
        const originTs = new Date(lastMs).toISOString();
        const missingResponses = list.filter(item => !item.send_msg).length;
        const totalMessages = list.length * 2 - missingResponses;

        const social = last?.redesocial || list.find(i => i.redesocial)?.redesocial;

        const statusInteraction = list.slice().reverse().find(i => i.stats_atend);
        let status = 'IA';
        const rawStatus = (statusInteraction?.stats_atend || "IA").toUpperCase();
        if (rawStatus === "HUMANO") status = "HUMANO";
        else if (rawStatus === "FINALIZADO") status = "FINALIZADO";

        return {
          id: stableId,
          clientName: phone || "Desconhecido",
          empresa,
          messages: totalMessages,
          lastInteraction: relativeFromNow(last?.tempo ?? last?.timestamp),
          date: dateStr,
          preview: lastMsg || "Sem mensagem",
          origin: getOrigin(social),
          originTimestamp: originTs,
          status: status as 'IA' | 'HUMANO' | 'FINALIZADO'
        };
      });
      setApiConversations(conversations);
    } catch {
      setApiInteractions([]);
      setApiByPhone({});
      setApiConversations([]);
    }
  }, [session, filterEmpresa]);

  useEffect(() => {
    if (!session?.role) return;
    fetchApiData();
    const id = setInterval(fetchApiData, 6000);
    return () => clearInterval(id);
  }, [session?.role, fetchApiData]);

  useEffect(() => {
    if (!apiConversations.length) return;

    setSelectedConversation((prev) => {
      if (!prev) return prev;
      const updated = apiConversations.find((c) => c.clientName === prev.clientName);
      return updated ? { ...prev, ...updated } : prev;
    });

    setChatConversation((prev) => {
      if (!prev) return prev;
      const updated = apiConversations.find((c) => c.clientName === prev.clientName);
      return updated ? { ...prev, ...updated } : prev;
    });
  }, [apiConversations]);

  const handleLogout = () => {
    logout();
  };

  const filteredConversations = useMemo(() => {
    if (!session || !session.role) return [];

    let filtered = apiConversations;

    if (session.role !== "ADMIN_SISTEMA" && session.companyName) {
      filtered = filtered.filter(conv => conv.empresa === session.companyName);
    }

    if (searchTerm) {
      filtered = filtered.filter(conv => 
        conv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateStart) {
      filtered = filtered.filter(conv => conv.date >= dateStart);
    }
    
    if (filterEmpresa !== "all" && session.role === "ADMIN_SISTEMA") {
      filtered = filtered.filter(conv => conv.empresa === filterEmpresa);
    }

    const sorted = filtered.slice().sort((a, b) => {
      if (a.status === 'HUMANO' && b.status !== 'HUMANO') return -1;
      if (b.status === 'HUMANO' && a.status !== 'HUMANO') return 1;

      const ta = a.originTimestamp ? Date.parse(a.originTimestamp) : 0;
      const tb = b.originTimestamp ? Date.parse(b.originTimestamp) : 0;
      return tb - ta;
    });
    return sorted;
  }, [session, searchTerm, dateStart, filterEmpresa, apiConversations]);

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const conversations =
      session?.role === "ADMIN_EMPRESA" && session.companyName
        ? apiConversations.filter((c) => c.empresa === session.companyName)
        : apiConversations;

    const totalConversations = conversations.length;
    const totalInteractions =
      session?.role === "ADMIN_SISTEMA"
        ? apiInteractions.length
        : conversations.reduce((sum, conv) => sum + (conv.messages ?? 0), 0);

    const responsesPerConversation =
      session?.role === "ADMIN_SISTEMA"
        ? Object.keys(apiByPhone).length === 0
          ? 0
          : Object.values(apiByPhone).reduce((sum, list) => {
              const resp = list.filter((item) => item.send_msg).length;
              return sum + resp;
            }, 0) / Object.keys(apiByPhone).length
        : totalConversations === 0
          ? 0
          : totalInteractions / totalConversations;

    return [
      { label: "Total de Interações", value: totalInteractions.toString(), icon: MessageSquare, change: "" },
      { label: "Total de Conversas", value: totalConversations.toString(), icon: Users, change: "" },
      { label: "Média de Respostas", value: responsesPerConversation.toFixed(2), icon: Calendar, change: "" },
    ];
  }, [session, apiInteractions, apiByPhone, apiConversations]);

  useEffect(() => {
    if (selectedConversation || chatConversation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedConversation, chatConversation]);

  if (!session) {
    return null;
  }

  if (!session.role) {
    return <div className="flex items-center justify-center min-h-screen">Erro de sessão: Perfil não definido.</div>;
  }

  const showStats = session.role === "ADMIN_SISTEMA" || session.role === "ADMIN_EMPRESA";

  const handleTransferToHuman = () => {
    if (!selectedConversation) return;
    
    if (!selectedConversation.requiresIntervention) {
      toast.error("Esta conversa não está marcada para intervenção humana.");
      return;
    }

    toast.success("Solicitação de atendimento humano iniciada com sucesso!");
    setSelectedConversation(null);
  };

  const handleOpenChat = () => {
    if (!selectedConversation) return;
    setChatConversation(selectedConversation);
    setSelectedConversation(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Acesso Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {features.management && session.role === 'ADMIN_SISTEMA' && (
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full flex items-center justify-center min-h-[120px] sm:min-h-[140px]" onClick={() => navigate('/listagem-empresas')}>
                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-2 sm:gap-3 w-full h-full text-center">
                    <div className="p-3 sm:p-4 bg-primary/10 rounded-full text-primary flex items-center justify-center shadow-sm">
                      <Building className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm">Gerenciar Empresas</span>
                  </CardContent>
                </Card>
              )}
              
              {features.management && session.role === "ADMIN_SISTEMA" && (
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full flex items-center justify-center min-h-[120px] sm:min-h-[140px]" onClick={() => navigate('/listagem-usuarios')}>
                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-2 sm:gap-3 w-full h-full text-center">
                    <div className="p-3 sm:p-4 bg-blue-500/10 rounded-full text-blue-500 flex items-center justify-center shadow-sm">
                      <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm">Gerenciar Usuários</span>
                  </CardContent>
                </Card>
              )}

              {features.management && session.role === "ADMIN_SISTEMA" && (
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full flex items-center justify-center min-h-[120px] sm:min-h-[140px]" onClick={() => navigate('/editor-contrato')}>
                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-2 sm:gap-3 w-full h-full text-center">
                    <div className="p-3 sm:p-4 bg-green-500/10 rounded-full text-green-500 flex items-center justify-center shadow-sm">
                      <FileText className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm">Contratos</span>
                  </CardContent>
                </Card>
              )}

              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full flex items-center justify-center min-h-[120px] sm:min-h-[140px]" onClick={() => navigate('/meu-perfil')}>
                 <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-2 sm:gap-3 w-full h-full text-center">
                    <div className="p-3 sm:p-4 bg-orange-500/10 rounded-full text-orange-500 flex items-center justify-center shadow-sm">
                      <UserPlus className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm">Meu Perfil</span>
                  </CardContent>
              </Card>
            </div>
          </div>

        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
              />
            ))}
          </div>
        )}

        <ConversationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateStart={dateStart}
          onDateStartChange={setDateStart}
          filterEmpresa={filterEmpresa}
          onFilterEmpresaChange={setFilterEmpresa}
          isAdmin={session.role === "ADMIN_SISTEMA"}
          companies={
            session.role === "ADMIN_SISTEMA"
              ? [...new Set(apiConversations.map((c) => c.empresa).filter(Boolean))]
              : session.companyName
                ? [session.companyName]
                : []
          }
        />

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              Conversas ({filteredConversations.length})
            </h2>
            <div className="flex items-center space-x-2 bg-muted/30 p-1 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {paginatedConversations.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
            </Card>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedConversations.map((conv) => (
                    <ConversationCard
                      key={conv.id}
                      conversation={conv}
                      viewMode="grid"
                      showCompany={session.role === "ADMIN_SISTEMA"}
                      onClick={() => setSelectedConversation(conv)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedConversations.map((conv) => (
                    <ConversationCard
                      key={conv.id}
                      conversation={conv}
                      viewMode="list"
                      showCompany={session.role === "ADMIN_SISTEMA"}
                      onClick={() => setSelectedConversation(conv)}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Dialog open={!!selectedConversation} onOpenChange={(open) => !open && setSelectedConversation(null)}>
        <DialogContent className="max-w-3xl flex flex-col h-[90vh] sm:h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="text-2xl">
              {session.role === "ADMIN_SISTEMA" && selectedConversation?.clientName
                ? maskPhone(selectedConversation.clientName)
                : `Conversa #${selectedConversation?.id}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <DialogDescription className="text-base space-y-4">
              {selectedConversation && (
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <p className="font-semibold text-foreground mb-1">Origem da Conversa</p>
                  <p className="text-muted-foreground">
                    {selectedConversation.origin === "whatsapp" && "Conversa originada do WhatsApp"}
                    {selectedConversation.origin === "instagram" && "Conversa originada do Instagram"}
                    {selectedConversation.origin === "facebook" && "Conversa originada do Facebook"}
                    {selectedConversation.originTimestamp && (
                      <span> — {new Date(selectedConversation.originTimestamp).toLocaleString()}</span>
                    )}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-foreground">Cliente</p>
                  <p className="text-muted-foreground">{selectedConversation?.clientName ? String(selectedConversation.clientName).split("@")[0] : ""}</p>
                </div>
                {session.role === "ADMIN_SISTEMA" && (
                  <div>
                    <p className="font-semibold text-foreground">Empresa</p>
                    <p className="text-muted-foreground">{selectedConversation?.empresa}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">Total de Mensagens</p>
                  <p className="text-muted-foreground">{selectedConversation?.messages}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Última Interação</p>
                  <p className="text-muted-foreground">{selectedConversation?.lastInteraction}</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <p className="font-semibold text-foreground">Histórico da Conversa</p>
                  
                  {selectedConversation?.requiresIntervention && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleTransferToHuman}
                      className="gap-2 animate-pulse"
                    >
                      <UserPlus className="h-4 w-4" />
                      Solicitar Atendimento Humano
                    </Button>
                  )}
                </div>
                
                {selectedConversation?.requiresIntervention && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 flex items-start gap-3 shrink-0">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive text-sm">Intervenção Humana Necessária</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        O AgenteIA sinalizou esta conversa para atenção. 
                        Motivo: <span className="font-medium">{selectedConversation.interventionReason}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 bg-muted/30 p-4 rounded-lg overflow-y-auto min-h-[200px]">
                  {session.role === "ADMIN_SISTEMA" && selectedConversation && apiByPhone[selectedConversation.clientName]?.length ? (
                    (() => {
                      const processed = processHistory(apiByPhone[selectedConversation.clientName]);
                      const grouped = groupMessagesByDay(processed);
                      
                      if (grouped.length === 0) {
                        return <div className="text-sm text-muted-foreground">Sem histórico disponível.</div>;
                      }

                      return grouped.map((group) => (
                        <div key={group.dateStr} className="space-y-4">
                          <div className="flex justify-center my-4">
                            <Badge variant="secondary" className="text-xs font-normal bg-muted/50 text-muted-foreground">
                              {formatDisplayDate(group.dateStr)}
                            </Badge>
                          </div>
                          
                          {group.messages.map((item) => (
                            <div key={item.id} className="space-y-3">
                              {item.sender === 'client' && (
                                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-l-4 border-blue-500 p-3 rounded-lg">
                                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Cliente</p>
                                  <time
                                    className="text-[0.7rem] font-medium text-blue-600 dark:text-blue-400 mb-1 block"
                                    dateTime={new Date(item.timestamp).toISOString()}
                                  >
                                    {formatTimeStr(item.timestamp)}
                                  </time>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{item.text}</p>
                                </div>
                              )}
                              
                              {item.sender === 'agent' && (
                                <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-l-4 border-purple-500 p-3 rounded-lg">
                                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                    {(() => {
                                      const rawName = item.agentName || "Bot";
                                      const lower = String(rawName).toLowerCase();
                                      return lower.includes("agente") ? rawName : `Agente ${rawName}`;
                                    })()}
                                  </p>
                                  <time
                                    className="text-[0.7rem] font-medium text-purple-600 dark:text-purple-400 mb-1 block"
                                    dateTime={new Date(item.timestamp).toISOString()}
                                  >
                                    {formatTimeStr(item.timestamp)}
                                  </time>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{item.text}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="text-sm text-muted-foreground">Sem histórico disponível.</div>
                  )}
                </div>
              </div>
            </DialogDescription>
          </div>
          <div className="p-6 pt-4 border-t border-border bg-background shrink-0 mt-auto">
            <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full justify-end">
              <Button variant="outline" onClick={() => setSelectedConversation(null)}>
                Fechar
              </Button>
              <Button 
                onClick={handleOpenChat}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <MessageSquare className="h-4 w-4" />
                Abrir Chat Completo
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {chatConversation && (
        <FullChatModal 
          isOpen={!!chatConversation}
          onClose={() => setChatConversation(null)}
          conversation={chatConversation}
          history={session.role === "ADMIN_SISTEMA" ? (apiByPhone[chatConversation.clientName] || []) : []}
        />
      )}
    </div>
  );
};

export default Dashboard;
