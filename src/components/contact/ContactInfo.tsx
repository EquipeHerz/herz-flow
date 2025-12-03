/**
 * ContactInfo Component
 * 
 * Exibe as informações de contato da empresa em cards individuais.
 * Inclui ícones e informações para email, telefone e localização.
 * 
 * @component
 * @example
 * <ContactInfo />
 */

import { Mail, Phone, MapPin } from "lucide-react";

interface ContactInfoItemProps {
  /** Ícone do Lucide React */
  icon: React.ElementType;
  /** Título da informação (ex: "Email", "Telefone") */
  title: string;
  /** Conteúdo principal da informação */
  content: string;
  /** Conteúdo secundário opcional (ex: informação adicional) */
  secondaryContent?: string;
}

/**
 * Item individual de informação de contato
 */
const ContactInfoItem = ({ icon: Icon, title, content, secondaryContent }: ContactInfoItemProps) => {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300">
      {/* Ícone com cor de destaque */}
      <Icon className="h-8 w-8 text-accent mb-4" />
      
      {/* Título da informação */}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      
      {/* Conteúdo principal */}
      <p className="text-foreground/70">{content}</p>
      
      {/* Conteúdo secundário opcional */}
      {secondaryContent && (
        <p className="text-foreground/70 mt-1">{secondaryContent}</p>
      )}
    </div>
  );
};

/**
 * Componente principal que agrupa todas as informações de contato
 */
export const ContactInfo = () => {
  return (
    <div className="space-y-8">
      {/* Informação de Email */}
      <ContactInfoItem
        icon={Mail}
        title="Email"
        content="pedro.cordeiro@grupoherz.com.br"
      />

      {/* Informação de Telefone */}
      <ContactInfoItem
        icon={Phone}
        title="Telefone"
        content="+55 54 99883 3682"
        secondaryContent="+55 54 99969 9949"
      />

      {/* Informação de Localização */}
      <ContactInfoItem
        icon={MapPin}
        title="Localização"
        content="Nova Petrópolis, RS - Brasil"
        secondaryContent="Em breve: Munique, Alemanha"
      />
    </div>
  );
};
