/**
 * ConversationFilters Component
 * 
 * Barra de filtros para conversas no dashboard.
 * Permite filtrar por busca de texto, data e empresa (apenas para admin).
 * 
 * @component
 * @example
 * <ConversationFilters
 *   searchTerm={search}
 *   onSearchChange={setSearch}
 *   dateStart={start}
 *   onDateStartChange={setStart}
 *   companies={["Embeddixy", "Tech Solutions"]}
 *   filterEmpresa={empresa}
 *   onFilterEmpresaChange={setEmpresa}
 *   isAdmin={true}
 * />
 */

import { Search, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConversationFiltersProps {
  /** Termo de busca atual */
  searchTerm: string;
  /** Callback para atualizar o termo de busca */
  onSearchChange: (value: string) => void;
  /** Data inicial do filtro (formato: YYYY-MM-DD) */
  dateStart: string;
  /** Callback para atualizar a data inicial */
  onDateStartChange: (value: string) => void;
  /** Empresa selecionada no filtro ("all" para todas) */
  filterEmpresa: string;
  /** Callback para atualizar o filtro de empresa */
  onFilterEmpresaChange: (value: string) => void;
  /** Se o usuário é admin (exibe filtro de empresa) */
  isAdmin: boolean;
  /** Lista de empresas disponíveis baseada nos cards */
  companies: string[];
}

export const ConversationFilters = ({
  searchTerm,
  onSearchChange,
  dateStart,
  onDateStartChange,
  filterEmpresa,
  onFilterEmpresaChange,
  isAdmin,
  companies,
}: ConversationFiltersProps) => {
  const options = ["all", ...companies];
  return (
    <Card className="p-6 mb-6 border-border/50">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Campo de Busca por ID ou Nome */}
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou nome..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12"
            aria-label="Buscar por ID ou nome"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Filtro de Data */}
        <div className="relative">
          <Calendar aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            placeholder="Data"
            value={dateStart}
            onChange={(e) => onDateStartChange(e.target.value)}
            className="pl-12"
            aria-label="Data"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Filtro de Empresa (apenas para admin) */}
        {isAdmin && (
          <Select value={filterEmpresa} onValueChange={onFilterEmpresaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              {options.map((empresa) => (
                <SelectItem key={empresa} value={empresa}>
                  {empresa === "all" ? "Todas as empresas" : empresa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </Card>
  );
};
