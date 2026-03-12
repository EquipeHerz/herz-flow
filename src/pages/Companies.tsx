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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, FileSpreadsheet, FileText, Building2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mock data
const INITIAL_COMPANIES = [
  { 
    id: '1', 
    legalName: 'Herz Flow Tecnologia Ltda', 
    tradeName: 'Herz Flow', 
    cnpj: '12.345.678/0001-90',
    stateRegistration: '123456789',
    email: 'contato@herz.com.br',
    phone: '(11) 99999-9999',
    website: 'https://herz.com.br',
    address: {
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100'
    },
    responsibleName: 'João Silva',
    responsibleEmail: 'joao@herz.com.br',
    responsiblePhone: '(11) 98888-8888',
    status: 'active'
  },
  { 
    id: '2', 
    legalName: 'Tech Solutions S.A.', 
    tradeName: 'Tech Solutions', 
    cnpj: '98.765.432/0001-10',
    stateRegistration: '',
    email: 'contato@techsolutions.com.br',
    phone: '(11) 3333-3333',
    website: '',
    address: {
      street: 'Rua Funchal',
      number: '500',
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04551-060'
    },
    responsibleName: 'Maria Oliveira',
    responsibleEmail: 'maria@techsolutions.com.br',
    responsiblePhone: '(11) 97777-7777',
    status: 'active'
  },
  { 
    id: '3', 
    legalName: 'Inova Systems Ltda', 
    tradeName: 'Inova Systems', 
    cnpj: '45.678.901/0001-23',
    stateRegistration: '',
    email: 'contato@inovasystems.com.br',
    phone: '(21) 2222-2222',
    website: '',
    address: {
      street: 'Av. Rio Branco',
      number: '100',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20040-001'
    },
    responsibleName: 'Carlos Santos',
    responsibleEmail: 'carlos@inovasystems.com.br',
    responsiblePhone: '(21) 96666-6666',
    status: 'inactive'
  }
];

