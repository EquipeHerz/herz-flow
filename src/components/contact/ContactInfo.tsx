import { Mail, Phone, MapPin } from "lucide-react";

interface ContactInfoItemProps {
  icon: React.ElementType;
  title: string;
  content: string;
  secondaryContent?: string;
}

const ContactInfoItem = ({ icon: Icon, title, content, secondaryContent }: ContactInfoItemProps) => {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300">
      <Icon className="h-8 w-8 text-accent mb-4" />
      
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      
      <p className="text-foreground/70">{content}</p>
      
      {secondaryContent && (
        <p className="text-foreground/70 mt-1">{secondaryContent}</p>
      )}
    </div>
  );
};

export const ContactInfo = () => {
  return (
    <div className="space-y-8">
      <ContactInfoItem
        icon={Mail}
        title="Email"
        content="pedro.cordeiro@grupoherz.com.br"
      />

      <ContactInfoItem
        icon={Phone}
        title="Telefone"
        content="+55 54 99883 3682"
        secondaryContent="+55 54 99969 9949"
      />

      <ContactInfoItem
        icon={MapPin}
        title="Localização"
        content="Nova Petrópolis, RS - Brasil"
        secondaryContent="Em breve: Munique, Alemanha"
      />
    </div>
  );
};
