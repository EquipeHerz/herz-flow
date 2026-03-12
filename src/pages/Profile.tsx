import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Briefcase, MapPin, Calendar, Building, Shield, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  address: z.object({
    zipCode: z.string().min(8, 'CEP inválido'),
    street: z.string().min(3, 'Rua obrigatória'),
    number: z.string().min(1, 'Número obrigatório'),
    neighborhood: z.string().min(2, 'Bairro obrigatório'),
    city: z.string().min(2, 'Cidade obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 letras'),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

import FloatingElements from '@/components/FloatingElements';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      bio: '',
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

  const handleEditClick = () => {
    if (user) {
      form.reset({
        name: user.name,
        phone: user.phone,
        bio: user.bio || '',
        address: {
          zipCode: user.address.zipCode,
          street: user.address.street,
          number: user.address.number,
          neighborhood: user.address.neighborhood,
          city: user.address.city,
          state: user.address.state,
        },
      });
      setIsEditOpen(true);
    }
  };

  const onEditSubmit = async (data: ProfileFormValues) => {
    try {
      if (updateUser) {
        await updateUser(data);
        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram salvas com sucesso.',
        });
        setIsEditOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar suas alterações.',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Meu Perfil" subtitle="Visualize e gerencie suas informações pessoais" />

      <main className="flex-1 flex justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl space-y-6">
          
          <Card className="shadow-lg overflow-hidden border-t-4 border-t-primary">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-32 md:h-48 relative overflow-hidden">
              <FloatingElements className="absolute inset-0" />
              {/* Avatar moved to CardHeader for better layout control */}
            </div>
            
            <CardHeader className="px-6 md:px-10 pb-6 pt-0">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="-mt-16 flex-shrink-0">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-4xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mt-2 md:mt-0">
                  <div className="text-center md:text-left space-y-1">
                    <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">{user.name}</CardTitle>
                    <CardDescription className="text-lg font-medium text-primary flex flex-wrap justify-center md:justify-start items-center gap-2">
                      {user.position}
                      <Badge variant="outline" className="capitalize">
                        {user.role.replace('ADMIN_', '').replace('_', ' ')}
                      </Badge>
                    </CardDescription>
                  </div>
                  <Button onClick={handleEditClick} className="flex-shrink-0">
                    <Edit2 className="mr-2 h-4 w-4" /> Editar Perfil
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 md:px-10 pb-10 space-y-8">
              
              {/* Bio Section */}
              {user.bio && (
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                  <p className="text-muted-foreground italic">"{user.bio}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <User className="h-5 w-5 text-primary" /> Informações Pessoais
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Nome Completo</Label>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">CPF</Label>
                      <span className="font-medium">{user.cpf}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Nascimento</Label>
                      <span className="font-medium">
                        {new Date(user.birthDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <Mail className="h-5 w-5 text-primary" /> Contato
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Email Pessoal</Label>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Email Corp.</Label>
                      <span className="font-medium">{user.corporateEmail}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Telefone</Label>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <Briefcase className="h-5 w-5 text-primary" /> Dados Profissionais
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Departamento</Label>
                      <span className="font-medium">{user.department}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Admissão</Label>
                      <span className="font-medium">
                        {new Date(user.admissionDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {user.companyName && (
                      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                        <Label className="text-muted-foreground">Empresa</Label>
                        <span className="font-medium">{user.companyName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <MapPin className="h-5 w-5 text-primary" /> Endereço
                  </h3>
                  
                  <div className="space-y-1">
                    <p className="font-medium">{user.address.street}, {user.address.number}</p>
                    <p className="text-muted-foreground">{user.address.neighborhood}</p>
                    <p className="text-muted-foreground">{user.address.city} - {user.address.state}</p>
                    <p className="text-muted-foreground text-sm">CEP: {user.address.zipCode}</p>
                  </div>
                </div>

              </div>

              <Separator />

              {/* Security / Account */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Segurança da Conta
                </h3>
                <div className="flex items-center gap-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Alterar Senha</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Para sua segurança, recomendamos alterar sua senha periodicamente.</p>
                  </div>
                  <Button variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-200">
                    Redefinir
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      </main>

      {/* EDIT PROFILE MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais. Dados sensíveis devem ser alterados pelo administrador.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[80vh]">
             <Form {...form}>
               <form id="edit-profile-form" onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6 px-1">
                  
                  <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground">Dados Básicos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel>Telefone / Celular</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resumo Profissional</FormLabel>
                          <FormControl><Textarea className="resize-none h-20" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>

                  <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground">Endereço</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="address.zipCode" render={({ field }) => (
                          <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="address.street" render={({ field }) => (
                          <FormItem className="md:col-span-2"><FormLabel>Rua</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <FormField control={form.control} name="address.number" render={({ field }) => (
                          <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address.neighborhood" render={({ field }) => (
                          <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address.city" render={({ field }) => (
                          <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address.state" render={({ field }) => (
                          <FormItem><FormLabel>UF</FormLabel><FormControl><Input maxLength={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                  </div>

               </form>
             </Form>
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button type="submit" form="edit-profile-form">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;