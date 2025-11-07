import { useState } from "react";
import { LayoutGrid, List, MessageSquare, TrendingUp, Users, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const stats = [
    { label: "Total de Interações", value: "2,543", icon: MessageSquare, change: "+12.5%" },
    { label: "Taxa de Satisfação", value: "94.8%", icon: TrendingUp, change: "+2.3%" },
    { label: "Clientes Ativos", value: "18", icon: Users, change: "+3" },
    { label: "Média de Resposta", value: "1.2s", icon: Calendar, change: "-0.3s" }
  ];

  const interactions = [
    {
      client: "Hotel Serra Azul",
      messages: 342,
      satisfaction: 96,
      lastInteraction: "Há 2 horas",
      status: "Ativo"
    },
    {
      client: "Pousada Vale Encantado",
      messages: 278,
      satisfaction: 94,
      lastInteraction: "Há 5 horas",
      status: "Ativo"
    },
    {
      client: "Turismo Aventura RS",
      messages: 189,
      satisfaction: 92,
      lastInteraction: "Há 1 dia",
      status: "Normal"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Herz</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-accent text-background" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-accent text-background" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Main Content */}
        <Card className="p-6 border-border/50">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="interactions">Interações</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Atividade dos Clientes</h2>
              
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {interactions.map((item, index) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-border/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">{item.client}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'Ativo' ? 'bg-green-500/20 text-green-700' : 'bg-blue-500/20 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mensagens:</span>
                          <span className="font-medium">{item.messages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Satisfação:</span>
                          <span className="font-medium">{item.satisfaction}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Última interação:</span>
                          <span className="font-medium">{item.lastInteraction}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {interactions.map((item, index) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">{item.client}</h3>
                          <div className="flex gap-6 text-sm text-muted-foreground">
                            <span>Mensagens: <strong className="text-foreground">{item.messages}</strong></span>
                            <span>Satisfação: <strong className="text-foreground">{item.satisfaction}%</strong></span>
                            <span>Última interação: <strong className="text-foreground">{item.lastInteraction}</strong></span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          item.status === 'Ativo' ? 'bg-green-500/20 text-green-700' : 'bg-blue-500/20 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="interactions">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Visualização detalhada de interações em desenvolvimento</p>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Histórico completo de conversas em desenvolvimento</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
