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
import { LayoutGrid, List, MessageSquare, TrendingUp, Users, Calendar, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
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

/**
 * Interface para dados da sessão do usuário
 */
interface UserSession {
  username: string;
  role: "admin" | "empresa" | "cliente";
  name: string;
  loginTime: string;
}

/**
 * Dados mock de conversas para demonstração
 */
const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "001", clientName: "João Silva", empresa: "Tech Solutions", messages: 342, lastInteraction: "Há 2 horas", date: "2024-01-15", preview: "Preciso de ajuda com reserva..." },
  { id: "002", clientName: "Maria Santos", empresa: "Tech Solutions", messages: 278, lastInteraction: "Há 5 horas", date: "2024-01-15", preview: "Quais são os horários disponíveis?" },
  { id: "003", clientName: "Pedro Costa", empresa: "Hotel Imperial", messages: 189, lastInteraction: "Há 1 dia", date: "2024-01-14", preview: "Gostaria de informações sobre..." },
  { id: "004", clientName: "Ana Oliveira", empresa: "Tech Solutions", messages: 156, lastInteraction: "Há 2 dias", date: "2024-01-13", preview: "Obrigada pelo atendimento!" },
  { id: "005", clientName: "Carlos Mendes", empresa: "Hotel Imperial", messages: 234, lastInteraction: "Há 3 horas", date: "2024-01-15", preview: "Preciso cancelar uma reserva..." },
  { id: "006", clientName: "Juliana Lima", empresa: "Turismo Aventura", messages: 167, lastInteraction: "Há 6 horas", date: "2024-01-15", preview: "Quais pacotes vocês oferecem?" },
  { id: "007", clientName: "Roberto Alves", empresa: "Tech Solutions", messages: 289, lastInteraction: "Há 1 dia", date: "2024-01-14", preview: "Perfeito, muito obrigado!" },
  { id: "008", clientName: "Fernanda Rocha", empresa: "Turismo Aventura", messages: 198, lastInteraction: "Há 4 horas", date: "2024-01-15", preview: "Gostaria de mais informações..." },
  { id: "009", clientName: "Lucas Ferreira", empresa: "Hotel Imperial", messages: 145, lastInteraction: "Há 2 dias", date: "2024-01-13", preview: "Qual o melhor horário para..." },
  { id: "010", clientName: "Camila Souza", empresa: "Tech Solutions", messages: 312, lastInteraction: "Há 1 hora", date: "2024-01-15", preview: "Preciso atualizar meus dados..." }
];

