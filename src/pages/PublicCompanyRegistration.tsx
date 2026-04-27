import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2, Globe, Landmark, MapPin, User, Mail, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import Logo from "@/components/Logo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthSplitLayoutAnimated } from "@/components/auth/AuthSplitLayoutAnimated";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { useRegistration } from "@/contexts/RegistrationContext";
import { companyCheckSchema, companyRegistrationSchema, onlyDigits, type CompanyCheckValues, type CompanyRegistrationValues } from "@/validation/companyRegistration";

const defaults = (cnpj: string): CompanyRegistrationValues => ({
  cnpj,
  nomeOficial: "",
  nomeFantasia: "",
  webSite: "",
  experiencia: "",
  endereco: {
    tipoLogradouro: 1,
    nomeLogradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    municipio: {
      id: undefined,
      descricao: "",
      estado: { id: undefined, descricao: "", sigla: "" },
    },
    cep: "",
    observacoes: "",
  },
  responsavelLegalNome: "",
  responsavelLegalCPF: "",
  responsavelLegalRG: "",
  responsavelLegalCargo: "",
  responsavelLegalEmail: "",
});

const PublicCompanyRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCompany } = useRegistration();
  const [mode, setMode] = useState<"check" | "register">("check");

  const checkForm = useForm<CompanyCheckValues>({
    resolver: zodResolver(companyCheckSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { cnpj: "" },
  });

  const registerForm = useForm<CompanyRegistrationValues>({
    resolver: zodResolver(companyRegistrationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaults(""),
  });

  useEffect(() => {
    const c = document.getElementById("chatbot-container");
    if (c) c.remove();
  }, []);

  const startNewCompanyRegistration = () => {
    const normalized = onlyDigits(checkForm.getValues("cnpj"));
    setMode("register");
    registerForm.reset(defaults(normalized));
  };

  const onCheck = async (values: CompanyCheckValues) => {
    try {
      const existing = await companyService.getByCnpj(values.cnpj);
      if (existing) {
        setCompany(existing);
        toast({ title: "Empresa encontrada", description: "Vamos seguir para o cadastro do usuário." });
        navigate("/registro/usuario");
        return;
      }

      const normalized = onlyDigits(values.cnpj);
      setMode("register");
      registerForm.reset(defaults(normalized));
      toast({ title: "CNPJ não encontrado", description: "Complete o cadastro da empresa para continuar." });
    } catch (error) {
      toast({
        title: "Erro ao verificar CNPJ",
        description: error instanceof Error ? error.message : "Não foi possível verificar o CNPJ.",
        variant: "destructive",
      });
    }
  };

  const onRegister = async (values: CompanyRegistrationValues) => {
    try {
      const created = await companyService.create({
        ...values,
        cnpj: onlyDigits(values.cnpj),
        webSite: values.webSite?.trim() ? values.webSite : undefined,
        experiencia: values.experiencia?.trim() ? values.experiencia : undefined,
        endereco: {
          ...values.endereco,
          cep: onlyDigits(values.endereco.cep),
          complemento: values.endereco.complemento?.trim() ? values.endereco.complemento : undefined,
          observacoes: values.endereco.observacoes?.trim() ? values.endereco.observacoes : undefined,
          municipio: {
            ...values.endereco.municipio,
            estado: {
              ...values.endereco.municipio.estado,
              sigla: values.endereco.municipio.estado.sigla.toUpperCase(),
            },
          },
        },
        responsavelLegalCPF: onlyDigits(values.responsavelLegalCPF),
        responsavelLegalRG: values.responsavelLegalRG?.trim() ? values.responsavelLegalRG : undefined,
      });

      setCompany(created);
      toast({ title: "Empresa cadastrada", description: "Agora vamos cadastrar o usuário." });
      navigate("/registro/usuario");
    } catch (error) {
      toast({
        title: "Erro ao cadastrar empresa",
        description: error instanceof Error ? error.message : "Não foi possível cadastrar a empresa.",
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Registro</h1>
          <p className="text-muted-foreground mt-2">Primeiro, verifique o CNPJ da empresa ou cadastre uma nova.</p>
        </div>

        {mode === "check" ? (
          <Form {...checkForm}>
            <form onSubmit={checkForm.handleSubmit(onCheck)} className="space-y-6">
              <FormField
                control={checkForm.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-foreground block">CNPJ</FormLabel>
                    <FormControl>
                      <Field>
                        <Landmark aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                        <Input placeholder="00.000.000/0000-00" inputMode="numeric" autoComplete="off" className="pl-10" {...field} />
                      </Field>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11" disabled={!checkForm.formState.isValid}>
                Continuar
              </Button>

              <Button type="button" variant="outline" className="w-full h-11" onClick={startNewCompanyRegistration}>
                Cadastrar nova empresa
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="flex-1 flex flex-col min-h-0 space-y-6">
              <div className="flex-1 min-h-0 minimal-scroll pr-1 space-y-6">
                <FormField
                  control={registerForm.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">CNPJ</FormLabel>
                      <FormControl>
                        <Field>
                          <Landmark aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                          <Input placeholder="00.000.000/0000-00" inputMode="numeric" autoComplete="off" className="pl-10" {...field} />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="nomeOficial"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">Nome oficial</FormLabel>
                      <FormControl>
                        <Field>
                          <Building2 aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Razão social" className="pl-10" {...field} />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="nomeFantasia"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">Nome fantasia</FormLabel>
                      <FormControl>
                        <Field>
                          <Building2 aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Nome fantasia" className="pl-10" {...field} />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="webSite"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">Website</FormLabel>
                      <FormControl>
                        <Field>
                          <Globe aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                          <Input placeholder="https://www.empresa.com.br" className="pl-10" {...field} />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">Endereço</p>

                  <FormField
                    control={registerForm.control}
                    name="endereco.cep"
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
                    control={registerForm.control}
                    name="endereco.nomeLogradouro"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground block">Logradouro</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua / Avenida" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="endereco.numero"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="endereco.complemento"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Sala / Apto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="endereco.bairro"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground block">Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="endereco.municipio.descricao"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Município</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="endereco.municipio.estado.sigla"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">UF</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">Responsável legal</p>

                  <FormField
                    control={registerForm.control}
                    name="responsavelLegalNome"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground block">Nome</FormLabel>
                        <FormControl>
                          <Field>
                            <User aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Nome completo" className="pl-10" {...field} />
                          </Field>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="responsavelLegalCPF"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" inputMode="numeric" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="responsavelLegalCargo"
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
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="responsavelLegalEmail"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground block">E-mail</FormLabel>
                        <FormControl>
                          <Field>
                            <Mail aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                            <Input type="email" placeholder="email@empresa.com.br" className="pl-10" {...field} />
                          </Field>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11" disabled={!registerForm.formState.isValid}>
                Cadastrar empresa e continuar
              </Button>

              <Button type="button" variant="outline" className="w-full h-11" onClick={() => setMode("check")}>
                Voltar para verificação de CNPJ
              </Button>
            </form>
          </Form>
        )}

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            Já tem uma conta?{" "}
            <a href="/login" className="font-medium text-accent hover:text-accent/80">
              Entrar
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
  }, [checkForm, mode, navigate, registerForm, setCompany, toast]);

  if (mode === "check") {
    return (
      <AuthSplitLayoutAnimated
        rightTitle="Registro por etapas"
        rightDescription="Verifique o CNPJ da empresa. Se ela já existir, seguimos direto para o cadastro do usuário."
        left={
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="text-center flex flex-col items-center scale-[0.85]">
              <div className="flex items-center gap-2 mb-6">
                <Logo size="lg" className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Registro</h1>
              <p className="text-muted-foreground mt-2">Verifique o CNPJ da empresa ou cadastre uma nova.</p>
            </div>

            <Form {...checkForm}>
              <form onSubmit={checkForm.handleSubmit(onCheck)} className="space-y-6">
                <FormField
                  control={checkForm.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">CNPJ</FormLabel>
                      <FormControl>
                        <Field>
                          <Landmark aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                          <Input placeholder="00.000.000/0000-00" inputMode="numeric" autoComplete="off" className="pl-10" {...field} />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11" disabled={!checkForm.formState.isValid}>
                  Continuar
                </Button>

                <Button type="button" variant="outline" className="w-full h-11" onClick={startNewCompanyRegistration}>
                  Cadastrar nova empresa
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                Já tem uma conta?{" "}
                <a href="/login" className="font-medium text-accent hover:text-accent/80">
                  Entrar
                </a>
              </p>
              <p>
                <a href="/" className="font-medium text-accent hover:text-accent/80">
                  Voltar para o site
                </a>
              </p>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <AuthSplitLayout left={left} />
  );
};

export default PublicCompanyRegistration;
