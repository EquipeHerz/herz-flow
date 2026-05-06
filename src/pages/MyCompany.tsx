import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Building2, Globe, Landmark, Mail, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { companyRegistrationSchema, onlyDigits, type CompanyRegistrationValues } from "@/validation/companyRegistration";
import { createSistemaLoginBackClient, type EmpresaModel } from "@/services/sistemaLoginBack";
import { createSistemaUtilsBackClient, type DescricaoID, type EstadoModel, type MunicipioModel } from "@/services/sistemaUtilsBack";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allowOnlyDigitsKeyDown, digitsOnly, formatCnpj } from "@/utils/inputMasks";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PENDING_COMPANY_CNPJ_KEY = "herz_pending_company_cnpj";

const emptyEndereco = () => ({
  tipoLogradouro: 1,
  nomeLogradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  municipio: {
    id: undefined as number | undefined,
    descricao: "",
    estado: {
      id: undefined as number | undefined,
      descricao: "",
      sigla: "",
    },
  },
  cep: "",
  observacoes: "",
});

const defaults = (): CompanyRegistrationValues => ({
  cnpj: formatCnpj(onlyDigits(localStorage.getItem(PENDING_COMPANY_CNPJ_KEY) ?? "")),
  nomeOficial: "",
  nomeFantasia: "",
  webSite: "",
  experiencia: "",
  enderecos: [emptyEndereco()],
  responsavelLegalNome: "",
  responsavelLegalCPF: "",
  responsavelLegalRG: "",
  responsavelLegalCargo: "",
  responsavelLegalEmail: "",
});

const mapEmpresaToForm = (empresa: EmpresaModel): CompanyRegistrationValues => {
  const e = (empresa.endereco ?? {}) as any;
  return {
    cnpj: formatCnpj(onlyDigits(empresa.cnpj ?? "")),
    nomeOficial: empresa.nomeOficial ?? "",
    nomeFantasia: empresa.nomeFantasia ?? "",
    webSite: empresa.webSite ?? "",
    experiencia: empresa.experiencia ?? "",
    enderecos: [
      {
        tipoLogradouro: e.tipoLogradouro ?? 1,
        nomeLogradouro: e.nomeLogradouro ?? "",
        numero: e.numero ?? "",
        complemento: e.complemento ?? "",
        bairro: e.bairro ?? "",
        municipio: {
          id: e.municipio?.id,
          descricao: e.municipio?.descricao ?? e.municipio?.nome ?? "",
          estado: {
            id: e.municipio?.estado?.id,
            descricao: e.municipio?.estado?.descricao ?? e.municipio?.estado?.nome ?? "",
            sigla: e.municipio?.estado?.sigla ?? "",
          },
        },
        cep: e.cep ?? "",
        observacoes: e.observacoes ?? "",
      },
    ],
    responsavelLegalNome: empresa.responsavelLegalNome ?? "",
    responsavelLegalCPF: empresa.responsavelLegalCPF ?? "",
    responsavelLegalRG: empresa.responsavelLegalRG ?? "",
    responsavelLegalCargo: empresa.responsavelLegalCargo ?? "",
    responsavelLegalEmail: empresa.responsavelLegalEmail ?? "",
  };
};

