import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Briefcase, KeyRound, Mail, Phone, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import Logo from "@/components/Logo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { useToast } from "@/hooks/use-toast";
import { useRegistration } from "@/contexts/RegistrationContext";
import { useAuth } from "@/contexts/AuthContext";
import { onlyDigits, userRegistrationSchema, type UserRegistrationValues } from "@/validation/userRegistration";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PublicUserRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { company, clear } = useRegistration();
  const { register: registerAuth, isLoading } = useAuth();

  const form = useForm<UserRegistrationValues>({
    resolver: zodResolver(userRegistrationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nome: "",
      login: "",
      email: "",
      senhaNova: "",
      confirmSenhaNova: "",
      cargo: "",
      departamento: "",
      aceiteLGPD: false,
      tipoUsuario: "1",
      telefones: [{ ddi: "55", ddd: "", numero: "", tipoTelefone: "1", observacoes: "" }],
    },
  });

  const phones = useFieldArray({
    control: form.control,
    name: "telefones",
  });

  useEffect(() => {
    const c = document.getElementById("chatbot-container");
    if (c) c.remove();
  }, []);

  useEffect(() => {
    if (!company) navigate("/registro/empresa", { replace: true });
  }, [company, navigate]);

  const onSubmit = async (values: UserRegistrationValues) => {
    if (!company) return;

    try {
      const phoneDigits = values.telefones.map((t) => `${onlyDigits(t.ddi)}${onlyDigits(t.ddd)}${onlyDigits(t.numero)}`);

      await registerAuth({
        name: values.nome,
        email: values.email,
        password: values.senhaNova,
        phone: phoneDigits[0] ?? "",
        phones: phoneDigits,
        document: "",
        role: values.tipoUsuario === "1" ? "ADMIN_EMPRESA" : "OPERADOR",
        username: values.login,
        corporateEmail: values.email,
        position: values.cargo,
        department: values.departamento,
        admissionDate: undefined,
        birthDate: undefined,
        address: {
          zipCode: company.endereco.cep,
          street: company.endereco.nomeLogradouro,
          number: company.endereco.numero,
          complement: company.endereco.complemento,
          neighborhood: company.endereco.bairro,
          city: company.endereco.municipio.descricao,
          state: company.endereco.municipio.estado.sigla,
        },
        companyId: company.id,
        companyName: company.nomeFantasia,
        company: company.nomeFantasia,
        cnpj: company.cnpj,
        status: "active",
      });

      clear();
      toast({ title: "Usuário cadastrado", description: "Cadastro finalizado com sucesso." });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar usuário",
        description: error instanceof Error ? error.message : "Não foi possível cadastrar o usuário.",
        variant: "destructive",
      });
    }
  };

  const left = useMemo(() => {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="text-center flex flex-col items-center scale-[0.85]">
          <div className="flex items-center gap-2 mb-6">
            <Logo size="lg" className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Cadastro do usuário</h1>
          <p className="text-muted-foreground mt-2">
            Empresa: <span className="font-medium text-foreground">{company?.nomeFantasia ?? "-"}</span>
          </p>
          <p className="text-muted-foreground">
            CNPJ: <span className="font-medium text-foreground">{company?.cnpj ?? "-"}</span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 space-y-6">
            <div className="flex-1 min-h-0 minimal-scroll pr-1 space-y-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-foreground block">Nome</FormLabel>
                    <FormControl>
                      <Field>
                        <User aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Nome completo" autoComplete="name" className="pl-10" {...field} />
                      </Field>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-foreground block">Login</FormLabel>
                    <FormControl>
                      <Field>
                        <Users aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                        <Input placeholder="seu.login" autoComplete="username" className="pl-10" {...field} />
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
                        <Input type="email" placeholder="email@empresa.com.br" autoComplete="email" className="pl-10" {...field} />
                      </Field>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="senhaNova"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">Senha</FormLabel>
                      <FormControl>
                        <Field>
                          <KeyRound aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" autoComplete="new-password" className="pl-10" {...field} />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmSenhaNova"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">Confirmar senha</FormLabel>
                      <FormControl>
                        <Field>
                          <KeyRound aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
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
                  name="cargo"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">Cargo</FormLabel>
                      <FormControl>
                        <Field>
                          <Briefcase aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Cargo" className="pl-10" {...field} />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departamento"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">Departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Departamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tipoUsuario"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-foreground block">Tipo de usuário</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Administrador da empresa</SelectItem>
                        <SelectItem value="2">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">Telefones</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => phones.append({ ddi: "55", ddd: "", numero: "", tipoTelefone: "1", observacoes: "" })} className="h-9">
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-4">
                  {phones.fields.map((f, idx) => (
                    <div key={f.id} className="space-y-3 border border-border/50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">Telefone {idx + 1}</p>
                        {phones.fields.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => phones.remove(idx)}>
                            Remover
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`telefones.${idx}.ddi`}
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">DDI</FormLabel>
                              <FormControl>
                                <Input placeholder="55" inputMode="numeric" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`telefones.${idx}.ddd`}
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">DDD</FormLabel>
                              <FormControl>
                                <Input placeholder="11" inputMode="numeric" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`telefones.${idx}.numero`}
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">Número</FormLabel>
                              <FormControl>
                                <Field>
                                  <Phone aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                                  <Input placeholder="991234567" inputMode="numeric" className="pl-10" {...field} />
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
                          name={`telefones.${idx}.tipoTelefone`}
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">Tipo</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">Celular</SelectItem>
                                  <SelectItem value="2">Fixo</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`telefones.${idx}.observacoes`}
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">Observações</FormLabel>
                              <FormControl>
                                <Input placeholder="WhatsApp pessoal" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="aceiteLGPD"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                      </FormControl>
                      <FormLabel className="text-sm font-medium text-foreground">Aceito os termos da LGPD</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11" disabled={isLoading || !form.formState.isValid}>
              {isLoading ? "Finalizando..." : "Finalizar cadastro"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            <a href="/registro/empresa" className="font-medium text-accent hover:text-accent/80">
              Voltar para a etapa da empresa
            </a>
          </p>
          <p>
            <a href="/" className="font-medium text-accent hover:text-accent/80">
              Voltar para o site
            </a>
          </p>
        </div>
      </div>
    );
  }, [company, form, isLoading, phones, toast]);

  return (
    <AuthSplitLayout
      left={left}
    />
  );
};

export default PublicUserRegistration;
