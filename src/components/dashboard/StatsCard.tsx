/**
 * StatsCard Component
 * 
 * Exibe um cartão de estatística individual no dashboard.
 * Mostra um ícone, valor principal, label descritivo e indicador de mudança.
 * 
 * @component
 * @example
 * <StatsCard
 *   label="Total de Interações"
 *   value="1,234"
 *   icon={MessageSquare}
 *   change="+12.5%"
 * />
 */

import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  /** Label descritivo da estatística */
  label: string;
  /** Valor principal da estatística (como string para permitir formatação) */
  value: string;
  /** Ícone do Lucide React para representar a estatística */
  icon: LucideIcon;
  /** Indicador de mudança (ex: "+12.5%", "-0.3s") */
  change: string;
}

export const StatsCard = ({ label, value, icon: Icon, change }: StatsCardProps) => {
  /**
   * Determina se a mudança é positiva (começa com '+')
   * Usado para definir a cor do indicador
   */
  const isPositiveChange = change.startsWith('+');

  return (
    <Card className="p-6 border-border/50 hover:shadow-lg transition-shadow duration-300">
      {/* Cabeçalho: Ícone e indicador de mudança */}
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8 text-accent" />
        <span 
          className={`text-sm font-medium ${
            isPositiveChange ? 'text-green-600' : 'text-blue-600'
          }`}
        >
          {change}
        </span>
      </div>
      
      {/* Valor principal da estatística */}
      <h3 className="text-2xl font-bold text-foreground mb-1">
        {value}
      </h3>
      
      {/* Label descritivo */}
      <p className="text-sm text-muted-foreground">
        {label}
      </p>
    </Card>
  );
};
