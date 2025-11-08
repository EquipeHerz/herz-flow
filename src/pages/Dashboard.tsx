import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, MessageSquare, TrendingUp, Users, Calendar, ArrowLeft, LogOut, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserSession {
  username: string;
  role: "admin" | "empresa" | "cliente";
  name: string;
  loginTime: string;
}

interface Conversation {
  id: string;
  clientName: string;
  empresa: string;
  messages: number;
  lastInteraction: string;
  date: string;
  preview: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("all");
  const itemsPerPage = 8;

  // Mock conversations data
  const allConversations: Conversation[] = [
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

  useEffect(() => {
    const savedSession = localStorage.getItem("userSession");
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login");
  };

  // Filter conversations based on user role and filters
  const filteredConversations = useMemo(() => {
    let filtered = allConversations;

    // Role-based filtering
    if (session?.role === "empresa") {
      filtered = filtered.filter(conv => conv.empresa === "Tech Solutions");
    } else if (session?.role === "cliente") {
      filtered = filtered.filter(conv => conv.clientName === session.name);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(conv => 
        conv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filters
    if (dateStart) {
      filtered = filtered.filter(conv => conv.date >= dateStart);
    }
    if (dateEnd) {
      filtered = filtered.filter(conv => conv.date <= dateEnd);
    }

    // Empresa filter (admin only)
    if (filterEmpresa !== "all" && session?.role === "admin") {
      filtered = filtered.filter(conv => conv.empresa === filterEmpresa);
    }

    return filtered;
  }, [allConversations, session, searchTerm, dateStart, dateEnd, filterEmpresa]);

  // Pagination
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics (only for admin and empresa)
  const stats = useMemo(() => {
    const conversations = session?.role === "empresa" 
      ? allConversations.filter(c => c.empresa === "Tech Solutions")
      : session?.role === "admin"
      ? allConversations
      : [];

    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages, 0);
    const totalConversations = conversations.length;

    return [
      { label: "Total de Interações", value: totalMessages.toString(), icon: MessageSquare, change: "+12.5%" },
      { label: "Total de Conversas", value: totalConversations.toString(), icon: Users, change: "+8" },
      { label: "Média de Resposta", value: "1.2s", icon: Calendar, change: "-0.3s" }
    ];
  }, [session, allConversations]);

  if (!session) {
    return null;
  }

  const showStats = session.role === "admin" || session.role === "empresa";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
        {/* Stats Cards - Only for Admin and Empresa */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-accent" />
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6 border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              placeholder="Data inicial"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Data final"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
            {session.role === "admin" && (
              <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  <SelectItem value="Tech Solutions">Tech Solutions</SelectItem>
                  <SelectItem value="Hotel Imperial">Hotel Imperial</SelectItem>
                  <SelectItem value="Turismo Aventura">Turismo Aventura</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </Card>

        {/* Conversations List */}
        <Card className="p-6 border-border/50">
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

          {paginatedConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedConversations.map((conv) => (
                    <Card 
                      key={conv.id} 
                      className="p-6 hover:shadow-lg transition-shadow border-border/50 cursor-pointer"
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-accent">#{conv.id}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{conv.clientName}</h3>
                      {session.role === "admin" && (
                        <p className="text-sm text-muted-foreground mb-2">{conv.empresa}</p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{conv.preview}</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Mensagens:</span>
                          <span className="font-medium text-foreground">{conv.messages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Última:</span>
                          <span className="font-medium text-foreground">{conv.lastInteraction}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedConversations.map((conv) => (
                    <Card 
                      key={conv.id} 
                      className="p-6 hover:shadow-lg transition-shadow border-border/50 cursor-pointer"
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-accent">#{conv.id}</span>
                            <h3 className="font-semibold text-foreground">{conv.clientName}</h3>
                            {session.role === "admin" && (
                              <span className="text-sm text-muted-foreground">- {conv.empresa}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{conv.preview}</p>
                          <div className="flex gap-6 text-sm text-muted-foreground">
                            <span>Mensagens: <strong className="text-foreground">{conv.messages}</strong></span>
                            <span>Última: <strong className="text-foreground">{conv.lastInteraction}</strong></span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
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

      {/* Conversation Detail Modal */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Conversa #{selectedConversation?.id}</DialogTitle>
            <DialogDescription className="text-base pt-4 space-y-4">
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

              <div className="pt-4">
                <p className="font-semibold text-foreground mb-3">Histórico da Conversa</p>
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-l-4 border-blue-500 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Cliente - 10:30</p>
                    <p className="text-sm text-foreground">{selectedConversation?.preview}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-l-4 border-purple-500 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Bot - 10:31</p>
                    <p className="text-sm text-foreground">Olá! Como posso ajudá-lo hoje?</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-l-4 border-blue-500 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Cliente - 10:32</p>
                    <p className="text-sm text-foreground">Gostaria de fazer uma reserva para o próximo fim de semana.</p>
                  </div>
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
