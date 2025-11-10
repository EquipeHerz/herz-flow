/**
 * ServiceCard Component
 * 
 * Componente responsável por exibir um cartão individual de serviço.
 * Inclui ícone, título, descrição, lista de recursos e botão de ação.
 * 
 * @component
 * @example
 * <ServiceCard
 *   icon={Bot}
 *   title="Chatbots Inteligentes"
 *   description="Sistemas de IA..."
 *   features={["24/7", "Personalizado"]}
 *   color="from-accent/20 to-accent/5"
 * />
 */

import { LucideIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  /** Ícone do Lucide React para exibir no topo do cartão */
  icon: LucideIcon;
  /** Título principal do serviço */
  title: string;
  /** Descrição detalhada do serviço */
  description: string;
  /** Lista de recursos/características do serviço */
  features: string[];
  /** Classes do Tailwind para o gradiente de fundo (formato: "from-X to-Y") */
  color: string;
}

export const ServiceCard = ({ icon: Icon, title, description, features, color }: ServiceCardProps) => {
  /**
   * Manipula o scroll suave até a seção de contato quando o botão é clicado
   */
  const handleScrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-border/50">
      {/* Cabeçalho do cartão com gradiente e ícone */}
      <div className={`bg-gradient-to-br ${color} p-8 relative overflow-hidden`}>
        {/* Elemento decorativo de fundo com animação ao hover */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        
        {/* Ícone do serviço com animação de escala ao hover */}
        <Icon className="h-12 w-12 text-accent mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
        
        {/* Título do serviço */}
        <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">
          {title}
        </h3>
      </div>
      
      {/* Corpo do cartão com descrição e recursos */}
      <div className="p-8 space-y-6">
        {/* Descrição do serviço */}
        <p className="text-foreground/70 leading-relaxed">
          {description}
        </p>
        
        {/* Lista de recursos/características */}
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <ArrowRight className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Botão de ação para solicitar demonstração */}
        <Button 
          className="w-full bg-accent hover:bg-accent/90 text-background"
          onClick={handleScrollToContact}
        >
          Solicitar Demonstração
        </Button>
      </div>
    </div>
  );
};
