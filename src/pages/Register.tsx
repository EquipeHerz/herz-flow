import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Briefcase, Building2, Phone, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import Logo from "@/components/Logo";
import FloatingElements from "@/components/FloatingElements";
import AIAnimations from "@/components/AIAnimations";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { onlyDigits, publicRegistrationSchema, type PublicRegistrationValues } from "@/validation/publicRegistration";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, isLoading } = useAuth();

  const form = useForm<PublicRegistrationValues>({
    resolver: zodResolver(publicRegistrationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      cpf: "",
      position: "",
      companyName: "",
      phones: [""],
      address: {
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
    },
  });

  const phonesArray = useFieldArray({
    control: form.control,
    name: "phones",
  });

  useEffect(() => {
    const c = document.getElementById("chatbot-container");
    if (c) c.remove();
  }, []);

  const onSubmit = async (values: PublicRegistrationValues) => {
    try {
      const phones = values.phones.map(onlyDigits);
      const primaryPhone = phones[0] ?? "";

      await register({
        name: values.fullName,
        email: values.email,
        password: values.password,
        phone: primaryPhone,
        phones,
        document: onlyDigits(values.cpf),
        role: "OPERADOR",
        position: values.position,
        department: values.companyName,
        companyName: values.companyName,
        address: {
          zipCode: onlyDigits(values.address.zipCode),
          street: values.address.street,
          number: values.address.number,
          complement: values.address.complement?.trim() ? values.address.complement : undefined,
          neighborhood: values.address.neighborhood,
          city: values.address.city,
          state: values.address.state.toUpperCase(),
        },
        status: "active",
      });

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao Dashboard Herz!",
      });
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Não foi possível concluir o cadastro.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-hero-start to-hero-end p-4 sm:p-8 relative overflow-hidden">
      <FloatingElements />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-background/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 overflow-hidden min-h-[600px] relative z-10">
        <div className="w-full p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative z-20">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-6">
                <Logo size="lg" className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Crie sua conta</h1>
              <p className="text-muted-foreground mt-2">Preencha seus dados para acessar o Dashboard Herz.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="max-h-[52vh] lg:max-h-[520px] overflow-y-auto pr-1 space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground block">Nome completo</FormLabel>
                        <FormControl>
                          <Field>
                            <User aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Seu nome completo" autoComplete="name" className="pl-10" {...field} />
                          </Field>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground block">E-mail</FormLabel>
                        <FormControl>
                          <Field>
                            <Mail aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                            <Input type="email" placeholder="seu@email.com" autoComplete="email" className="pl-10" {...field} />
                          </Field>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Senha</FormLabel>
                          <FormControl>
                            <Field>
                              <Lock aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" autoComplete="new-password" className="pl-10" {...field} />
                            </Field>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Confirmar senha</FormLabel>
                          <FormControl>
                            <Field>
                              <Lock aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" autoComplete="new-password" className="pl-10" {...field} />
                            </Field>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" inputMode="numeric" autoComplete="off" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Cargo</FormLabel>
                          <FormControl>
                            <Field>
                              <Briefcase aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                              <Input placeholder="Seu cargo" className="pl-10" {...field} />
                            </Field>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground block">Empresa que trabalha</FormLabel>
                        <FormControl>
                          <Field>
                            <Building2 aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Nome da empresa" className="pl-10" {...field} />
                          </Field>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">Telefones</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => phonesArray.append("")}
                        className="h-9"
                      >
                        Adicionar
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {phonesArray.fields.map((f, index) => (
                        <FormField
                          key={f.id}
                          control={form.control}
                          name={`phones.${index}`}
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">
                                Telefone {index + 1}
                              </FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Field className="flex-1">
                                    <Phone aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                                    <Input placeholder="(00) 00000-0000" inputMode="tel" className="pl-10" {...field} />
                                  </Field>
                                  {phonesArray.fields.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => phonesArray.remove(index)}
                                      className="shrink-0"
                                      aria-label={`Remover telefone ${index + 1}`}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium text-foreground">Endereço completo</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.zipCode"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-foreground block">CEP</FormLabel>
                            <FormControl>
                              <Field>
                                <MapPin aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                                <Input placeholder="00000-000" inputMode="numeric" className="pl-10" {...field} />
                              </Field>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-foreground block">Estado (UF)</FormLabel>
                            <FormControl>
                              <Input placeholder="SP" autoComplete="address-level1" maxLength={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Rua</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua / Avenida" autoComplete="address-line1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="address.number"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-foreground block">Número</FormLabel>
                            <FormControl>
                              <Input placeholder="123" autoComplete="address-line2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.complement"
                        render={({ field }) => (
                          <FormItem className="space-y-2 sm:col-span-2">
                            <FormLabel className="text-sm font-medium text-foreground block">Complemento</FormLabel>
                            <FormControl>
                              <Input placeholder="Apto, bloco, sala..." autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address.neighborhood"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" autoComplete="address-level3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" autoComplete="address-level2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                Já tem uma conta?{" "}
                <button type="button" className="font-medium text-accent hover:text-accent/80" onClick={() => navigate("/login")}>
                  Entrar
                </button>
              </p>
              <p>
                <button type="button" className="font-medium text-accent hover:text-accent/80" onClick={() => navigate("/")}>
                  Voltar para o site
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex relative bg-muted flex-col justify-end p-12 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90 mix-blend-multiply z-10" />
          <AIAnimations />
          <div className="relative z-20 space-y-6 max-w-lg mx-auto lg:mx-0">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight dark:text-[#ffffff] text-primary-foreground">
              Comece agora mesmo
            </h2>
            <p className="text-lg opacity-90 leading-relaxed dark:text-[#e0e0e0] text-primary-foreground/90">
              Crie sua conta e gerencie seus atendimentos inteligentes com total controle e agilidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
