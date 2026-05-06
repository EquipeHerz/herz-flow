import { LucideIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  color: string;
}

export const ServiceCard = ({ icon: Icon, title, description, features, color }: ServiceCardProps) => {
  const handleScrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-border/50 flex flex-col h-full relative">
      <div className={`bg-gradient-to-br ${color} p-8 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        
        <Icon className="h-12 w-12 text-accent mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
        
        <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">
          {title}
        </h3>
      </div>
      
      <div className="p-8 pb-20 space-y-6 flex flex-col flex-1">
        <p className="text-foreground/70 leading-relaxed">
          {description}
        </p>
        
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <ArrowRight className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute left-[15px] right-[15px] bottom-[15px]">
        <Button size="lg" variant="default" className="w-full" onClick={handleScrollToContact}>
          Solicitar Demonstração
        </Button>
      </div>
    </div>
  );
};
