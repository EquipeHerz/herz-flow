import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  Eye, 
  Edit, 
  ArrowLeft, 
  Save, 
  Trash2 
} from 'lucide-react';
import { format } from 'date-fns';

// Mock Data
const COMPANIES = [
  { id: '1', name: 'Herz Flow Tecnologia', cnpj: '12.345.678/0001-90', address: 'Av. Paulista, 1000' },
  { id: '2', name: 'Tech Solutions', cnpj: '98.765.432/0001-10', address: 'Rua Funchal, 500' },
  { id: '3', name: 'Hotel Imperial', cnpj: '45.678.901/0001-23', address: 'Estrada da Serra, 789' },
];

const INITIAL_CONTRACTS = [
  {
    id: '1',
    companyId: '2',
    companyName: 'Tech Solutions',
    title: 'Contrato de Prestação de Serviços - Manutenção',
    content: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\nCONTRATANTE: Tech Solutions, inscrita no CNPJ sob nº 12.345.678/0001-90, com sede em Rua da Inovação, 123.\n\nCONTRATADA: HERZ FLOW TECNOLOGIA LTDA...\n\nCLÁUSULA 1 - DO OBJETO\nO presente contrato tem como objeto a prestação de serviços de manutenção de software...\n\nValor: R$ 1.500,00 mensais.\nData: 24/02/2025',
    status: 'active',
    createdAt: '2024-01-15',
    value: '1500.00'
  },
  {
    id: '2',
    companyId: '3', // Assuming '3' is Hotel Imperial or similar
    companyName: 'Hotel Imperial',
    title: 'Termo de Adesão - Plano Enterprise',
    content: 'TERMO DE ADESÃO\n\nPelo presente instrumento, a empresa Hotel Imperial adere ao Plano Enterprise...\n\nValor: R$ 3.000,00 mensais.\nData: 10/02/2024',
    status: 'active',
    createdAt: '2024-02-10',
    value: '3000.00'
  }
];

const ContractEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'form' | 'view'>('list');
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    companyId: '',
    title: '',
    content: '',
    status: 'active',
    value: ''
  });

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Contrato_${formData.title || 'Herz'}`,
  });

  const isAdmin = user?.role === 'ADMIN_SISTEMA';

  // Actions
  const handleCreateNew = () => {
    let defaultCompanyId = '';
    
    // Auto-select company for non-System Admins
    if (user?.role !== 'ADMIN_SISTEMA' && user?.companyId) {
       defaultCompanyId = user.companyId;
    }

    setFormData({
      id: '',
      companyId: defaultCompanyId,
      title: '',
      content: '',
      status: 'active',
      value: ''
    });
    setView('form');
  };

  const handleEdit = (contract: any) => {
    setFormData({ ...contract });
    setView('form');
  };

  const handleView = (contract: any) => {
    setFormData({ ...contract });
    setView('view');
  };

  const handleSave = () => {
    if (!formData.companyId || !formData.title || !formData.content) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha Empresa, Título e Conteúdo.',
        variant: 'destructive',
      });
      return;
    }

    const company = COMPANIES.find(c => c.id === formData.companyId);
    
    const newContract = {
      ...formData,
      companyName: company?.name || 'Empresa Desconhecida',
      id: formData.id || Math.random().toString(36).substr(2, 9),
      createdAt: formData.id ? undefined : new Date().toISOString().split('T')[0], // Keep original date if editing
    };

    if (formData.id) {
      setContracts(contracts.map(c => c.id === formData.id ? { ...c, ...newContract } : c));
      toast({ title: 'Contrato atualizado com sucesso!' });
    } else {
      setContracts([...contracts, { ...newContract, createdAt: new Date().toISOString().split('T')[0] }]);
      toast({ title: 'Contrato criado com sucesso!' });
    }
    setView('list');
  };

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + variable
    }));
  };

  const filteredContracts = contracts.filter(c => {
    // Security: Isolate contracts by company
    if (user?.role !== 'ADMIN_SISTEMA' && user?.companyId && c.companyId !== user.companyId) {
       return false;
    }

    return c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Render Content
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        showBackButton={true}
        title={view === 'list' ? "Gestão de Contratos" : view === 'form' ? "Editor de Contrato" : "Visualização de Contrato"}
        subtitle={view === 'list' ? "Gerencie os contratos das empresas parceiras" : undefined}
      />

      <main className="flex-1 p-6 md:p-10 flex justify-center">
        <div className="w-full max-w-6xl">
          
          {/* LIST VIEW */}
          {view === 'list' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 w-full sm:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por empresa ou título..."
                      className="!pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                {isAdmin && (
                  <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Contrato
                  </Button>
                )}
              </div>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">Contratos</CardTitle>
                    <CardDescription>
                      {filteredContracts.length} contratos encontrados
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Título do Contrato</TableHead>
                        <TableHead>Data Criação</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.companyName}</TableCell>
                          <TableCell>{contract.title}</TableCell>
                          <TableCell>{contract.createdAt ? format(new Date(contract.createdAt), 'dd/MM/yyyy') : '-'}</TableCell>
                          <TableCell>
                             {contract.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(contract.value)) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                              {contract.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleView(contract)} title="Visualizar">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {isAdmin && (
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(contract)} title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredContracts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Nenhum contrato encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* FORM VIEW (CREATE/EDIT) */}
          {view === 'form' && (
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader className="bg-muted/10 border-b pb-6">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setView('list')} className="md:hidden">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle>{formData.id ? 'Editar Contrato' : 'Novo Contrato'}</CardTitle>
                    <CardDescription>Preencha os dados e o conteúdo do contrato.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Empresa Contratante *</label>
                    <Select 
                      value={formData.companyId} 
                      onValueChange={(val) => setFormData({...formData, companyId: val})}
                      disabled={user?.role !== 'ADMIN_SISTEMA'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANIES.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} - {company.cnpj}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(val) => setFormData({...formData, status: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Título do Contrato *</label>
                    <Input 
                      placeholder="Ex: Contrato de Prestação de Serviços - 2024" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor do Contrato (R$)</label>
                    <Input 
                      type="number"
                      placeholder="0.00" 
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium">Cláusulas e Conteúdo *</label>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <span className="text-xs text-muted-foreground mr-1 self-center hidden sm:inline">Inserir variável:</span>
                      <Button variant="outline" size="xs" onClick={() => insertVariable('${nome_empresa}')} className="h-7 text-xs">Empresa</Button>
                      <Button variant="outline" size="xs" onClick={() => insertVariable('${cnpj}')} className="h-7 text-xs">CNPJ</Button>
                      <Button variant="outline" size="xs" onClick={() => insertVariable('${endereco}')} className="h-7 text-xs">Endereço</Button>
                      <Button variant="outline" size="xs" onClick={() => insertVariable('${data_atual}')} className="h-7 text-xs">Data</Button>
                      <Button variant="outline" size="xs" onClick={() => insertVariable('${valor}')} className="h-7 text-xs">Valor</Button>
                    </div>
                  </div>
                  <Textarea 
                    placeholder="Cole ou digite o texto do contrato aqui..." 
                    className="min-h-[400px] font-mono text-sm leading-relaxed p-4"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setView('list')}>Cancelar</Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Salvar Contrato
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PRINT / VIEW MODE */}
          {view === 'view' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm print:hidden">
                <Button variant="outline" onClick={() => setView('list')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <div className="flex gap-2">
                   {isAdmin && (
                    <Button variant="outline" onClick={() => handleEdit(formData)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                  )}
                  <Button onClick={() => handlePrint && handlePrint()}>
                    <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
                  </Button>
                </div>
              </div>

              {/* Printable Area */}
              <div className="flex justify-center">
                <div 
                  ref={componentRef} 
                  className="bg-white text-black p-[20mm] w-[210mm] min-h-[297mm] shadow-lg relative print:shadow-none print:w-full print:p-0"
                >
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none overflow-hidden z-0">
                    <div className="transform -rotate-45 text-6xl font-black text-gray-900 whitespace-nowrap">
                      HERZ FLOW • HERZ FLOW • HERZ FLOW
                    </div>
                  </div>
                  
                  {/* Header Logo */}
                  <div className="flex justify-between items-start mb-12 border-b pb-6 z-10 relative">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-bold uppercase tracking-wide">Contrato de Serviço</h1>
                      <p className="text-sm text-gray-500">Documento Oficial #{formData.id || 'NOVO'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">H</div>
                      <span className="font-bold text-lg">Herz Flow</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose max-w-none text-justify text-sm leading-relaxed z-10 relative whitespace-pre-wrap font-serif">
                    {formData.content}
                  </div>

                  {/* Signatures */}
                  <div className="mt-24 grid grid-cols-2 gap-12 z-10 relative">
                    <div className="text-center space-y-2">
                      <div className="border-b border-black w-full h-px mb-4"></div>
                      <p className="font-bold">Herz Flow Tecnologia</p>
                      <p className="text-xs text-gray-500">CONTRATADA</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="border-b border-black w-full h-px mb-4"></div>
                      <p className="font-bold">{formData.companyName || 'Empresa Cliente'}</p>
                      <p className="text-xs text-gray-500">CONTRATANTE</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-400 print:bottom-4">
                    <p>Gerado eletronicamente pela plataforma Herz Flow em {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ContractEditor;
