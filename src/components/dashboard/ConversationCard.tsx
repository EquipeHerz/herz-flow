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
const GridView = ({ conversation, showCompany }: Pick<ConversationCardProps, 'conversation' | 'showCompany'>) => (
  <>
    {/* Cabeçalho com ID */}
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-accent">#{conversation.id}</span>
    </div>
    
    {/* Nome do cliente */}
    <h3 className="font-semibold text-foreground mb-2">{conversation.clientName}</h3>
    
    {/* Nome da empresa (apenas para admin) */}
    {showCompany && (
      <p className="text-sm text-muted-foreground mb-2">{conversation.empresa}</p>
    )}
    
    {/* Preview da conversa (limitado a 2 linhas) */}
    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{conversation.preview}</p>
    
    {/* Estatísticas da conversa */}
    <div className="space-y-1 text-xs text-muted-foreground">
      <div className="flex justify-between">
        <span>Mensagens:</span>
        <span className="font-medium text-foreground">{conversation.messages}</span>
      </div>
      <div className="flex justify-between">
        <span>Última:</span>
        <span className="font-medium text-foreground">{conversation.lastInteraction}</span>
      </div>
    </div>
  </>
);

/**
 * Renderiza o cartão no modo List (visualização em lista detalhada)
 */
const ListView = ({ conversation, showCompany }: Pick<ConversationCardProps, 'conversation' | 'showCompany'>) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      {/* Linha de cabeçalho: ID, nome e empresa */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-medium text-accent">#{conversation.id}</span>
        <h3 className="font-semibold text-foreground">{conversation.clientName}</h3>
        {showCompany && (
          <span className="text-sm text-muted-foreground">- {conversation.empresa}</span>
        )}
      </div>
      
      {/* Preview da conversa */}
      <p className="text-sm text-muted-foreground mb-3">{conversation.preview}</p>
      
      {/* Estatísticas em linha horizontal */}
      <div className="flex gap-6 text-sm text-muted-foreground">
        <span>Mensagens: <strong className="text-foreground">{conversation.messages}</strong></span>
        <span>Última: <strong className="text-foreground">{conversation.lastInteraction}</strong></span>
      </div>
    </div>
  </div>
);

export const ConversationCard = ({ conversation, viewMode, showCompany = false, onClick }: ConversationCardProps) => {
  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow border-border/50 cursor-pointer"
      onClick={onClick}
    >
      {/* Renderiza a view apropriada baseada no modo selecionado */}
      {viewMode === "grid" ? (
        <GridView conversation={conversation} showCompany={showCompany} />
      ) : (
        <ListView conversation={conversation} showCompany={showCompany} />
      )}
    </Card>
  );
};