const companySchema = z.object({
  legalName: z.string().min(3, 'Razão Social obrigatória'),
  tradeName: z.string().min(3, 'Nome Fantasia obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  stateRegistration: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  website: z.string().optional(),
  responsibleName: z.string().min(3, 'Nome do responsável obrigatório'),
  responsibleEmail: z.string().email('E-mail do responsável inválido'),
  responsiblePhone: z.string().min(10, 'Telefone do responsável inválido'),
  address: z.object({
    zipCode: z.string().min(8, 'CEP inválido'),
    street: z.string().min(3, 'Rua obrigatória'),
    number: z.string().min(1, 'Número obrigatório'),
    neighborhood: z.string().min(2, 'Bairro obrigatório'),
    city: z.string().min(2, 'Cidade obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 letras'),
  }),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const Companies = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State (Create/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      legalName: '',
      tradeName: '',
      cnpj: '',
      stateRegistration: '',
      email: '',
      phone: '',
      website: '',
      responsibleName: '',
      responsibleEmail: '',
      responsiblePhone: '',
      address: {
        zipCode: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    },
  });

  const handleCreateClick = () => {
    setEditingCompany(null);
    form.reset({
      legalName: '',
      tradeName: '',
      cnpj: '',
      stateRegistration: '',
      email: '',
      phone: '',
      website: '',
      responsibleName: '',
      responsibleEmail: '',
      responsiblePhone: '',
      address: {
        zipCode: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (company: any) => {
    setEditingCompany(company);
    form.reset({
      legalName: company.legalName,
      tradeName: company.tradeName,
      cnpj: company.cnpj,
      stateRegistration: company.stateRegistration || '',
      email: company.email,
      phone: company.phone,
      website: company.website || '',
      responsibleName: company.responsibleName,
      responsibleEmail: company.responsibleEmail,
      responsiblePhone: company.responsiblePhone,
      address: {
        zipCode: company.address.zipCode,
        street: company.address.street,
        number: company.address.number,
        neighborhood: company.address.neighborhood,
        city: company.address.city,
        state: company.address.state,
      },
    });
    setIsModalOpen(true);
  };

  const onFormSubmit = async (data: CompanyFormValues) => {
    if (editingCompany) {
        // Edit
        setCompanies(companies.map(c => c.id === editingCompany.id ? { ...c, ...data } : c));
        toast({
            title: 'Empresa atualizada',
            description: `Os dados de ${data.tradeName} foram salvos com sucesso.`,
        });
    } else {
        // Create
        const newCompany = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            status: 'active'
        };
        setCompanies([...companies, newCompany]);
        toast({
            title: 'Empresa cadastrada',
            description: `A empresa ${data.tradeName} foi registrada com sucesso.`,
        });
    }
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleDeleteClick = (id: string) => {
    setCompanyToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      setCompanies(companies.map(c => c.id === companyToDelete ? { ...c, status: 'inactive' } : c));
      toast({
        title: 'Empresa desativada',
        description: 'A empresa foi desativada com sucesso.',
      });
      setIsDeleteOpen(false);
      setCompanyToDelete(null);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(companies.map(c => ({
      'Razão Social': c.legalName,
      'Nome Fantasia': c.tradeName,
      'CNPJ': c.cnpj,
      'Email': c.email,
      'Telefone': c.phone,
      'Cidade': c.address.city,
      'Estado': c.address.state,
      'Responsável': c.responsibleName,
      'Status': c.status === 'active' ? 'Ativo' : 'Inativo'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empresas");
    XLSX.writeFile(wb, "empresas.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Listagem de Empresas", 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Nome Fantasia', 'CNPJ', 'Cidade/UF', 'Responsável', 'Status']],
      body: companies.map(c => [
        c.tradeName,
        c.cnpj,
        `${c.address.city}/${c.address.state}`,
        c.responsibleName,
        c.status === 'active' ? 'Ativo' : 'Inativo'
      ]),
    });

    doc.save("empresas.pdf");
  };

  const filteredCompanies = companies.filter(company => {
    // Security: Company Admin only sees their own company
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
              <CardDescription>Total de {filteredCompanies.length} empresas encontradas</CardDescription>
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
                        <TableCell>{company.address.city}/{company.address.state}</TableCell>
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
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(company)} title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteClick(company.id)} 
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

      {/* FORM MODAL (CREATE/EDIT) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Atualize as informações da empresa.' : 'Preencha os dados para registrar uma nova empresa.'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6 py-4">
             <Form {...form}>
               <form id="company-form" onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Dados da Empresa</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="legalName" render={({ field }) => (
                          <FormItem><FormLabel>Razão Social *</FormLabel><FormControl><Input placeholder="Razão Social Ltda" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="tradeName" render={({ field }) => (
                          <FormItem><FormLabel>Nome Fantasia *</FormLabel><FormControl><Input placeholder="Nome Comercial" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="cnpj" render={({ field }) => (
                          <FormItem><FormLabel>CNPJ *</FormLabel><FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="stateRegistration" render={({ field }) => (
                          <FormItem><FormLabel>Inscrição Estadual</FormLabel><FormControl><Input placeholder="Isento ou número" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Contato & Responsável</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Email Corporativo *</FormLabel><FormControl><Input type="email" placeholder="contato@empresa.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel>Telefone *</FormLabel><FormControl><Input placeholder="(00) 0000-0000" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="website" render={({ field }) => (
                          <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://www.empresa.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                         <FormField control={form.control} name="responsibleName" render={({ field }) => (
                          <FormItem><FormLabel>Nome do Responsável *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="responsibleEmail" render={({ field }) => (
                          <FormItem><FormLabel>Email do Responsável *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="responsiblePhone" render={({ field }) => (
                          <FormItem><FormLabel>Tel. Responsável *</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="address.zipCode" render={({ field }) => (
                          <FormItem><FormLabel>CEP *</FormLabel><FormControl><Input placeholder="00000-000" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="address.street" render={({ field }) => (
                          <FormItem className="md:col-span-2"><FormLabel>Rua *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <FormField control={form.control} name="address.number" render={({ field }) => (
                          <FormItem><FormLabel>Número *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address.neighborhood" render={({ field }) => (
                          <FormItem><FormLabel>Bairro *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address.city" render={({ field }) => (
                          <FormItem><FormLabel>Cidade *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address.state" render={({ field }) => (
                          <FormItem><FormLabel>UF *</FormLabel><FormControl><Input maxLength={2} placeholder="SP" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                  </div>
               </form>
             </Form>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="company-form">{editingCompany ? 'Salvar Alterações' : 'Cadastrar Empresa'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Building2 className="h-5 w-5" /> Confirmar Desativação
            </DialogTitle>
            <DialogDescription className="pt-2">
              Você tem certeza que deseja desativar esta empresa?
              <br /><br />
              <strong>O que acontece:</strong>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>O acesso de todos os usuários desta empresa será revogado.</li>
                <li>O status será alterado para <strong>Inativo</strong>.</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Confirmar Desativação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Companies;
