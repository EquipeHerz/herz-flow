import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Building2, Globe, Landmark, MapPin, User, Mail, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import Logo from "@/components/Logo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { companyCheckSchema, companyRegistrationSchema, onlyDigits, type CompanyCheckValues, type CompanyRegistrationValues } from "@/validation/companyRegistration";
import { createSistemaLoginBackClient } from "@/services/sistemaLoginBack";
import type { EmpresaModel } from "@/services/sistemaLoginBack";
import { createSistemaUtilsBackClient, type DescricaoID, type EstadoModel, type MunicipioModel } from "@/services/sistemaUtilsBack";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/services/http/apiError";
import { allowOnlyDigitsKeyDown, digitsOnly, formatCnpj } from "@/utils/inputMasks";

const PENDING_COMPANY_CNPJ_KEY = "herz_pending_company_cnpj";

const defaults = (cnpj: string): CompanyRegistrationValues => ({
  cnpj,
  nomeOficial: "",
  nomeFantasia: "",
  webSite: "",
  experiencia: "",
  enderecos: [
    {
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
  ],
  responsavelLegalNome: "",
  responsavelLegalCPF: "",
  responsavelLegalRG: "",
  responsavelLegalCargo: "",
  responsavelLegalEmail: "",
});

const PublicCompanyRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"check" | "register">("check");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiClient = useMemo(() => createSistemaLoginBackClient(), []);
  const utilsClient = useMemo(() => createSistemaUtilsBackClient(), []);
  const [tiposLogradouro, setTiposLogradouro] = useState<DescricaoID[]>([]);
  const [estados, setEstados] = useState<EstadoModel[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioModel[]>([]);

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

  const enderecos = useFieldArray({
    control: registerForm.control,
    name: "enderecos",
  });

  useEffect(() => {
    const c = document.getElementById("chatbot-container");
    if (c) c.remove();
  }, []);

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

  const startNewCompanyRegistration = () => {
    const normalized = onlyDigits(checkForm.getValues("cnpj"));
    setMode("register");
    registerForm.reset(defaults(formatCnpj(normalized)));
  };

  const onCheck = async (values: CompanyCheckValues) => {
    try {
      const authOk = await apiClient.api.isAuthenticated().catch(() => false);
      if (!authOk) {
        throw new Error("Sessão não validada. Faça login novamente (cookie/token) antes de cadastrar empresa.");
      }

      const normalized = onlyDigits(values.cnpj);
      const existing = await apiClient.api.searchEmpresaByCnpj(normalized);
      if (existing) {
        toast({ title: "Empresa encontrada", description: "Vamos seguir para o cadastro do usuário." });
        localStorage.setItem(PENDING_COMPANY_CNPJ_KEY, normalized);
        navigate("/registro-usuario");
        return;
      }

      setMode("register");
      registerForm.reset(defaults(formatCnpj(normalized)));
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
      setIsSubmitting(true);
      const cnpj = onlyDigits(values.cnpj);
      const endereco0 = values.enderecos[0];
      const webSiteRaw = values.webSite?.trim();
      const webSiteNormalized = webSiteRaw
        ? webSiteRaw.replace(/^https?:\/\//i, "").replace(/\/+$/, "")
        : undefined;

      const payload: EmpresaModel = {
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
        responsavelLegalRG: values.responsavelLegalRG?.trim() ? digitsOnly(values.responsavelLegalRG) : undefined,
        responsavelLegalCargo: values.responsavelLegalCargo,
        responsavelLegalEmail: values.responsavelLegalEmail,
      };

      const authOk = await apiClient.api.isAuthenticated().catch(() => false);
      if (!authOk) {
        throw new Error("Sessão não validada. Faça login novamente (cookie/token) antes de cadastrar empresa.");
      }

      await apiClient.api.createEmpresa(payload);
      toast({ title: "Empresa cadastrada", description: "Cadastro finalizado com sucesso." });
      localStorage.setItem(PENDING_COMPANY_CNPJ_KEY, cnpj);
      navigate("/listagem-empresas");
    } catch (error) {
      const status = error instanceof ApiError ? error.status : undefined;
      const statusSuffix = status ? ` (HTTP ${status})` : "";
      const meta =
        error instanceof ApiError
          ? `\n${error.kind}${error.method && error.url ? ` ${error.method} ${error.url}` : ""}`
          : "";
      const details =
        error instanceof ApiError && error.data != null
          ? typeof error.data === "string"
            ? error.data
            : JSON.stringify(error.data)
          : "";
      const detailsSuffix = details && error instanceof Error && !String(error.message).includes(details) ? `\n${details}` : "";
      toast({
        title: "Erro ao cadastrar empresa",
        description: error instanceof Error ? `${error.message}${statusSuffix}${meta}${detailsSuffix}` : "Não foi possível cadastrar a empresa.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const left = (
    <div className={mode === "check" ? "w-full h-full flex flex-col" : "w-full h-full flex flex-col min-h-0"}>
      <div className="text-center flex flex-col items-center scale-[0.85]">
        <div className="flex items-center gap-2 mb-6">
          <Logo size="lg" className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Cadastro de empresa</h1>
        <p className="text-muted-foreground mt-2">Verifique o CNPJ ou cadastre uma nova empresa.</p>
      </div>

      {mode === "check" ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
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
                          <Input
                            {...field}
                            placeholder="00.000.000/0000-00"
                            inputMode="numeric"
                            autoComplete="off"
                            className="pl-10"
                            value={field.value ?? ""}
                            onKeyDown={allowOnlyDigitsKeyDown}
                            onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                          />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="default"
                  className="w-full font-semibold h-11"
                  disabled={!checkForm.formState.isValid || isSubmitting}
                >
                  Continuar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={startNewCompanyRegistration}
                  disabled={isSubmitting}
                >
                  Cadastrar nova empresa
                </Button>
              </form>
            </Form>
          </div>
        </div>
      ) : (
        <Form {...registerForm}>
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 minimal-scroll pr-1 space-y-6 pb-6">
                <FormField
                  control={registerForm.control}
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
                          />
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
                          <Input placeholder="www.empresa.com.br" className="pl-10" {...field} />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="experiencia"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground block">Descrição da empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Descreva a empresa (mínimo 10 caracteres)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">Endereços</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9"
                      onClick={() =>
                        enderecos.append({
                          tipoLogradouro: 1,
                          nomeLogradouro: "",
                          numero: "",
                      complemento: "",
                          bairro: "",
                          municipio: { id: undefined, descricao: "", estado: { id: undefined, descricao: "", sigla: "" } },
                          cep: "",
                      observacoes: "",
                        })
                      }
                    >
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {enderecos.fields.map((addr, idx) => {
                      const uf = registerForm.watch(`enderecos.${idx}.municipio.estado.sigla`) || "";
                      const municipiosUf = uf
                        ? municipios.filter((m) => (m.estado?.sigla ?? "").toUpperCase() === uf.toUpperCase())
                        : [];

                      return (
                        <div key={addr.id} className="space-y-4 border border-border/50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">Endereço {idx + 1}</p>
                            {enderecos.fields.length > 1 && (
                              <Button type="button" variant="outline" className="h-9" onClick={() => enderecos.remove(idx)}>
                                Remover
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name={`enderecos.${idx}.tipoLogradouro`}
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium text-foreground block">Tipo de logradouro</FormLabel>
                                  <Select
                                    value={field.value ? String(field.value) : ""}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {tiposLogradouro.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
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
                              control={registerForm.control}
                              name={`enderecos.${idx}.cep`}
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium text-foreground block">CEP</FormLabel>
                                  <FormControl>
                                    <Field>
                                      <MapPin aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                                      <Input
                                        {...field}
                                        placeholder="00000-000"
                                        inputMode="numeric"
                                        className="pl-10"
                                        value={field.value ?? ""}
                                        onKeyDown={allowOnlyDigitsKeyDown}
                                        onChange={(e) => field.onChange(digitsOnly(e.target.value))}
                                      />
                                    </Field>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={registerForm.control}
                            name={`enderecos.${idx}.nomeLogradouro`}
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
                              name={`enderecos.${idx}.numero`}
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
                              name={`enderecos.${idx}.complemento`}
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
                            name={`enderecos.${idx}.bairro`}
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
                              name={`enderecos.${idx}.municipio.estado.sigla`}
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium text-foreground block">UF</FormLabel>
                                  <Select
                                    value={field.value ?? ""}
                                    onValueChange={(sigla) => {
                                      const estado = estados.find((e) => (e.sigla ?? "").toUpperCase() === sigla.toUpperCase());
                                      registerForm.setValue(`enderecos.${idx}.municipio.estado.sigla`, sigla.toUpperCase());
                                      registerForm.setValue(`enderecos.${idx}.municipio.estado.id`, estado?.id);
                                      registerForm.setValue(`enderecos.${idx}.municipio.estado.descricao`, estado?.descricao ?? "");
                                      registerForm.setValue(`enderecos.${idx}.municipio.id`, undefined);
                                      registerForm.setValue(`enderecos.${idx}.municipio.descricao`, "");
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {estados
                                        .filter((e) => (e.sigla ?? "").length === 2)
                                        .map((e) => (
                                          <SelectItem key={e.id} value={(e.sigla ?? "").toUpperCase()}>
                                            {(e.sigla ?? "").toUpperCase()} - {e.descricao}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name={`enderecos.${idx}.municipio.id`}
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium text-foreground block">Município</FormLabel>
                                  <Select
                                    value={field.value != null ? String(field.value) : ""}
                                    onValueChange={(idStr) => {
                                      const id = Number(idStr);
                                      const municipio = municipiosUf.find((m) => m.id === id);
                                      field.onChange(id);
                                      registerForm.setValue(`enderecos.${idx}.municipio.descricao`, municipio?.descricao ?? "");
                                      registerForm.setValue(`enderecos.${idx}.municipio.estado.id`, municipio?.estado?.id);
                                      registerForm.setValue(`enderecos.${idx}.municipio.estado.descricao`, municipio?.estado?.descricao ?? "");
                                      registerForm.setValue(`enderecos.${idx}.municipio.estado.sigla`, (municipio?.estado?.sigla ?? uf).toUpperCase());
                                    }}
                                    disabled={!uf}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={uf ? "Selecione" : "Selecione a UF"} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {municipiosUf.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                          {m.descricao ?? String(m.id)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={registerForm.control}
                            name={`enderecos.${idx}.observacoes`}
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-foreground block">Ponto de referência</FormLabel>
                                <FormControl>
                                  <Input placeholder="Próximo ao shopping" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      );
                    })}
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="responsavelLegalCPF"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">CPF</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="000.000.000-00"
                              inputMode="numeric"
                              value={field.value ?? ""}
                              onKeyDown={allowOnlyDigitsKeyDown}
                              onChange={(e) => field.onChange(digitsOnly(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="responsavelLegalRG"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-foreground block">RG</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="RG"
                              inputMode="numeric"
                              value={field.value ?? ""}
                              onKeyDown={allowOnlyDigitsKeyDown}
                              onChange={(e) => field.onChange(digitsOnly(e.target.value))}
                            />
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

            <div className="shrink-0 pt-4 border-t border-border/50 bg-transparent dark:bg-background/60 dark:backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="outline" className="w-full h-11" onClick={() => setMode("check")} disabled={isSubmitting}>
                  Voltar para verificação de CNPJ
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="w-full font-semibold h-11"
                  disabled={!registerForm.formState.isValid || isSubmitting}
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar empresa e continuar"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );

  const dialogClassName =
    mode === "check"
      ? "w-full max-w-xl p-0 overflow-hidden bg-card dark:bg-background/80 dark:backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50"
      : "w-full max-w-5xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] p-0 overflow-hidden bg-card dark:bg-background/80 dark:backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-hero-start to-hero-end">
      <Dialog open onOpenChange={(open) => (!open ? navigate("/listagem-empresas") : undefined)}>
        <DialogContent className={dialogClassName}>
          <div className="w-full h-full p-6 sm:p-8 lg:p-10 flex flex-col min-h-0">{left}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicCompanyRegistration;
