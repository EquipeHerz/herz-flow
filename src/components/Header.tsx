import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, User as UserIcon, Building, FileText, Settings, Menu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
}

export const Header = ({ showBackButton = false, title = "Dashboard Herz", subtitle }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdminOrCompany = ["ADMIN_SISTEMA", "ADMIN_EMPRESA"].includes(user.role);
  const isManager = ["ADMIN_SISTEMA", "ADMIN_EMPRESA", "ADMIN_SETOR"].includes(user.role);

  // Formatar o cargo/função para exibição
  const roleDisplay = user.role.replace('ADMIN_', 'Admin ').replace('_', ' ');

  return (
    <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Voltar ao Dashboard</span>
              </Button>
            )}
            {!showBackButton && (
               <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
                 <Avatar className="h-10 w-10 border border-border">
                   <AvatarImage src={user.avatar} alt={user.name} />
                   <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                 </Avatar>
                 <div>
                   <h1 className="text-sm font-bold text-foreground truncate max-w-[200px]" title={user.name}>
                     {user.name.length > 25 ? user.name.substring(0, 25) + '...' : user.name}
                   </h1>
                   <p className="text-xs text-muted-foreground font-medium">
                     {user.position || roleDisplay}
                   </p>
                 </div>
               </div>
            )}
            {showBackButton && (
                <div>
                   <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
                   {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4 mr-2" />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("/meu-perfil")}>
                  <UserIcon className="mr-2 h-4 w-4" /> Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <Building className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                {user.role === 'ADMIN_SISTEMA' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/registro-empresa")}>
                      <Building className="mr-2 h-4 w-4" /> Nova Empresa
                    </DropdownMenuItem>
                  </>
                )}
                {['ADMIN_SISTEMA', 'ADMIN_EMPRESA', 'ADMIN_SETOR'].includes(user.role) && (
                  <DropdownMenuItem onClick={() => navigate("/listagem-usuarios")}>
                    <Users className="mr-2 h-4 w-4" /> Usuários
                  </DropdownMenuItem>
                )}
                {['ADMIN_SISTEMA', 'ADMIN_EMPRESA'].includes(user.role) && (
                  <DropdownMenuItem onClick={() => navigate("/editor-contrato")}>
                    <FileText className="mr-2 h-4 w-4" /> Contratos
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
