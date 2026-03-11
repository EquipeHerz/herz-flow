import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/Header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';

// Avatares pré-definidos (usando ui-avatars e dicebear como placeholders otimizados)
const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Calista',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Dorian',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Eliza',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Fabian',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
];

const profileSchema = z.object({
  // Dados Pessoais
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  birthDate: z.string().min(1, 'Data de nascimento obrigatória'),
  cpf: z.string().min(11, 'CPF inválido'), // Validação simplificada
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
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  
  // Extra
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  avatar: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar || PREDEFINED_AVATARS[0]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      birthDate: user?.birthDate || '',
      cpf: user?.cpf || '',
      phone: user?.phone || '',
      corporateEmail: user?.corporateEmail || user?.email || '',
      position: user?.position || '',
      department: user?.department || '',
      admissionDate: user?.admissionDate || '',
      role: user?.role || 'OPERADOR',
      status: user?.status || 'active',
      address: {
        zipCode: user?.address?.zipCode || '',
        street: user?.address?.street || '',
        number: user?.address?.number || '',
        neighborhood: user?.address?.neighborhood || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
      },
      username: user?.username || '',
      password: '',
      confirmPassword: '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    // Mock update
    console.log("Dados atualizados:", { ...data, avatar: selectedAvatar });
    toast({
      title: 'Perfil atualizado',
      description: 'Seus dados foram atualizados com sucesso.',
    });
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    form.setValue('avatar', avatarUrl);
  };

  if (isLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Meu Perfil" subtitle="Gerencie suas informações pessoais e de acesso" />
      
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardHeader className="text-center border-b bg-gradient-to-br from-hero-start to-hero-end pb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={selectedAvatar} alt="Avatar Preview" />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium">Alterar</span>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="text-base font-medium text-primary mt-1">
                  {form.watch('position') || 'Cargo não definido'} • {form.watch('department') || 'Departamento não definido'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-350px)] max-h-[800px]">
              <div className="p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    {/* Seção de Avatar */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Avatar</h3>
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
                        {PREDEFINED_AVATARS.map((avatar, index) => (
                          <div 
                            key={index}
                            className={`
                              relative cursor-pointer rounded-full p-1 transition-all hover:scale-105
                              ${selectedAvatar === avatar ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-muted-foreground/30'}
                            `}
                            onClick={() => handleAvatarSelect(avatar)}
                          >
                            <img 
                              src={avatar} 
                              alt={`Avatar ${index + 1}`} 
                              className="w-full h-full rounded-full bg-muted"
                            />
                            {selectedAvatar === avatar && (
                              <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

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
                                <SelectItem value="ADMIN_SISTEMA">Admin Sistema</SelectItem>
                                <SelectItem value="ADMIN_EMPRESA">Admin Empresa</SelectItem>
                                <SelectItem value="ADMIN_SETOR">Admin Setor</SelectItem>
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
                            <FormLabel>Nova Senha</FormLabel>
                            <FormControl><Input type="password" placeholder="Deixe em branco para manter" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Senha</FormLabel>
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
                              placeholder="Fale um pouco sobre suas responsabilidades..." 
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
                      <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Descartar Alterações
                      </Button>
                      <Button type="submit" className="min-w-[150px]">
                        Salvar Alterações
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

export default Profile;
