/**
 * ConversationFilters Component
 * 
 * Barra de filtros para conversas no dashboard.
 * Permite filtrar por busca de texto, intervalo de datas e empresa (apenas para admin).
 * 
 * @component
 * @example
 * <ConversationFilters
 *   searchTerm={search}
 *   onSearchChange={setSearch}
 *   dateStart={start}
 *   onDateStartChange={setStart}
 *   dateEnd={end}
 *   onDateEndChange={setEnd}
 *   filterEmpresa={empresa}
 *   onFilterEmpresaChange={setEmpresa}
 *   isAdmin={true}
 * />
 */

import { Search } from "lucide-react";
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
  /** Data final do filtro (formato: YYYY-MM-DD) */
  dateEnd: string;
  /** Callback para atualizar a data final */
  onDateEndChange: (value: string) => void;
  /** Empresa selecionada no filtro ("all" para todas) */
  filterEmpresa: string;
  /** Callback para atualizar o filtro de empresa */
  onFilterEmpresaChange: (value: string) => void;
  /** Se o usuário é admin (exibe filtro de empresa) */
  isAdmin: boolean;
}

/**
 * Lista de empresas disponíveis para filtragem
 */
const EMPRESAS = [
  { value: "all", label: "Todas as empresas" },
  { value: "Tech Solutions", label: "Tech Solutions" },
  { value: "Hotel Imperial", label: "Hotel Imperial" },
  { value: "Turismo Aventura", label: "Turismo Aventura" },
];

export const ConversationFilters = ({
  searchTerm,
  onSearchChange,
  dateStart,
  onDateStartChange,
  dateEnd,
  onDateEndChange,
  filterEmpresa,
  onFilterEmpresaChange,
  isAdmin,
}: ConversationFiltersProps) => {
  return (
    <Card className="p-6 mb-6 border-border/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Campo de Busca por ID ou Nome */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou nome..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro de Data Inicial */}
        <Input
          type="date"
          placeholder="Data inicial"
          value={dateStart}
          onChange={(e) => onDateStartChange(e.target.value)}
        />

        {/* Filtro de Data Final */}
        <Input
          type="date"
          placeholder="Data final"
          value={dateEnd}
          onChange={(e) => onDateEndChange(e.target.value)}
        />

        {/* Filtro de Empresa (apenas para admin) */}
        {isAdmin && (
          <Select value={filterEmpresa} onValueChange={onFilterEmpresaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              {EMPRESAS.map((empresa) => (
                <SelectItem key={empresa.value} value={empresa.value}>
                  {empresa.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </Card>
  );
};
