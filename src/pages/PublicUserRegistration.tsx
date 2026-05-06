import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Briefcase, Building2, KeyRound, Mail, MapPin, Phone, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field } from "@/styles/components/Field";
import Logo from "@/components/Logo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { onlyDigits, userRegistrationSchema, type UserRegistrationValues } from "@/validation/userRegistration";
import {
  createSistemaLoginBackClient,
  type TipoTelefone,
  type TipoUsuarioEnum,
  type Usuario,
} from "@/services/sistemaLoginBack";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSistemaUtilsBackClient,
  type DescricaoID,
  type EstadoModel,
  type MunicipioModel,
} from "@/services/sistemaUtilsBack";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const PENDING_COMPANY_CNPJ_KEY = "herz_pending_company_cnpj";

const PublicUserRegistration = () => {
  const { toast } = useToast();
  const { user: currentUser, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const apiClient = useMemo(() => createSistemaLoginBackClient(), []);
  const utilsClient = useMemo(() => createSistemaUtilsBackClient(), []);
  const [tiposTelefone, setTiposTelefone] = useState<DescricaoID[]>([]);
  const [tiposLogradouro, setTiposLogradouro] = useState<DescricaoID[]>([]);
  const [estados, setEstados] = useState<EstadoModel[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioModel[]>([]);
  const [cnpj, setCnpj] = useState(() => localStorage.getItem(PENDING_COMPANY_CNPJ_KEY) ?? "");

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
      tipoUsuario: "2",
      telefones: [{ ddi: "55", ddd: "", numero: "", tipoTelefone: "1", observacoes: "" }],
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
            estado: {
              id: undefined,
              descricao: "",
              sigla: "",
            },
          },
          cep: "",
          observacoes: "",
        },
      ],
    },
  });

  const { isValid } = form.formState;
  const senhaNova = form.watch("senhaNova");
  const confirmSenhaNova = form.watch("confirmSenhaNova");
  const passwordsMatch = Boolean(senhaNova && confirmSenhaNova && senhaNova === confirmSenhaNova);

  const phones = useFieldArray({
    control: form.control,
    name: "telefones",
  });

  const enderecos = useFieldArray({
    control: form.control,
    name: "enderecos",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [tTel, tLog, est, mun] = await Promise.all([
          utilsClient.api.getTiposTelefone(),
          utilsClient.api.getTiposLogradouro(),
          utilsClient.api.getEstados(),
          utilsClient.api.getMunicipios(),
        ]);
        setTiposTelefone(tTel);
        setTiposLogradouro(tLog);
        setEstados(est);
        setMunicipios(mun);
      } catch {
        setTiposTelefone([]);
        setTiposLogradouro([]);
        setEstados([]);
        setMunicipios([]);
      }
    };
    load();
  }, [utilsClient]);

  useEffect(() => {
    const c = document.getElementById("chatbot-container");
    if (c) c.remove();
  }, []);

  const resolveCnpj = () => {
    const fromInput = onlyDigits(cnpj);
    if (/^\d{14}$/.test(fromInput)) {
      localStorage.setItem(PENDING_COMPANY_CNPJ_KEY, fromInput);
      return fromInput;
    }
    const stored = localStorage.getItem(PENDING_COMPANY_CNPJ_KEY);
    if (stored && /^\d{14}$/.test(stored)) return stored;
    throw new Error("CNPJ obrigatório");
  };

  const onSubmit = async (values: UserRegistrationValues) => {
    try {
      const resolvedCnpj = resolveCnpj();

      if (values.senhaNova !== values.confirmSenhaNova) {
        throw new Error("As senhas não coincidem.");
      }

      const empresa = await apiClient.api.searchEmpresaByCnpj(resolvedCnpj);
      if (!empresa) {
        throw new Error("Empresa não encontrada para o CNPJ informado. Cadastre a empresa antes de criar o usuário.");
      }

      const parsedTipoUsuario = Number(values.tipoUsuario);
      const tipoUsuario = (Number.isFinite(parsedTipoUsuario) ? parsedTipoUsuario : 2) as TipoUsuarioEnum;
      const nowIso = new Date().toISOString();

      const usuario: Usuario = {
        nome: values.nome,
        login: values.login,
        email: values.email,
        senhaAtual: values.senhaNova,
        senhaNova: values.senhaNova,
        autenticado: true,
        authToken: "",
        mensagem: "",
        senhaExpirada: false,
        sessaoRegistrada: true,
        cargo: values.cargo,
        departamento: values.departamento?.trim() ? values.departamento : undefined,
        aceiteLGPD: values.aceiteLGPD,
        tipoUsuario,
        telefones: values.telefones.map((t) => ({
          ddi: onlyDigits(t.ddi),
          ddd: onlyDigits(t.ddd),
          numero: onlyDigits(t.numero),
          tipoTelefone: Number(t.tipoTelefone) as TipoTelefone,
          observacoes: t.observacoes?.trim() ? t.observacoes : undefined,
        })),
        enderecos: [],
        dataCadastro: nowIso,
        dataAlteracaoSenha: nowIso,
      };

      const payload = {
        cnpj: resolvedCnpj,
        usuario,
      };

      const authOk = await apiClient.api.isAuthenticated().catch(() => false);
      if (!authOk) {
        throw new Error("Sessão não validada. Faça login novamente (cookie/token) antes de cadastrar usuário.");
      }

      const result = await apiClient.api.upsertAdminEmpresa(payload);

      if (currentUser?.role === "ADMIN_SISTEMA") {
        toast({ title: "Usuário cadastrado", description: "Cadastro finalizado com sucesso." });
        navigate("/listagem-usuarios");
        return;
      }

      await login({ login: values.login, password: values.senhaNova });

      toast({ title: "Usuário cadastrado", description: "Cadastro finalizado com sucesso." });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar usuário",
        description: error instanceof Error ? error.message : "Não foi possível cadastrar o usuário.",
        variant: "destructive",
      });
    }
  };

  const left = (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="text-center flex flex-col items-center scale-[0.85]">
        <div className="flex items-center gap-2 mb-6">
          <Logo size="lg" className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Cadastro do usuário</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 minimal-scroll pr-1 space-y-6 pb-6">
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-foreground block">CNPJ da empresa</FormLabel>
              <FormControl>
                <Field>
                  <Building2 aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="pl-10"
                    inputMode="numeric"
                  />
                </Field>
              </FormControl>
            </FormItem>

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
                      <Input placeholder="Digite seu usuário de login" autoComplete="username" className="pl-10" {...field} />
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
                    <Select value="2" onValueChange={() => field.onChange("2")} disabled>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Administrador de Empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2">Administrador de Empresa</SelectItem>
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
                                <Input placeholder="00" inputMode="numeric" {...field} />
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
                                  <Input placeholder="000000000" inputMode="numeric" className="pl-10" {...field} />
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
                                  {tiposTelefone.map((t) => (
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

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">Endereços</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
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
                    className="h-9"
                  >
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-4">
                  {enderecos.fields.map((f, idx) => {
                    const uf = form.watch(`enderecos.${idx}.municipio.estado.sigla`) || "";
                    const municipiosUf = uf
                      ? municipios.filter((m) => (m.estado?.sigla ?? "").toUpperCase() === uf.toUpperCase())
                      : [];

                    return (
                      <div key={f.id} className="space-y-3 border border-border/50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">Endereço {idx + 1}</p>
                          {enderecos.fields.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => enderecos.remove(idx)}>
                              Remover
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`enderecos.${idx}.tipoLogradouro`}
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-foreground block">Tipo de logradouro</FormLabel>
                                <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
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
                            control={form.control}
                            name={`enderecos.${idx}.cep`}
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
                        </div>

                        <FormField
                          control={form.control}
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
                            control={form.control}
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
                            control={form.control}
                            name={`enderecos.${idx}.complemento`}
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-foreground block">Complemento</FormLabel>
                                <FormControl>
                                  <Input placeholder="Sala 10" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
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
                            control={form.control}
                            name={`enderecos.${idx}.municipio.estado.sigla`}
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-foreground block">UF</FormLabel>
                                <Select
                                  value={field.value ?? ""}
                                  onValueChange={(sigla) => {
                                    const estado = estados.find((e) => (e.sigla ?? "").toUpperCase() === sigla.toUpperCase());
                                    form.setValue(`enderecos.${idx}.municipio.estado.sigla`, sigla.toUpperCase());
                                    form.setValue(`enderecos.${idx}.municipio.estado.id`, estado?.id);
                                    form.setValue(`enderecos.${idx}.municipio.estado.descricao`, estado?.descricao ?? "");
                                    form.setValue(`enderecos.${idx}.municipio.id`, undefined);
                                    form.setValue(`enderecos.${idx}.municipio.descricao`, "");
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
                            control={form.control}
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
                                    form.setValue(`enderecos.${idx}.municipio.descricao`, municipio?.descricao ?? "");
                                    form.setValue(`enderecos.${idx}.municipio.estado.id`, municipio?.estado?.id);
                                    form.setValue(`enderecos.${idx}.municipio.estado.descricao`, municipio?.estado?.descricao ?? "");
                                    form.setValue(`enderecos.${idx}.municipio.estado.sigla`, (municipio?.estado?.sigla ?? uf).toUpperCase());
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
                          control={form.control}
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

          <div className="shrink-0 pt-4 border-t border-border/50 bg-transparent dark:bg-background/60 dark:backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" className="w-full h-11" onClick={() => navigate("/listagem-usuarios")}>
                Fechar
              </Button>
              <Button
                type="submit"
                variant="default"
                className="w-full font-semibold h-11"
                disabled={isLoading || !isValid || !passwordsMatch}
              >
                {isLoading ? "Finalizando..." : "Finalizar cadastro"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-hero-start to-hero-end">
      <Dialog open onOpenChange={(open) => (!open ? navigate("/listagem-usuarios") : undefined)}>
        <DialogContent className="w-full max-w-5xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] p-0 overflow-hidden bg-card dark:bg-background/80 dark:backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50">
          <div className="w-full h-full p-6 sm:p-8 lg:p-10 flex flex-col min-h-0">{left}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicUserRegistration;
