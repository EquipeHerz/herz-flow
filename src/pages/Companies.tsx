import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, FileSpreadsheet, FileText, Building2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Companies = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateClick = () => {
    navigate("/registro-empresa");
  };

  const handleEditClick = () => {
    toast({
      title: "Edição não disponível",
      description: "A edição via API ainda não foi implementada nesta tela.",
    });
  };

  const handleDeleteClick = () => {
    toast({
      title: "Ação não disponível",
      description: "Ainda não há endpoint de desativação/exclusão de empresa na API.",
    });
  };

  const exportToExcel = () => {
    if (companies.length === 0) {
      toast({ title: "Nada para exportar", description: "A listagem via API ainda não está disponível." });
      return;
    }
    const ws = XLSX.utils.json_to_sheet(companies.map(c => ({
      'Razão Social': c.legalName,
      'Nome Fantasia': c.tradeName,
      'CNPJ': c.cnpj,
      'Cidade': c.city,
      'Estado': c.state,
      'Responsável': c.responsibleName,
      'Status': c.status === 'active' ? 'Ativo' : 'Inativo'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empresas");
    XLSX.writeFile(wb, "empresas.xlsx");
  };

  const exportToPDF = () => {
    if (companies.length === 0) {
      toast({ title: "Nada para exportar", description: "A listagem via API ainda não está disponível." });
      return;
    }
    const doc = new jsPDF();
    doc.text("Listagem de Empresas", 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Nome Fantasia', 'CNPJ', 'Cidade/UF', 'Responsável', 'Status']],
      body: companies.map(c => [
        c.tradeName,
        c.cnpj,
        `${c.city}/${c.state}`,
        c.responsibleName,
        c.status === 'active' ? 'Ativo' : 'Inativo'
      ]),
    });

    doc.save("empresas.pdf");
  };

  const filteredCompanies = companies.filter(company => {
    if (currentUser?.role === 'ADMIN_EMPRESA' && currentUser.companyId && company.id !== currentUser.companyId) {
      return false;
    }

    return (
      company.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      company.cnpj.includes(searchTerm) ||
      company.legalName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Listagem de Empresas" subtitle="Gerencie as empresas cadastradas no sistema" />

      <main className="flex-1 flex justify-center p-6 md:p-10">
        <div className="w-full max-w-6xl space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 w-full sm:w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nome ou CNPJ..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="!pl-10"
                  />
                </div>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={exportToExcel} title="Exportar Excel">
                 <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
               </Button>
               <Button variant="outline" onClick={exportToPDF} title="Exportar PDF">
                 <FileText className="h-4 w-4 mr-2" /> PDF
               </Button>
               <Button onClick={handleCreateClick}>
                 <Plus className="mr-2 h-4 w-4" /> Nova Empresa
               </Button>
             </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Empresas Cadastradas</CardTitle>
              <CardDescription>Gerencie as empresas cadastradas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome Fantasia</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Cidade/UF</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id} className={company.status === 'inactive' ? 'opacity-60 bg-muted/30' : ''}>
                        <TableCell className="font-medium">{company.tradeName}</TableCell>
                        <TableCell>{company.cnpj}</TableCell>
                        <TableCell>{company.city}/{company.state}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{company.responsibleName}</span>
                            <span className="text-xs text-muted-foreground">{company.responsibleEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.status === 'active' ? 'outline' : 'secondary'} className={company.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                            {company.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={handleEditClick} title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={handleDeleteClick} 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Desativar/Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Nenhuma empresa encontrada.
                        </TableCell>
                      </TableRow>
                    )}
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

export default Companies;
