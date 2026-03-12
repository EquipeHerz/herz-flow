/**
 * Dashboard Component
 * 
 * Painel de controle principal para administradores, empresas e clientes.
 * Exibe estatísticas, lista de conversas com filtros e detalhes de conversas.
 * 
 * Funcionalidades:
 * - Autenticação e gestão de sessão
 * - Visualização de estatísticas (admin e empresa)
 * - Filtros avançados (busca, data, empresa)
 * - Visualização em grid ou lista
 * - Paginação de resultados
 * - Modal de detalhes da conversa
 * 
 * @component
 */

import { useState, useEffect, useMemo } from "react";
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
} from "@/components/ui/dialog";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ConversationCard, Conversation } from "@/components/dashboard/ConversationCard";
import { ConversationFilters } from "@/components/dashboard/ConversationFilters";

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

// Removed UserSession interface, using User from context

const MOCK_CONVERSATIONS: Conversation[] = [
  // ... (keep mock data)
  { id: "001", clientName: "João Silva", empresa: "Tech Solutions", messages: 342, lastInteraction: "Há 2 horas", date: "2024-01-15", preview: "Preciso de ajuda com reserva...", origin: "instagram", originTimestamp: "2024-01-15T10:30:00" },
  { id: "002", clientName: "Maria Santos", empresa: "Tech Solutions", messages: 278, lastInteraction: "Há 5 horas", date: "2024-01-15", preview: "Quais são os horários disponíveis?", origin: "whatsapp", originTimestamp: "2024-01-15T09:10:00" },
  { id: "003", clientName: "Pedro Costa", empresa: "Hotel Imperial", messages: 189, lastInteraction: "Há 1 dia", date: "2024-01-14", preview: "Gostaria de informações sobre...", origin: "facebook", originTimestamp: "2024-01-14T16:45:00" },
  { id: "004", clientName: "Ana Oliveira", empresa: "Tech Solutions", messages: 156, lastInteraction: "Há 2 dias", date: "2024-01-13", preview: "Obrigada pelo atendimento!", origin: "instagram", originTimestamp: "2024-01-13T12:00:00" },
  { id: "005", clientName: "Carlos Mendes", empresa: "Hotel Imperial", messages: 234, lastInteraction: "Há 3 horas", date: "2024-01-15", preview: "Preciso cancelar uma reserva...", origin: "whatsapp", originTimestamp: "2024-01-15T08:20:00" },
  { id: "006", clientName: "Juliana Lima", empresa: "Turismo Aventura", messages: 167, lastInteraction: "Há 6 horas", date: "2024-01-15", preview: "Quais pacotes vocês oferecem?", origin: "facebook", originTimestamp: "2024-01-15T07:50:00" },
  { id: "007", clientName: "Roberto Alves", empresa: "Tech Solutions", messages: 289, lastInteraction: "Há 1 dia", date: "2024-01-14", preview: "Perfeito, muito obrigado!", origin: "whatsapp", originTimestamp: "2024-01-14T11:15:00" },
  { id: "008", clientName: "Fernanda Rocha", empresa: "Turismo Aventura", messages: 198, lastInteraction: "Há 4 horas", date: "2024-01-15", preview: "Gostaria de mais informações...", origin: "instagram", originTimestamp: "2024-01-15T14:05:00" },
  { id: "009", clientName: "Lucas Ferreira", empresa: "Hotel Imperial", messages: 145, lastInteraction: "Há 2 dias", date: "2024-01-13", preview: "Qual o melhor horário para...", origin: "facebook", originTimestamp: "2024-01-13T09:40:00" },
  { id: "010", clientName: "Camila Souza", empresa: "Tech Solutions", messages: 312, lastInteraction: "Há 1 hora", date: "2024-01-15", preview: "Preciso atualizar meus dados...", origin: "whatsapp", originTimestamp: "2024-01-15T15:25:00" }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: session, logout } = useAuth();
  
  // ============= Estados =============
  /** Modo de visualização das conversas */
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Session is now from context

  /** Conversa selecionada para exibir detalhes */
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  /** Página atual da paginação */
  const [currentPage, setCurrentPage] = useState(1);
  
  /** Termo de busca */
  const [searchTerm, setSearchTerm] = useState("");
  
  /** Data inicial do filtro */
  const [dateStart, setDateStart] = useState("");
  
  
  /** Filtro de empresa */
  const [filterEmpresa, setFilterEmpresa] = useState("all");
  
  /** Número de itens por página */
  const itemsPerPage = 8;

  const [apiInteractions, setApiInteractions] = useState<ApiInteraction[]>([]);
  const [apiByPhone, setApiByPhone] = useState<Record<string, ApiInteraction[]>>({});
  const [apiConversations, setApiConversations] = useState<Conversation[]>([]);

  // ... (keep helper functions: toMillis, relativeFromNow, maskPhone, formatHMDate, formatHour, formatDate)
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

  const fetchApiData = async () => {
    // ... (keep fetchApiData implementation)
    try {
      const response = await fetch("https://n8n.srv1025595.hstgr.cloud/webhook/bdembeddixy?empresa=Embeddixy", {
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
        
        // Determine origin from the last interaction or any in the list
        const social = last?.redesocial || list.find(i => i.redesocial)?.redesocial;

        return {
          id: (idx + 1).toString().padStart(3, "0"),
          clientName: phone || "Desconhecido",
          empresa: "Embeddixy",
          messages: totalMessages,
          lastInteraction: relativeFromNow(last?.tempo ?? last?.timestamp),
          date: dateStr,
          preview: lastMsg || "Sem mensagem",
          origin: getOrigin(social),
          originTimestamp: originTs
        };
      });
      setApiConversations(conversations);
    } catch {
      setApiInteractions([]);
      setApiByPhone({});
      setApiConversations([]);
    }
  };

  useEffect(() => {
    if (session?.role === "ADMIN_SISTEMA") {
      fetchApiData();
      const id = setInterval(fetchApiData, 10000);
      return () => clearInterval(id);
    }
  }, [session]);

  const handleLogout = () => {
    logout();
  };

  const filteredConversations = useMemo(() => {
    // Safety check for session
    if (!session || !session.role) return [];

    const base = session.role === "ADMIN_SISTEMA" ? apiConversations : MOCK_CONVERSATIONS;
    let filtered = base;

    // Filtro baseado no perfil/role
    if (session.role !== "ADMIN_SISTEMA" && session.companyName) {
      filtered = filtered.filter(conv => conv.empresa === session.companyName);
    } 
    // Cliente logic removed or mapped?
    // If there is a 'cliente' role in legacy, it's not in UserRole anymore.
    // Assuming OPERADOR behaves like 'empresa' for now.

    // Filtro de busca por ID ou nome
    if (searchTerm) {
      filtered = filtered.filter(conv => 
        conv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de data inicial
    if (dateStart) {
      filtered = filtered.filter(conv => conv.date >= dateStart);
    }
    
    // Filtro de empresa (apenas para admin)
    if (filterEmpresa !== "all" && session.role === "ADMIN_SISTEMA") {
      filtered = filtered.filter(conv => conv.empresa === filterEmpresa);
    }

    const sorted = filtered.slice().sort((a, b) => {
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
    if (session?.role === "ADMIN_SISTEMA") {
      const totalInteractions = apiInteractions.length;
      const totalConversations = Object.keys(apiByPhone).length;
      const responsesPerConversation = totalConversations === 0
        ? 0
        : Object.values(apiByPhone).reduce((sum, list) => {
            const resp = list.filter(item => item.send_msg).length;
            return sum + resp;
          }, 0) / totalConversations;
      return [
        { label: "Total de Interações", value: totalInteractions.toString(), icon: MessageSquare, change: "+0" },
        { label: "Total de Conversas", value: totalConversations.toString(), icon: Users, change: "+0" },
        { label: "Média de Respostas", value: responsesPerConversation.toFixed(2), icon: Calendar, change: "+0" }
      ];
    }
    const conversations = (session?.role === "ADMIN_EMPRESA" || session?.role === "OPERADOR")
      ? MOCK_CONVERSATIONS.filter(c => c.empresa === "Tech Solutions")
      : [];
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages, 0);
    const totalConversations = conversations.length;
    return [
      { label: "Total de Interações", value: totalMessages.toString(), icon: MessageSquare, change: "+12.5%" },
      { label: "Total de Conversas", value: totalConversations.toString(), icon: Users, change: "+8" },
      { label: "Média de Resposta", value: "1.2s", icon: Calendar, change: "-0.3s" }
    ];
  }, [session, apiInteractions, apiByPhone]);

  if (!session) {
    return null;
  }

  // Ensure role exists to prevent crash
  if (!session.role) {
    return <div className="flex items-center justify-center min-h-screen">Erro de sessão: Perfil não definido.</div>;
  }

  const showStats = session.role === "ADMIN_SISTEMA" || session.role === "ADMIN_EMPRESA";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Quick Actions / Shortcuts */}
        {session.role !== 'OPERADOR' && session.role !== 'FUNCIONARIO_SETOR' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Acesso Rápido</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {session.role === 'ADMIN_SISTEMA' && (
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full flex items-center justify-center min-h-[120px] sm:min-h-[140px]" onClick={() => navigate('/listagem-empresas')}>
                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-2 sm:gap-3 w-full h-full text-center">
                    <div className="p-3 sm:p-4 bg-primary/10 rounded-full text-primary flex items-center justify-center shadow-sm">
                      <Building className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm">Gerenciar Empresas</span>
                  </CardContent>
                </Card>
              )}
              
              {['ADMIN_SISTEMA', 'ADMIN_EMPRESA', 'ADMIN_SETOR'].includes(session.role) && (
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full flex items-center justify-center min-h-[120px] sm:min-h-[140px]" onClick={() => navigate('/listagem-usuarios')}>
                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-2 sm:gap-3 w-full h-full text-center">
                    <div className="p-3 sm:p-4 bg-blue-500/10 rounded-full text-blue-500 flex items-center justify-center shadow-sm">
                      <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm">Gerenciar Usuários</span>
                  </CardContent>
                </Card>
              )}

              {['ADMIN_SISTEMA', 'ADMIN_EMPRESA'].includes(session.role) && (
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
        )}

        {/* Cartões de Estatísticas (apenas para Admin e Empresa) */}
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

        {/* Filtros de Conversas */}
        <ConversationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateStart={dateStart}
          onDateStartChange={setDateStart}
          filterEmpresa={filterEmpresa}
          onFilterEmpresaChange={setFilterEmpresa}
          isAdmin={session.role === "ADMIN_SISTEMA"}
          companies={[...new Set((session.role === "ADMIN_SISTEMA" ? apiConversations : MOCK_CONVERSATIONS).map(c => c.empresa))]}
        />

        {/* Lista de Conversas */}
        <div className="space-y-6">
          {/* Cabeçalho: Título e controles de visualização */}
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

          {/* Conteúdo: Lista ou mensagem de vazio */}
          {paginatedConversations.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
            </Card>
          ) : (
            <>
              {/* Renderização baseada no modo de visualização */}
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

              {/* Paginação */}
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

      {/* Modal de Detalhes da Conversa */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {session.role === "ADMIN_SISTEMA" && selectedConversation?.clientName
                ? maskPhone(selectedConversation.clientName)
                : `Conversa #${selectedConversation?.id}`}
            </DialogTitle>
            <DialogDescription className="text-base pt-4 space-y-4">
              {/* ... (rest of the dialog content - keeping it mostly same but checking role) */}
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

              {/* Histórico da conversa (exemplo simulado) */}
              <div className="pt-4">
                <p className="font-semibold text-foreground mb-3">Histórico da Conversa</p>
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  {session.role === "ADMIN_SISTEMA" && selectedConversation && apiByPhone[selectedConversation.clientName]?.length ? (
                    <>
                      {apiByPhone[selectedConversation.clientName].map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="space-y-3">
                          {item.msg && (
                            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-l-4 border-blue-500 p-3 rounded-lg">
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Cliente</p>
                              {(item.tempo ?? item.timestamp) && (
                                <time
                                  className="text-[0.7rem] font-medium text-blue-600 dark:text-blue-400 mb-1 block"
                                  dateTime={toMillis(item.tempo ?? item.timestamp) ? new Date(toMillis(item.tempo ?? item.timestamp) as number).toISOString() : undefined}
                                >
                                  {formatHMDate(item.tempo ?? item.timestamp)}
                                </time>
                              )}
                              <p className="text-sm text-foreground">{item.msg}</p>
                            </div>
                          )}
                          {item.send_msg && (
                            <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-l-4 border-purple-500 p-3 rounded-lg">
                              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                {(() => {
                                  const rawName = item.id_agente ?? (item as any)["id-agente"] ?? "Bot";
                                  const lower = String(rawName).toLowerCase();
                                  return lower.includes("agente") ? rawName : `Agente ${rawName}`;
                                })()}
                              </p>
                              {item.time_sended && (
                                <time
                                  className="text-[0.7rem] font-medium text-purple-600 dark:text-purple-400 mb-1 block"
                                  dateTime={toMillis(item.time_sended) ? new Date(toMillis(item.time_sended) as number).toISOString() : undefined}
                                >
                                  {formatHMDate(item.time_sended)}
                                </time>
                              )}
                              <p className="text-sm text-foreground">{item.send_msg}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Sem histórico disponível.</div>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
