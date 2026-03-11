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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { UserRole } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, UserX } from 'lucide-react';
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
  FormDescription,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

// Mock data
const INITIAL_USERS = [
  { 
    id: '1', 
    name: 'Admin Sistema', 
    email: 'admin@sistema.com', 
    role: 'ADMIN_SISTEMA', 
    status: 'active', 
    company: 'Herz',
    username: 'admin',
    corporateEmail: 'admin@herz.com.br',
    phone: '(11) 99999-9999',
    position: 'Administrador Geral',
    department: 'TI',
    admissionDate: '2023-01-01',
    cpf: '000.000.000-00',
    birthDate: '1990-01-01',
    address: {
      zipCode: '00000-000',
      street: 'Rua Principal',
      number: '100',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP'
    },
    bio: 'Administrador do sistema Herz Flow.'
  },
  { 
    id: '2', 
    name: 'Admin Empresa', 
    email: 'admin@empresa.com', 
    role: 'ADMIN_EMPRESA', 
    status: 'active', 
    company: 'Tech Solutions',
    username: 'admin_empresa',
    corporateEmail: 'admin@tech.com.br',
    phone: '(11) 98888-8888',
    position: 'Gerente',
    department: 'Gestão',
    admissionDate: '2023-05-15',
    cpf: '111.111.111-11',
    birthDate: '1985-06-20',
    address: {
      zipCode: '11111-111',
      street: 'Av. Comercial',
      number: '200',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    },
    bio: 'Gerente da Tech Solutions.'
  },
  { 
    id: '3', 
    name: 'Admin Setor', 
    email: 'admin@setor.com', 
    role: 'ADMIN_SETOR', 
    status: 'active', 
    company: 'Tech Solutions',
    username: 'admin_setor',
    corporateEmail: 'setor@tech.com.br',
    phone: '(11) 97777-7777',
    position: 'Coordenador',
    department: 'Vendas',
    admissionDate: '2023-08-10',
    cpf: '222.222.222-22',
    birthDate: '1992-03-15',
    address: {
      zipCode: '22222-222',
      street: 'Rua das Vendas',
      number: '300',
      neighborhood: 'Comércio',
      city: 'São Paulo',
      state: 'SP'
    },
    bio: 'Coordenador de Vendas.'
  },
  { 
    id: '4', 
    name: 'Operador', 
    email: 'operador@empresa.com', 
    role: 'OPERADOR', 
    status: 'active', // Restored as requested
    company: 'Tech Solutions',
    username: 'operador',
    corporateEmail: 'operador@tech.com.br',
    phone: '(11) 96666-6666',
    position: 'Atendente',
    department: 'Suporte',
    admissionDate: '2023-11-20',
    cpf: '333.333.333-33',
    birthDate: '1995-12-10',
    address: {
      zipCode: '33333-333',
      street: 'Rua do Suporte',
      number: '400',
      neighborhood: 'Atendimento',
      city: 'São Paulo',
      state: 'SP'
    },
    bio: 'Atendente de suporte nível 1.'
  },
];