const Dashboard = () => {
  const navigate = useNavigate();
  
  // ============= Estados =============
  /** Modo de visualização das conversas */
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  /** Sessão do usuário logado */
  const [session, setSession] = useState<UserSession | null>(null);
  
  /** Conversa selecionada para exibir detalhes */
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  /** Página atual da paginação */
  const [currentPage, setCurrentPage] = useState(1);
  
  /** Termo de busca */
  const [searchTerm, setSearchTerm] = useState("");
  
  /** Data inicial do filtro */
  const [dateStart, setDateStart] = useState("");
  
  /** Data final do filtro */
  const [dateEnd, setDateEnd] = useState("");
  
  /** Filtro de empresa */
  const [filterEmpresa, setFilterEmpresa] = useState("all");
  
  /** Número de itens por página */
  const itemsPerPage = 8;

  /**
   * Effect: Verifica autenticação ao montar o componente
   * Redireciona para login se não houver sessão válida
   */
  useEffect(() => {
    const savedSession = localStorage.getItem("userSession");
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  /**
   * Realiza logout do usuário
   * Remove sessão do localStorage e redireciona para login
   */
  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login");
  };

  /**
   * Memo: Filtra conversas baseado no perfil do usuário e filtros aplicados
   * - Admin: vê todas as conversas
   * - Empresa: vê apenas conversas da sua empresa
   * - Cliente: vê apenas suas próprias conversas
   */
  const filteredConversations = useMemo(() => {
    let filtered = MOCK_CONVERSATIONS;

    // Filtro baseado no perfil/role
    if (session?.role === "empresa") {
      filtered = filtered.filter(conv => conv.empresa === "Tech Solutions");
    } else if (session?.role === "cliente") {
      filtered = filtered.filter(conv => conv.clientName === session.name);
    }

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
    
    // Filtro de data final
    if (dateEnd) {
      filtered = filtered.filter(conv => conv.date <= dateEnd);
    }

    // Filtro de empresa (apenas para admin)
    if (filterEmpresa !== "all" && session?.role === "admin") {
      filtered = filtered.filter(conv => conv.empresa === filterEmpresa);
    }

    return filtered;
  }, [session, searchTerm, dateStart, dateEnd, filterEmpresa]);

  /**
   * Memo: Calcula paginação
   */
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /**
   * Memo: Calcula estatísticas para admin e empresa
   */
  const stats = useMemo(() => {
    const conversations = session?.role === "empresa" 
      ? MOCK_CONVERSATIONS.filter(c => c.empresa === "Tech Solutions")
      : session?.role === "admin"
      ? MOCK_CONVERSATIONS
      : [];

    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages, 0);
    const totalConversations = conversations.length;

    return [
      { label: "Total de Interações", value: totalMessages.toString(), icon: MessageSquare, change: "+12.5%" },
      { label: "Total de Conversas", value: totalConversations.toString(), icon: Users, change: "+8" },
      { label: "Média de Resposta", value: "1.2s", icon: Calendar, change: "-0.3s" }
    ];
  }, [session]);

  // Não renderiza nada enquanto carrega a sessão
  if (!session) {
    return null;
  }

  // Determina se deve mostrar estatísticas (apenas admin e empresa)
  const showStats = session.role === "admin" || session.role === "empresa";

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho fixo do dashboard */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Lado esquerdo: Botão voltar e título */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Dashboard Herz</h1>
                <p className="text-sm text-muted-foreground">{session.name} - {session.role}</p>
              </div>
            </div>
            
            {/* Lado direito: Controles */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
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
          dateEnd={dateEnd}
          onDateEndChange={setDateEnd}
          filterEmpresa={filterEmpresa}
          onFilterEmpresaChange={setFilterEmpresa}
          isAdmin={session.role === "admin"}
        />

        {/* Lista de Conversas */}
        <Card className="p-6 border-border/50">
          {/* Cabeçalho: Título e controles de visualização */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Conversas ({filteredConversations.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Conteúdo: Lista ou mensagem de vazio */}
          {paginatedConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            <>
              {/* Renderização baseada no modo de visualização */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedConversations.map((conv) => (
                    <ConversationCard
                      key={conv.id}
                      conversation={conv}
                      viewMode="grid"
                      showCompany={session.role === "admin"}
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
                      showCompany={session.role === "admin"}
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
        </Card>
      </main>

      {/* Modal de Detalhes da Conversa */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Conversa #{selectedConversation?.id}</DialogTitle>
            <DialogDescription className="text-base pt-4 space-y-4">
              {/* Informações da conversa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-foreground">Cliente</p>
                  <p className="text-muted-foreground">{selectedConversation?.clientName}</p>
                </div>
                {session.role === "admin" && (
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
                  {/* Mensagem do cliente */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-l-4 border-blue-500 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Cliente - 10:30</p>
                    <p className="text-sm text-foreground">{selectedConversation?.preview}</p>
                  </div>
                  
                  {/* Mensagem do bot */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-l-4 border-purple-500 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Bot - 10:31</p>
                    <p className="text-sm text-foreground">Olá! Como posso ajudá-lo hoje?</p>
                  </div>
                  
                  {/* Mensagem do cliente */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-l-4 border-blue-500 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Cliente - 10:32</p>
                    <p className="text-sm text-foreground">Gostaria de fazer uma reserva para o próximo fim de semana.</p>
                  </div>
                  
                  {/* Mensagem do bot */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-l-4 border-purple-500 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Bot - 10:32</p>
                    <p className="text-sm text-foreground">Perfeito! Vou ajudá-lo com isso. Para quantas pessoas seria a reserva?</p>
                  </div>
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
