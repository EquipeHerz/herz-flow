import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LogOut, User as UserIcon, Building, FileText, Settings, Menu, Users, Edit, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { features } from "@/config/features";

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
}

export const Header = ({ showBackButton = false, title = "Dashboard Herz", subtitle }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role || 'GUEST';
  const roleDisplay = role.replace('ADMIN_', 'Admin ').replace('_', ' ');
  const userName = user.name || 'Usuário';
  const userInitials = userName.substring(0, 2).toUpperCase();

  // Helper to determine if a link is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            )}
            
            {!showBackButton && (
               <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => navigate("/dashboard")}>
                 <div className="relative group flex-shrink-0">
                   <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-border">
                     <AvatarImage src={user.avatar} alt={userName} className="object-cover" />
                     <AvatarFallback>{userInitials}</AvatarFallback>
                   </Avatar>
                 </div>
                 <div className="flex flex-col min-w-0">
                   <h1 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[110px] sm:max-w-[200px]" title={userName}>
                     {userName}
                   </h1>
                   <p className="text-[10px] sm:text-xs text-muted-foreground font-medium capitalize truncate max-w-[110px] sm:max-w-[200px]">
                     {roleDisplay.toLowerCase()}
                   </p>
                 </div>
               </div>
            )}

            {showBackButton && (
                <div>
                   <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
                   {subtitle && <p className="text-sm text-muted-foreground hidden md:block">{subtitle}</p>}
                </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] flex flex-col">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle>Menu de Acesso</SheetTitle>
                </SheetHeader>
                
                {/* Profile Section in Menu */}
                <div className="flex flex-col items-center justify-center mb-8 relative group">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-muted">
                      <AvatarImage src={user.avatar} alt={userName} />
                      <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md"
                      onClick={() => navigate("/meu-perfil")}
                      title="Editar Perfil"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center mt-3">
                    <h2 className="font-bold text-lg">{userName}</h2>
                    <p className="text-sm text-muted-foreground capitalize">{roleDisplay.toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                  </div>
                </div>

                <Separator className="mb-4" />

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2">
                  <SheetClose asChild>
                    <Button 
                      variant={isActive("/dashboard") ? "secondary" : "ghost"} 
                      className="w-full justify-start" 
                      onClick={() => navigate("/dashboard")}
                    >
                      <Home className="mr-3 h-4 w-4" /> Dashboard
                    </Button>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button 
                      variant={isActive("/meu-perfil") ? "secondary" : "ghost"} 
                      className="w-full justify-start" 
                      onClick={() => navigate("/meu-perfil")}
                    >
                      <UserIcon className="mr-3 h-4 w-4" /> Meu Perfil
                    </Button>
                  </SheetClose>

                  {features.management && user.role === 'ADMIN_SISTEMA' && (
                    <SheetClose asChild>
                      <Button 
                        variant={isActive("/listagem-empresas") ? "secondary" : "ghost"} 
                        className="w-full justify-start" 
                        onClick={() => navigate("/listagem-empresas")}
                      >
                        <Building className="mr-3 h-4 w-4" /> Empresas
                      </Button>
                    </SheetClose>
                  )}

                  {features.management && ['ADMIN_SISTEMA', 'ADMIN_EMPRESA', 'ADMIN_SETOR'].includes(user.role) && (
                    <SheetClose asChild>
                      <Button 
                        variant={isActive("/listagem-usuarios") ? "secondary" : "ghost"} 
                        className="w-full justify-start" 
                        onClick={() => navigate("/listagem-usuarios")}
                      >
                        <Users className="mr-3 h-4 w-4" /> Usuários
                      </Button>
                    </SheetClose>
                  )}

                  {features.management && ['ADMIN_SISTEMA', 'ADMIN_EMPRESA'].includes(user.role) && (
                    <SheetClose asChild>
                      <Button 
                        variant={isActive("/editor-contrato") ? "secondary" : "ghost"} 
                        className="w-full justify-start" 
                        onClick={() => navigate("/editor-contrato")}
                      >
                        <FileText className="mr-3 h-4 w-4" /> Contratos
                      </Button>
                    </SheetClose>
                  )}
                </nav>

                <Separator className="my-4" />

                <SheetClose asChild>
                  <Button variant="destructive" className="w-full justify-start" onClick={logout}>
                    <LogOut className="mr-3 h-4 w-4" /> Sair do Sistema
                  </Button>
                </SheetClose>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
