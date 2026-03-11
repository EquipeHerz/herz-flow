import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

const companySchema = z.object({
  // Dados Básicos
  legalName: z.string().min(3, 'Razão Social obrigatória'),
  tradeName: z.string().min(3, 'Nome Fantasia obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  stateRegistration: z.string().optional(),
  
  // Contato
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),

  // Endereço
  address: z.object({
    zipCode: z.string().min(8, 'CEP inválido'),
    street: z.string().min(3, 'Rua obrigatória'),
    number: z.string().min(1, 'Número obrigatório'),
    neighborhood: z.string().min(2, 'Bairro obrigatório'),
    city: z.string().min(2, 'Cidade obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 letras'),
  }),

  // Responsável
  responsibleName: z.string().min(3, 'Nome do responsável obrigatório'),
  responsibleEmail: z.string().email('E-mail do responsável inválido'),
  responsiblePhone: z.string().min(10, 'Telefone do responsável inválido'),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const RegisterCompany = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
      address: {
        zipCode: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      responsibleName: '',
      responsibleEmail: '',
      responsiblePhone: '',
    },
  });

  const onSubmit = async (data: CompanyFormValues) => {
    // Mock API call
    console.log("Empresa cadastrada:", data);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Empresa cadastrada',
      description: `A empresa ${data.tradeName} foi registrada com sucesso.`,
    });
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Cadastro de Empresa" subtitle="Registre uma nova empresa parceira ou cliente" />
      
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardHeader className="text-center border-b bg-gradient-to-br from-hero-start to-hero-end pb-8">
            <div className="flex flex-col items-center gap-4">
              <div>
                <CardTitle className="text-2xl">Nova Empresa</CardTitle>
                <CardDescription className="text-base font-medium text-primary mt-1">
                  Preencha os dados corporativos para registro
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-350px)] max-h-[800px]">
              <div className="p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    {/* Dados Básicos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Dados da Empresa</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="legalName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razão Social *</FormLabel>
                            <FormControl><Input placeholder="Razão Social Ltda" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="tradeName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Fantasia *</FormLabel>
                            <FormControl><Input placeholder="Nome Comercial" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="cnpj" render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNPJ *</FormLabel>
                            <FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="stateRegistration" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inscrição Estadual</FormLabel>
                            <FormControl><Input placeholder="Isento ou número" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Contato */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Contato Corporativo</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail Principal *</FormLabel>
                            <FormControl><Input type="email" placeholder="contato@empresa.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone Principal *</FormLabel>
                            <FormControl><Input placeholder="(00) 0000-0000" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="website" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl><Input placeholder="https://www.empresa.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>
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

                    {/* Responsável */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Responsável Legal / Contato Principal</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="responsibleName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="responsibleEmail" render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail *</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="responsiblePhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone / Celular *</FormLabel>
                            <FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="min-w-[150px]">
                        Cadastrar Empresa
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

export default RegisterCompany;
