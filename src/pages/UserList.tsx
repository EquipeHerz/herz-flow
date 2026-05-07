import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canCreateUsers } from "@/permissions";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const UserList = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((u) => {
    if (currentUser?.role !== "ADMIN_SISTEMA" && u.role === "ADMIN_SISTEMA") return false;

    if (currentUser?.role !== "ADMIN_SISTEMA") {
      if (u.id === currentUser?.id) return true;

      const myCompanyId = currentUser?.companyId;
      const uCompanyId = u.companyId;
      if (myCompanyId && uCompanyId && myCompanyId === uCompanyId) return true;

      const myCnpj = currentUser?.cnpj ? onlyDigits(currentUser.cnpj) : "";
      const uCnpj = u.cnpj ? onlyDigits(u.cnpj) : "";
      if (myCnpj && uCnpj && myCnpj === uCnpj) return true;

      return false;
    }

    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Listagem de Usuários" subtitle="Gerencie os usuários e permissões do sistema" />

      <main className="flex-1 flex justify-center p-6 md:p-10">
        <div className="w-full max-w-6xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="ADMIN_SISTEMA">Admin Sistema</SelectItem>
                  <SelectItem value="ADMIN_EMPRESA">Admin Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canCreateUsers(currentUser) && (
              <Button onClick={() => navigate("/registro-usuario")}>
                <Plus className="mr-2 h-4 w-4" /> Novo Usuário
              </Button>
            )}
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>Gerencie os usuários e permissões do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserList;
