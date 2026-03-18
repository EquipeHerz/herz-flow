/**
 * ConversationCard Component
 * 
 * Exibe um cartão de conversa individual no dashboard.
 * Suporta dois modos de visualização: grid (cartão compacto) e list (lista detalhada).
 * 
 * @component
 * @example
 * <ConversationCard
 *   conversation={conversationData}
 *   viewMode="grid"
 *   showCompany={true}
 *   onClick={() => handleClick()}
 * />
 */

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Instagram, Facebook, MessageCircle, MessageSquareText, AlertCircle, AlertTriangle, User, Bot, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const maskPhone = (raw: string) => {
  const s = String(raw || "");
  return s.includes("@") ? s.split("@")[0] : s;
};

/**
 * Interface para os dados de uma conversa
 */
export interface Conversation {
  /** ID único da conversa */
  id: string;
  /** Nome do cliente */
  clientName: string;
  /** Nome da empresa responsável */
  empresa: string;
  /** Número total de mensagens na conversa */
  messages: number;
  /** Texto indicando quando foi a última interação */
  lastInteraction: string;
  /** Data da conversa no formato YYYY-MM-DD */
  date: string;
  /** Preview/resumo da conversa */
  preview: string;
  /** Origem da conversa (plataforma) */
  origin: "instagram" | "whatsapp" | "facebook" | "sms";
  /** Data/hora de origem (opcional, ISO) */
  originTimestamp?: string;
  /** Indica se a conversa requer intervenção humana */
  requiresIntervention?: boolean;
  /** Razão para a solicitação de intervenção */
  interventionReason?: string;
  /** Status do atendimento */
  status?: 'IA' | 'HUMANO' | 'FINALIZADO';
}

interface ConversationCardProps {
  /** Dados da conversa a serem exibidos */
  conversation: Conversation;
  /** Modo de visualização: 'grid' (grade) ou 'list' (lista) */
  viewMode: "grid" | "list";
  /** Se deve mostrar o nome da empresa (para usuários admin) */
  showCompany?: boolean;
  /** Função chamada ao clicar no cartão */
  onClick: () => void;
}

/**
 * Renderiza o cartão no modo Grid (visualização em grade compacta)
 */
const ORIGIN_META = {
  whatsapp: { label: "WhatsApp", color: "bg-green-500", icon: MessageCircle },
  instagram: { label: "Instagram", color: "bg-pink-500", icon: Instagram },
  facebook: { label: "Facebook", color: "bg-blue-600", icon: Facebook },
  sms: { label: "SMS", color: "bg-slate-500", icon: MessageSquareText },
} as const;

const GridView = ({ conversation, showCompany }: Pick<ConversationCardProps, 'conversation' | 'showCompany'>) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-accent">#{conversation.id}</span>
        
        {/* Priorização Visual para Status HUMANO */}
        {conversation.status === 'HUMANO' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-orange-500 animate-pulse bg-orange-500/10 p-1 rounded-full">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-orange-500 text-white border-orange-600">
                <p>Atendimento Humano Pendente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {conversation.requiresIntervention && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-red-500 animate-pulse">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-destructive text-destructive-foreground">
                <p>Intervenção Necessária: {conversation.interventionReason || "Solicitada"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-foreground mb-2">{maskPhone(conversation.clientName)}</h3>
      {conversation.status === 'HUMANO' ? (
        <Badge variant="outline" className="border-orange-500 text-orange-500 gap-1 h-5 text-[10px] px-1.5">
          <User className="h-3 w-3" /> Humano
        </Badge>
      ) : conversation.status === 'FINALIZADO' ? (
        <Badge variant="outline" className="border-green-500 text-green-500 gap-1 h-5 text-[10px] px-1.5">
          <CheckCircle2 className="h-3 w-3" /> Finalizado
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-muted-foreground gap-1 h-5 text-[10px] px-1.5">
          <Bot className="h-3 w-3" /> IA
        </Badge>
      )}
    </div>
    {showCompany && (
      <p className="text-sm text-muted-foreground mb-2">{conversation.empresa}</p>
    )}
    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[3rem]">{conversation.preview}</p>
    <div className="mt-auto space-y-1 text-xs text-muted-foreground">
      <div className="flex justify-between">
        <span>Mensagens:</span>
        <span className="font-medium text-foreground">{conversation.messages}</span>
      </div>
      <div className="flex justify-between">
        <span>Última:</span>
        <span className="font-medium text-foreground">{conversation.lastInteraction}</span>
      </div>
    </div>
  </div>
);

/**
 * Renderiza o cartão no modo List (visualização em lista detalhada)
 */
const ListView = ({ conversation, showCompany }: Pick<ConversationCardProps, 'conversation' | 'showCompany'>) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-sm font-medium text-accent">#{conversation.id}</span>
      
      {/* Badge de Prioridade Humana */}
      {conversation.status === 'HUMANO' && (
        <Badge variant="outline" className="border-orange-500 bg-orange-50 text-orange-600 gap-1 px-2 py-0.5 text-[10px] animate-pulse">
          <AlertTriangle className="h-3 w-3" />
          Prioridade Humana
        </Badge>
      )}

      {/* Badge de Status */}
      {conversation.status === 'FINALIZADO' && (
        <Badge variant="outline" className="border-green-500 bg-green-50 text-green-600 gap-1 px-2 py-0.5 text-[10px]">
          <CheckCircle2 className="h-3 w-3" />
          Finalizado
        </Badge>
      )}

      {conversation.requiresIntervention && (
        <Badge variant="destructive" className="gap-1 px-2 py-0.5 text-[10px] animate-pulse">
          <AlertCircle className="h-3 w-3" />
          Atenção
        </Badge>
      )}
      <h3 className="font-semibold text-foreground">{maskPhone(conversation.clientName)}</h3>
      {showCompany && (
        <span className="text-sm text-muted-foreground">- {conversation.empresa}</span>
      )}
    </div>
    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[3rem]">{conversation.preview}</p>
    <div className="mt-auto flex justify-between text-sm text-muted-foreground">
      <span>Mensagens: <strong className="text-foreground">{conversation.messages}</strong></span>
      <span>Última: <strong className="text-foreground">{conversation.lastInteraction}</strong></span>
    </div>
  </div>
);

export const ConversationCard = ({ conversation, viewMode, showCompany = false, onClick }: ConversationCardProps) => {
  const origin = ORIGIN_META[conversation.origin];
  const OriginIcon = origin.icon;
  return (
    <Card 
      className={`relative p-6 hover:shadow-lg transition-all border-border/50 cursor-pointer h-full flex flex-col ${
        conversation.status === 'HUMANO' 
          ? 'border-orange-500/50 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
          : conversation.status === 'FINALIZADO'
            ? 'border-green-500/30 bg-green-500/5 opacity-80 hover:opacity-100'
            : 'hover:border-primary/20'
      }`}
      onClick={onClick}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              aria-label={`Origem: ${origin.label}`}
              className={`absolute top-3 right-3 h-6 w-6 rounded-full ${origin.color} text-white flex items-center justify-center shadow-md ring-2 ring-background/60`}
            >
              <OriginIcon className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Origem: {origin.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Renderiza a view apropriada baseada no modo selecionado */}
      {viewMode === "grid" ? (
        <GridView conversation={conversation} showCompany={showCompany} />
      ) : (
        <ListView conversation={conversation} showCompany={showCompany} />
      )}
    </Card>
  );
};