const MyCompany = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const apiClient = useMemo(() => createSistemaLoginBackClient(), []);
  const utilsClient = useMemo(() => createSistemaUtilsBackClient(), []);
  const [tiposLogradouro, setTiposLogradouro] = useState<DescricaoID[]>([]);
  const [estados, setEstados] = useState<EstadoModel[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioModel[]>([]);
  const [empresaAtual, setEmpresaAtual] = useState<EmpresaModel | null>(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(false);

  const form = useForm<CompanyRegistrationValues>({
    resolver: zodResolver(companyRegistrationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaults(),
  });

  const enderecos = useFieldArray({
    control: form.control,
    name: "enderecos",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [tLog, est, mun] = await Promise.all([
          utilsClient.api.getTiposLogradouro(),
          utilsClient.api.getEstados(),
          utilsClient.api.getMunicipios(),
        ]);
        setTiposLogradouro(tLog);
        setEstados(est);
        setMunicipios(mun);
      } catch {
        setTiposLogradouro([]);
        setEstados([]);
        setMunicipios([]);
      }
    };
    load();
  }, [utilsClient]);

  useEffect(() => {
    const loadEmpresa = async () => {
      if (!user) return;
      setLoadingEmpresa(true);
      try {
        const cpfDigits = onlyDigits(user.cpf ?? "");
        const empresa = cpfDigits.length === 11 ? await apiClient.api.searchEmpresaByCpf(cpfDigits) : await apiClient.api.searchEmpresa();
        setEmpresaAtual(empresa);
        if (empresa) {
          form.reset(mapEmpresaToForm(empresa));
        } else {
          form.reset(defaults());
        }
      } catch (error) {
        setEmpresaAtual(null);
        toast({
          title: "Erro ao carregar empresa",
          description: error instanceof Error ? error.message : "Não foi possível carregar os dados da empresa.",
          variant: "destructive",
        });
      } finally {
        setLoadingEmpresa(false);
      }
    };
    loadEmpresa();
  }, [apiClient, form, toast, user]);

  const onSubmit = async (values: CompanyRegistrationValues) => {
    try {
      const cnpj = onlyDigits(values.cnpj);
      const endereco0 = values.enderecos[0];
      const webSiteRaw = values.webSite?.trim();
      const webSiteNormalized = webSiteRaw ? webSiteRaw.replace(/^https?:\/\//i, "").replace(/\/+$/, "") : undefined;

      const payload: EmpresaModel = {
        id: empresaAtual?.id,
        nomeOficial: values.nomeOficial,
        nomeFantasia: values.nomeFantasia,
        cnpj,
        webSite: webSiteNormalized,
        experiencia: values.experiencia?.trim() ? values.experiencia : undefined,
        endereco: endereco0
          ? {
              tipoLogradouro: endereco0.tipoLogradouro,
              nomeLogradouro: endereco0.nomeLogradouro,
              numero: endereco0.numero,
              complemento: endereco0.complemento?.trim() ? endereco0.complemento : undefined,
              bairro: endereco0.bairro,
              cep: onlyDigits(endereco0.cep),
              observacoes: endereco0.observacoes?.trim() ? endereco0.observacoes : undefined,
              municipio: {
                id: endereco0.municipio.id,
                descricao: endereco0.municipio.descricao,
                estado: {
                  id: endereco0.municipio.estado.id,
                  descricao: endereco0.municipio.estado.descricao,
                  sigla: endereco0.municipio.estado.sigla.toUpperCase(),
                },
              },
            }
          : undefined,
        responsavelLegalNome: values.responsavelLegalNome,
        responsavelLegalCPF: onlyDigits(values.responsavelLegalCPF),
        responsavelLegalRG: values.responsavelLegalRG?.trim() ? digitsOnly(values.responsavelLegalRG) : null,
        responsavelLegalCargo: values.responsavelLegalCargo,
        responsavelLegalEmail: values.responsavelLegalEmail,
      };

      if (empresaAtual) {
        await apiClient.api.updateEmpresa(payload);
        toast({ title: "Empresa atualizada", description: "Os dados da empresa foram salvos." });
      } else {
        await apiClient.api.createEmpresa(payload);
        toast({ title: "Empresa cadastrada", description: "A empresa foi cadastrada com sucesso." });
      }

      localStorage.removeItem(PENDING_COMPANY_CNPJ_KEY);
      const refreshed = await apiClient.api.searchEmpresaByCnpj(cnpj);
      setEmpresaAtual(refreshed ?? payload);
      if (refreshed) form.reset(mapEmpresaToForm(refreshed));
    } catch (error) {
      toast({
        title: "Erro ao salvar empresa",
        description: error instanceof Error ? error.message : "Não foi possível salvar a empresa.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Empresa" subtitle="Cadastro e atualização dos dados da empresa" />
      <main className="flex-1 flex justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">CNPJ</FormLabel>
                          <FormControl>
                            <Field>
                              <Landmark aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="00.000.000/0000-00"
                                inputMode="numeric"
                                autoComplete="off"
                                className="pl-10"
                                value={field.value ?? ""}
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                                disabled={loadingEmpresa}
                              />
                            </Field>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="webSite"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Website</FormLabel>
                          <FormControl>
                            <Field>
                              <Globe aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                              <Input placeholder="www.suaempresa.com.br" autoComplete="url" className="pl-10" {...field} disabled={loadingEmpresa} />
                            </Field>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomeOficial"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Nome oficial</FormLabel>
                          <FormControl>
                            <Field>
                              <Building2 aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                              <Input placeholder="Razão social" className="pl-10" {...field} disabled={loadingEmpresa} />
                            </Field>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nomeFantasia"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">Nome fantasia</FormLabel>
                          <FormControl>
                            <Field>
                              <Building2 aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                              <Input placeholder="Nome fantasia" className="pl-10" {...field} disabled={loadingEmpresa} />
                            </Field>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="experiencia"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground block">Descrição da empresa</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva a experiência/atuação da empresa" {...field} disabled={loadingEmpresa} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="space-y-4">
                    {enderecos.fields.map((addr, idx) => {
                      const estadoId = form.watch(`enderecos.${idx}.municipio.estado.id`);
                      const municipiosFiltrados = estadoId
                        ? municipios.filter((m) => Number(m.estado?.id) === Number(estadoId))
                        : municipios;

                      return (
                        <Card key={addr.id}>
                          <CardHeader>
                            <CardTitle className="text-base">Endereço</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`enderecos.${idx}.tipoLogradouro`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">Tipo de logradouro</FormLabel>
                                    <Select
                                      value={String(field.value ?? 1)}
                                      onValueChange={(v) => field.onChange(Number(v))}
                                      disabled={loadingEmpresa}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {tiposLogradouro.map((t) => (
                                          <SelectItem key={String(t.id)} value={String(t.id)}>
                                            {t.descricao}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`enderecos.${idx}.nomeLogradouro`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">Logradouro</FormLabel>
                                    <FormControl>
                                      <Field>
                                        <Landmark aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                                        <Input placeholder="Rua das Margaridas" className="pl-10" {...field} disabled={loadingEmpresa} />
                                      </Field>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`enderecos.${idx}.numero`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">Número</FormLabel>
                                    <FormControl>
                                      <Input placeholder="789" {...field} disabled={loadingEmpresa} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`enderecos.${idx}.complemento`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">Complemento</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Sala 10" {...field} disabled={loadingEmpresa} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`enderecos.${idx}.bairro`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">Bairro</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Asa Sul" {...field} disabled={loadingEmpresa} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`enderecos.${idx}.municipio.estado.id`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">Estado (UF)</FormLabel>
                                    <Select
                                      value={field.value != null ? String(field.value) : ""}
                                      onValueChange={(v) => {
                                        const selected = estados.find((e) => String(e.id) === String(v));
                                        form.setValue(`enderecos.${idx}.municipio.estado.id`, selected?.id as any, { shouldValidate: true });
                                        form.setValue(`enderecos.${idx}.municipio.estado.sigla`, selected?.sigla ?? "", { shouldValidate: true });
                                        form.setValue(`enderecos.${idx}.municipio.estado.descricao`, selected?.descricao ?? selected?.nome ?? "", { shouldValidate: true });
                                        form.setValue(`enderecos.${idx}.municipio.id`, undefined as any, { shouldValidate: true });
                                        form.setValue(`enderecos.${idx}.municipio.descricao`, "", { shouldValidate: true });
                                      }}
                                      disabled={loadingEmpresa}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {estados.map((e) => (
                                          <SelectItem key={String(e.id)} value={String(e.id)}>
                                            {e.sigla ?? e.descricao ?? e.nome ?? String(e.id)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`enderecos.${idx}.municipio.id`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">Município</FormLabel>
                                    <Select
                                      value={field.value != null ? String(field.value) : ""}
                                      onValueChange={(v) => {
                                        const selected = municipios.find((m) => String(m.id) === String(v));
                                        form.setValue(`enderecos.${idx}.municipio.id`, selected?.id as any, { shouldValidate: true });
                                        form.setValue(`enderecos.${idx}.municipio.descricao`, selected?.descricao ?? selected?.nome ?? "", { shouldValidate: true });
                                        const est = selected?.estado;
                                        if (est?.id != null) {
                                          form.setValue(`enderecos.${idx}.municipio.estado.id`, est.id as any, { shouldValidate: true });
                                          form.setValue(`enderecos.${idx}.municipio.estado.sigla`, est.sigla ?? "", { shouldValidate: true });
                                          form.setValue(`enderecos.${idx}.municipio.estado.descricao`, est.descricao ?? est.nome ?? "", { shouldValidate: true });
                                        }
                                      }}
                                      disabled={loadingEmpresa}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {municipiosFiltrados.map((m) => (
                                          <SelectItem key={String(m.id)} value={String(m.id)}>
                                            {m.descricao ?? m.nome ?? String(m.id)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`enderecos.${idx}.cep`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">CEP</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="70297-400"
                                        inputMode="numeric"
                                        {...field}
                                        onKeyDown={allowOnlyDigitsKeyDown}
                                        onChange={(e) => field.onChange(onlyDigits(e.target.value))}
                                        disabled={loadingEmpresa}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`enderecos.${idx}.observacoes`}
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium text-foreground block">Ponto de referência</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Próximo ao shopping" {...field} disabled={loadingEmpresa} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex gap-2">
                              {enderecos.fields.length > 1 && (
                                <Button type="button" variant="outline" onClick={() => enderecos.remove(idx)} disabled={loadingEmpresa}>
                                  Remover endereço
                                </Button>
                              )}
                              {idx === enderecos.fields.length - 1 && (
                                <Button type="button" variant="outline" onClick={() => enderecos.append(emptyEndereco())} disabled={loadingEmpresa}>
                                  Adicionar endereço
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Separator />

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Responsável legal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="responsavelLegalNome"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">Nome</FormLabel>
                              <FormControl>
                                <Field>
                                  <User aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                                  <Input placeholder="Nome completo" className="pl-10" {...field} disabled={loadingEmpresa} />
                                </Field>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="responsavelLegalEmail"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">E-mail</FormLabel>
                              <FormControl>
                                <Field>
                                  <Mail aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                                  <Input type="email" placeholder="email@empresa.com.br" className="pl-10" {...field} disabled={loadingEmpresa} />
                                </Field>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="responsavelLegalCPF"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">CPF</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Somente números"
                                  inputMode="numeric"
                                  {...field}
                                  onKeyDown={allowOnlyDigitsKeyDown}
                                  onChange={(e) => field.onChange(onlyDigits(e.target.value))}
                                  disabled={loadingEmpresa}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="responsavelLegalRG"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">RG</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Somente números"
                                  inputMode="numeric"
                                  {...field}
                                  onKeyDown={allowOnlyDigitsKeyDown}
                                  onChange={(e) => field.onChange(onlyDigits(e.target.value))}
                                  disabled={loadingEmpresa}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="responsavelLegalCargo"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-foreground block">Cargo</FormLabel>
                              <FormControl>
                                <Input placeholder="Gerente" {...field} disabled={loadingEmpresa} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11" disabled={loadingEmpresa || !form.formState.isValid}>
                    {loadingEmpresa ? "Carregando..." : empresaAtual ? "Salvar alterações" : "Cadastrar empresa"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MyCompany;