const userSchema = z.object({
  // Dados Pessoais
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  birthDate: z.string().min(1, 'Data de nascimento obrigatória'),
  cpf: z.string().min(11, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  
  // Dados Corporativos
  corporateEmail: z.string().email('E-mail corporativo inválido'),
  position: z.string().min(2, 'Cargo obrigatório'),
  department: z.string().min(2, 'Departamento obrigatório'),
  admissionDate: z.string().min(1, 'Data de admissão obrigatória'),
  role: z.enum(['ADMIN_SISTEMA', 'ADMIN_EMPRESA', 'ADMIN_SETOR', 'OPERADOR']),
  status: z.enum(['active', 'inactive']),

  // Endereço
  address: z.object({
    zipCode: z.string().min(8, 'CEP inválido'),
    street: z.string().min(3, 'Rua obrigatória'),
    number: z.string().min(1, 'Número obrigatório'),
    neighborhood: z.string().min(2, 'Bairro obrigatório'),
    city: z.string().min(2, 'Cidade obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 letras'),
  }),

  // Acesso
  username: z.string().min(3, 'Nome de usuário deve ter no mínimo 3 caracteres'),
  password: z.string().optional().or(z.literal('')), // Optional for edit
  confirmPassword: z.string().optional().or(z.literal('')),
  
  // Extra
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userSchema>;

const UserList = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      birthDate: '',
      cpf: '',
      phone: '',
      corporateEmail: '',
      position: '',
      department: '',
      admissionDate: '',
      role: 'OPERADOR',
      status: 'active',
      address: {
        zipCode: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      username: '',
      password: '',
      confirmPassword: '',
      bio: '',
    },
  });

  // Permission check helper
  const canEdit = (targetUser: any) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN_SISTEMA') return true;
    if (currentUser.role === 'ADMIN_EMPRESA' && targetUser.role !== 'ADMIN_SISTEMA') return true;
    if (currentUser.role === 'ADMIN_SETOR' && targetUser.role === 'OPERADOR') return true;
    return false;
  };

  const canDelete = (targetUser: any) => {
    if (!currentUser) return false;
    // System Admin can delete anyone
    if (currentUser.role === 'ADMIN_SISTEMA') return true;
    
    // Company Admin cannot delete other Company Admins or System Admins
    if (currentUser.role === 'ADMIN_EMPRESA') {
      return targetUser.role !== 'ADMIN_SISTEMA' && targetUser.role !== 'ADMIN_EMPRESA';
    }
    
    // Sector Admin cannot delete (or just operators?) - Prompt implies stricter control.
    // Assuming they can delete Operators if they can edit them.
    if (currentUser.role === 'ADMIN_SETOR') {
       return targetUser.role === 'OPERADOR';
    }
    
    return false;
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    form.reset({
      name: user.name,
      birthDate: user.birthDate,
      cpf: user.cpf,
      phone: user.phone,
      corporateEmail: user.corporateEmail,
      position: user.position,
      department: user.department,
      admissionDate: user.admissionDate,
      role: user.role as any,
      status: user.status as any,
      address: {
        zipCode: user.address.zipCode,
        street: user.address.street,
        number: user.address.number,
        neighborhood: user.address.neighborhood,
        city: user.address.city,
        state: user.address.state,
      },
      username: user.username,
      password: '',
      confirmPassword: '',
      bio: user.bio,
    });
    setIsEditOpen(true);
  };

  const onEditSubmit = async (data: UserFormValues) => {
    // Update local state
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data, id: u.id, email: u.email, company: u.company } : u));
    
    toast({
      title: 'Usuário atualizado',
      description: `Os dados de ${data.name} foram salvos com sucesso.`,
    });
    setIsEditOpen(false);
    setEditingUser(null);
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.map(u => u.id === userToDelete ? { ...u, status: 'inactive' } : u));
      toast({
        title: 'Usuário desativado',
        description: 'O acesso do usuário foi revogado com sucesso.',
      });
      setIsDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user => {
    // Security: Hide System Admin from non-System Admins
    if (currentUser?.role !== 'ADMIN_SISTEMA' && user.role === 'ADMIN_SISTEMA') {
      return false;
    }

    // Security: Hide users from other companies
    if (currentUser?.role !== 'ADMIN_SISTEMA' && currentUser?.company && user.company !== currentUser.company) {
      return false;
    }

    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Listagem de Usuários" subtitle="Gerencie os usuários e permissões do sistema" />

      <main className="flex-1 flex justify-center p-6 md:p-10">
        <div className="w-full max-w-6xl space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <Input 
                  placeholder="Buscar por nome ou email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="ADMIN_SISTEMA">Admin Sistema</SelectItem>
                    <SelectItem value="ADMIN_EMPRESA">Admin Empresa</SelectItem>
                    <SelectItem value="ADMIN_SETOR">Admin Setor</SelectItem>
                    <SelectItem value="OPERADOR">Operador</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <Button onClick={() => navigate('/registro-usuario')}>
               <Plus className="mr-2 h-4 w-4" /> Novo Usuário
             </Button>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>Total de {filteredUsers.length} usuários encontrados</CardDescription>
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className={user.status === 'inactive' ? 'opacity-60 bg-muted/30' : ''}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'ADMIN_SISTEMA' ? 'destructive' :
                            user.role === 'ADMIN_EMPRESA' ? 'default' :
                            user.role === 'ADMIN_SETOR' ? 'secondary' : 'outline'
                          }>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.company}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'outline' : 'secondary'} className={user.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit(user) && (
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)} title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete(user) && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteClick(user.id)} 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Desativar/Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Nenhum usuário encontrado.
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

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6 py-4">
             <Form {...form}>
               <form id="edit-user-form" onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
                  {/* Reuse form fields from RegisterUser - Simplified for brevity but fully functional */}
                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Dados Pessoais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Nome Completo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="cpf" render={({ field }) => (
                          <FormItem><FormLabel>CPF *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                          <FormItem><FormLabel>Data de Nascimento *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel>Telefone *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="address.zipCode" render={({ field }) => (
                          <FormItem><FormLabel>CEP *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                          <FormItem><FormLabel>UF *</FormLabel><FormControl><Input maxLength={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Dados Corporativos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="corporateEmail" render={({ field }) => (
                          <FormItem><FormLabel>E-mail Corporativo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="admissionDate" render={({ field }) => (
                          <FormItem><FormLabel>Data de Admissão *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="position" render={({ field }) => (
                          <FormItem><FormLabel>Cargo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="department" render={({ field }) => (
                          <FormItem><FormLabel>Departamento *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="role" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nível de Acesso *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {currentUser?.role === 'ADMIN_SISTEMA' && (
                                  <SelectItem value="ADMIN_SISTEMA">Admin Sistema</SelectItem>
                                )}
                                {(currentUser?.role === 'ADMIN_SISTEMA' || currentUser?.role === 'ADMIN_EMPRESA') && (
                                  <>
                                    <SelectItem value="ADMIN_EMPRESA">Admin Empresa</SelectItem>
                                    <SelectItem value="ADMIN_SETOR">Admin Setor</SelectItem>
                                  </>
                                )}
                                <SelectItem value="OPERADOR">Operador</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="status" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="inactive">Inativo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Acesso & Bio</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="username" render={({ field }) => (
                          <FormItem><FormLabel>Usuário *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                          <FormItem><FormLabel>Nova Senha</FormLabel><FormControl><Input type="password" placeholder="Opcional" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                          <FormItem><FormLabel>Confirmar Senha</FormLabel><FormControl><Input type="password" placeholder="Opcional" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl><Textarea className="resize-none h-20" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>
               </form>
             </Form>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button type="submit" form="edit-user-form">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <UserX className="h-5 w-5" /> Confirmar Desativação
            </DialogTitle>
            <DialogDescription className="pt-2">
              Você tem certeza que deseja desativar este usuário?
              <br /><br />
              <strong>O que acontece:</strong>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>O usuário perderá o acesso ao sistema imediatamente.</li>
                <li>O status será alterado para <strong>Inativo</strong>.</li>
                <li>O histórico de dados e relatórios será <strong>mantido</strong>.</li>
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

export default UserList;
