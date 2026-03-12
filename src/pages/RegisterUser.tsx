import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useAuth } from '@/contexts/AuthContext';
const userSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  birthDate: z.string().min(1, 'Data de nascimento obrigatória'),
  cpf: z.string().min(11, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  
  // Dados Corporativos
  corporateEmail: z.string().email('E-mail corporativo inválido'),
  position: z.string().min(2, 'Cargo obrigatório'),
  department: z.string().min(2, 'Departamento obrigatório'),
  admissionDate: z.string().min(1, 'Data de admissão obrigatória'),
  role: z.enum(['ADMIN_SISTEMA', 'ADMIN_EMPRESA', 'ADMIN_SETOR', 'FUNCIONARIO_SETOR', 'OPERADOR']),
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
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
  
  // Extra
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userSchema>;

const RegisterUser = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, createUser } = useAuth();

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

  const onSubmit = async (data: UserFormValues) => {
    try {
      await createUser({
        name: data.name,
        email: data.corporateEmail, // Use corporate email as login email
        password: data.password,
        phone: data.phone,
        document: data.cpf,
        role: data.role,
        // Extended fields
        username: data.username,
        corporateEmail: data.corporateEmail,
        position: data.position,
        department: data.department,
        admissionDate: data.admissionDate,
        birthDate: data.birthDate,
        address: data.address,
        bio: data.bio,
        status: data.status,
      });

      toast({
        title: 'Usuário cadastrado',
        description: `O usuário ${data.name} foi criado com sucesso.`,
      });
      
      navigate('/listagem-usuarios');
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao criar o usuário.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Cadastro de Usuário" subtitle="Preencha os dados para criar um novo usuário" />
      
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardHeader className="text-center border-b bg-gradient-to-br from-hero-start to-hero-end pb-8">
            <div className="flex flex-col items-center gap-4">
              <div>
                <CardTitle className="text-2xl">Novo Usuário</CardTitle>
                <CardDescription className="text-base font-medium text-primary mt-1">
                  Informe os dados completos para o cadastro
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-350px)] max-h-[800px]">
              <div className="p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    {/* Dados Pessoais */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Dados Pessoais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="cpf" render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF *</FormLabel>
                            <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento *</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone (com DDD) *</FormLabel>
                            <FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Endereço Completo</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="address.zipCode" render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP *</FormLabel>
                            <FormControl><Input placeholder="00000-000" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="address.street" render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Rua *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <FormField control={form.control} name="address.number" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="address.neighborhood" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="address.city" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="address.state" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado (UF) *</FormLabel>
                            <FormControl><Input maxLength={2} placeholder="SP" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Dados Corporativos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Dados Corporativos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="corporateEmail" render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail Corporativo *</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="admissionDate" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Admissão *</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="position" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo / Função *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="department" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamento *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="role" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nível de Acesso *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {user?.role === 'ADMIN_SISTEMA' && (
                                  <SelectItem value="ADMIN_SISTEMA">Admin Sistema</SelectItem>
                                )}
                                {(user?.role === 'ADMIN_SISTEMA' || user?.role === 'ADMIN_EMPRESA') && (
                                  <>
                                    <SelectItem value="ADMIN_EMPRESA">Admin Empresa</SelectItem>
                                    <SelectItem value="ADMIN_SETOR">Admin Setor</SelectItem>
                                    <SelectItem value="FUNCIONARIO_SETOR">Funcionário Setor</SelectItem>
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
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
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

                    {/* Acesso e Bio */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Configurações de Acesso & Bio</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="username" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de Usuário *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha *</FormLabel>
                            <FormControl><Input type="password" placeholder="Mínimo 8 caracteres" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Senha *</FormLabel>
                            <FormControl><Input type="password" placeholder="Repita a senha" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resumo Profissional (Bio)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Fale um pouco sobre as responsabilidades..." 
                              className="resize-none h-24" 
                              maxLength={500}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-right">
                            {field.value?.length || 0}/500 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => navigate('/listagem-usuarios')}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="min-w-[150px]">
                        Cadastrar Usuário
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RegisterUser;
