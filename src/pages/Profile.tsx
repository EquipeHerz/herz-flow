import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { profileUpdateSchema, type ProfileUpdateValues } from "@/validation/profileUpdate";
import { onlyDigits } from "@/validation/userRegistration";
import { ApiError } from "@/services/http/apiError";
import { mapApiUsuarioToUiUser } from "@/services/sistemaLoginBack/mapToUiUser";
import { createSistemaLoginBackClient, type EmpresaModel, type TipoTelefone, type Usuario } from "@/services/sistemaLoginBack";
import { createSistemaUtilsBackClient, type DescricaoID, type EstadoModel, type MunicipioModel } from "@/services/sistemaUtilsBack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Briefcase, Edit2, Mail, MapPin, Plus, Shield, Trash2, User } from "lucide-react";
import FloatingElements from "@/components/FloatingElements";
import { useNavigate } from "react-router-dom";

const normalizeEnderecoForDisplay = (usuario: Usuario | null, fallback: { city?: string; state?: string } | null) => {
  const endereco = usuario?.enderecos?.[0];
  const city = endereco?.municipio?.descricao ?? endereco?.municipio?.nome ?? fallback?.city ?? "";
  const state = endereco?.municipio?.estado?.sigla ?? fallback?.state ?? "";
  const zipCode = endereco?.cep ?? "";
  const street = endereco?.nomeLogradouro ?? "";
  const number = endereco?.numero ?? "";
  const neighborhood = endereco?.bairro ?? "";
  return { street, number, neighborhood, city, state, zipCode };
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiUsuario, setApiUsuario] = useState<Usuario | null>(null);
  const [isUsuarioLoading, setIsUsuarioLoading] = useState(false);
  const [usuarioLoadError, setUsuarioLoadError] = useState("");
  const [passwordValidationState, setPasswordValidationState] = useState<"idle" | "validating" | "valid" | "invalid">(
    "idle"
  );
  const [passwordValidationMessage, setPasswordValidationMessage] = useState("");

  const apiClient = useMemo(() => createSistemaLoginBackClient(), []);
  const utilsClient = useMemo(() => createSistemaUtilsBackClient(), []);
  const [tiposTelefone, setTiposTelefone] = useState<DescricaoID[]>([]);
  const [tiposLogradouro, setTiposLogradouro] = useState<DescricaoID[]>([]);
  const [estados, setEstados] = useState<EstadoModel[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioModel[]>([]);
  const [companies, setCompanies] = useState<EmpresaModel[]>([]);
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string>("");
  const [selectedCnpj, setSelectedCnpj] = useState<string>("");
  const originalValuesRef = useRef<ProfileUpdateValues | null>(null);

  const formatDatePtBr = (value: string | undefined) => {
    if (!value) return "-";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [yyyy, mm, dd] = value.split("-");
      return `${dd}/${mm}/${yyyy}`;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pt-BR");
  };

  const safeStringify = (data: unknown) => {
    try {
      const s = JSON.stringify(data);
      if (!s) return "";
      return s.length > 1400 ? `${s.slice(0, 1400)}...` : s;
    } catch {
      return "";
    }
  };

  const displayUser = useMemo(() => {
    if (!user) return null;
    if (!apiUsuario) return user;
    const mapped = mapApiUsuarioToUiUser(apiUsuario);
    const merged = { ...user, ...mapped };

    const preferNonEmpty = (value: string | undefined, fallback: string | undefined) =>
      value && value.trim() ? value : fallback ?? "";

    merged.name = preferNonEmpty(mapped.name, user.name);
    merged.username = preferNonEmpty(mapped.username, user.username);
    merged.email = preferNonEmpty(mapped.email, user.email);
    merged.cpf = preferNonEmpty(mapped.cpf, user.cpf);
    merged.phone = preferNonEmpty(mapped.phone, user.phone);
    merged.position = preferNonEmpty(mapped.position, user.position);
    merged.department = preferNonEmpty(mapped.department, user.department);
    merged.birthDate = preferNonEmpty(mapped.birthDate, user.birthDate);

    const addr = mapped.address;
    const hasAddressData = Boolean(
      addr?.street?.trim() ||
        addr?.number?.trim() ||
        addr?.neighborhood?.trim() ||
        addr?.city?.trim() ||
        addr?.state?.trim() ||
        addr?.zipCode?.trim()
    );
    if (!hasAddressData) merged.address = user.address;

    return merged;
  }, [user, apiUsuario]);

  const form = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nome: "",
      login: "",
      email: "",
      cpf: "",
      dataNascimento: "",
      cargo: "",
      departamento: "",
      aceiteLGPD: false,
      telefones: [{ ddi: "55", ddd: "", numero: "", tipoTelefone: "1", observacoes: "" }],
      enderecos: [],
      alterarSenha: false,
      senhaConfirmacao: "",
      senhaAtual: "",
      senhaNova: "",
      confirmSenhaNova: "",
    },
  });

  const phones = useFieldArray({ control: form.control, name: "telefones" });
  const enderecosFieldArray = useFieldArray({ control: form.control, name: "enderecos" });

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
    if (!user?.id) return;
    let isCancelled = false;
    const load = async () => {
      setIsUsuarioLoading(true);
      setUsuarioLoadError("");
      try {
        const full = await apiClient.api.getUserById(user.id);
        if (isCancelled) return;
        setApiUsuario(full);
      } catch (err) {
        if (isCancelled) return;
        const apiErr = ApiError.fromUnknown(err);
        setApiUsuario(null);
        setUsuarioLoadError(apiErr.message || "Não foi possível carregar seus dados.");
      } finally {
        if (!isCancelled) setIsUsuarioLoading(false);
      }
    };
    load();
    return () => {
      isCancelled = true;
    };
  }, [apiClient, user?.id]);

  useEffect(() => {
    if (!isEditOpen) return;
    if (!user) return;

    const currentDigits = onlyDigits(selectedCnpj || user.cnpj || "");
    const needsCompanySelect = user.role === "ADMIN_SISTEMA" && !/^\d{14}$/.test(currentDigits);
    if (!needsCompanySelect) return;

    let isCancelled = false;
    const load = async () => {
      setIsCompaniesLoading(true);
      setCompaniesError("");
      try {
        const list = await apiClient.api.listEmpresasFromBusca();
        if (isCancelled) return;
        setCompanies(list);
      } catch (err) {
        if (isCancelled) return;
        const apiErr = ApiError.fromUnknown(err);
        setCompanies([]);
        setCompaniesError(apiErr.message || "Não foi possível carregar as empresas.");
      } finally {
        if (!isCancelled) setIsCompaniesLoading(false);
      }
    };
    load();
    return () => {
      isCancelled = true;
    };
  }, [apiClient, isEditOpen, selectedCnpj, user]);

  const mapUsuarioToFormValues = (usuario: Usuario): ProfileUpdateValues => {
    const telefones =
      usuario.telefones && usuario.telefones.length
        ? usuario.telefones.map((t) => ({
            ddi: onlyDigits(String(t.ddi ?? "")) || "55",
            ddd: onlyDigits(String(t.ddd ?? "")),
            numero: onlyDigits(String(t.numero ?? "")),
            tipoTelefone: String(t.tipoTelefone ?? 1),
            observacoes: String(t.observacoes ?? ""),
          }))
        : [{ ddi: "55", ddd: "", numero: "", tipoTelefone: "1", observacoes: "" }];

    const enderecos =
      usuario.enderecos && usuario.enderecos.length
        ? usuario.enderecos.map((e) => ({
            id: e.id,
            tipoLogradouro: e.tipoLogradouro ?? 1,
            nomeLogradouro: String(e.nomeLogradouro ?? ""),
            numero: String(e.numero ?? ""),
            complemento: String(e.complemento ?? ""),
            bairro: String(e.bairro ?? ""),
            municipio: {
              id: Number(e.municipio?.id ?? 0),
              descricao: String(e.municipio?.descricao ?? e.municipio?.nome ?? ""),
              estado: {
                id: Number(e.municipio?.estado?.id ?? 0),
                descricao: String(e.municipio?.estado?.descricao ?? e.municipio?.estado?.nome ?? ""),
                sigla: String(e.municipio?.estado?.sigla ?? ""),
              },
            },
            cep: String(e.cep ?? ""),
            observacoes: String(e.observacoes ?? ""),
          }))
        : [];

    return {
      nome: String(usuario.nome ?? ""),
      login: String(usuario.login ?? ""),
      email: String(usuario.email ?? ""),
      cpf: String(usuario.cpf ?? ""),
      dataNascimento: String(usuario.dataNascimento ?? "").slice(0, 10),
      cargo: String(usuario.cargo ?? ""),
      departamento: String(usuario.departamento ?? ""),
      aceiteLGPD: Boolean(usuario.aceiteLGPD),
      telefones,
      enderecos,
      alterarSenha: false,
      senhaConfirmacao: "",
      senhaAtual: "",
      senhaNova: "",
      confirmSenhaNova: "",
    };
  };

  const handleEditClick = () => {
    if (!user) return;
    setSelectedCnpj(onlyDigits(user.cnpj ?? ""));
    const values = apiUsuario
      ? mapUsuarioToFormValues(apiUsuario)
      : {
          nome: user.name ?? "",
          login: user.username ?? "",
          email: user.email ?? "",
          cpf: user.cpf ?? "",
          dataNascimento: user.birthDate ?? "",
          cargo: user.position ?? "",
          departamento: user.department ?? "",
          aceiteLGPD: true,
          telefones: [{ ddi: "55", ddd: "", numero: onlyDigits(user.phone ?? ""), tipoTelefone: "1", observacoes: "" }],
          enderecos: [
            {
              id: undefined,
              tipoLogradouro: 1,
              nomeLogradouro: user.address?.street ?? "",
              numero: user.address?.number ?? "",
              complemento: user.address?.complement ?? "",
              bairro: user.address?.neighborhood ?? "",
              municipio: {
                id: 0,
                descricao: user.address?.city ?? "",
                estado: { id: 0, descricao: "", sigla: user.address?.state ?? "" },
              },
              cep: user.address?.zipCode ?? "",
              observacoes: "",
            },
          ],
          alterarSenha: false,
          senhaConfirmacao: "",
          senhaAtual: "",
          senhaNova: "",
          confirmSenhaNova: "",
        };

    originalValuesRef.current = values;
    form.reset(values);
    setPasswordValidationState("idle");
    setPasswordValidationMessage("");
    setIsEditOpen(true);
  };

  const buildPatchFromForm = (original: ProfileUpdateValues, current: ProfileUpdateValues) => {
    const patch: Partial<Usuario> = { id: user?.id };

    const addIfChanged = <K extends keyof ProfileUpdateValues>(key: K, mapper?: (v: ProfileUpdateValues[K]) => unknown) => {
      const a = mapper ? mapper(original[key]) : original[key];
      const b = mapper ? mapper(current[key]) : current[key];
      if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) {
        (patch as Record<string, unknown>)[String(key)] = b;
      }
    };

    addIfChanged("nome", (v) => String(v ?? "").trim());
    addIfChanged("login", (v) => String(v ?? "").trim());
    addIfChanged("email", (v) => String(v ?? "").trim());
    addIfChanged("cpf", (v) => onlyDigits(String(v ?? "")));
    addIfChanged("dataNascimento", (v) => String(v ?? "").slice(0, 10));
    addIfChanged("cargo", (v) => String(v ?? "").trim());
    addIfChanged("departamento", (v) => {
      const trimmed = String(v ?? "").trim();
      return trimmed ? trimmed : null;
    });
    addIfChanged("aceiteLGPD", (v) => Boolean(v));

    const normalizeTelefones = (values: ProfileUpdateValues["telefones"]) =>
      values.map((t) => ({
        ddi: onlyDigits(String(t.ddi ?? "")),
        ddd: onlyDigits(String(t.ddd ?? "")),
        numero: onlyDigits(String(t.numero ?? "")),
        tipoTelefone: Number(t.tipoTelefone) as TipoTelefone,
        observacoes: String(t.observacoes ?? "").trim() ? String(t.observacoes ?? "").trim() : null,
      }));

    const normalizeEnderecos = (values: ProfileUpdateValues["enderecos"]) =>
      values.map((e) => ({
        id: e.id,
        tipoLogradouro: e.tipoLogradouro,
        nomeLogradouro: String(e.nomeLogradouro ?? "").trim(),
        numero: String(e.numero ?? "").trim(),
        complemento: String(e.complemento ?? "").trim() ? String(e.complemento ?? "").trim() : null,
        bairro: String(e.bairro ?? "").trim(),
        municipio: {
          id: e.municipio.id,
          descricao: String(e.municipio.descricao ?? "").trim(),
          estado: {
            id: e.municipio.estado.id,
            descricao: String(e.municipio.estado.descricao ?? "").trim() || null,
            sigla: String(e.municipio.estado.sigla ?? "").trim(),
          },
        },
        cep: onlyDigits(String(e.cep ?? "")),
        observacoes: String(e.observacoes ?? "").trim() ? String(e.observacoes ?? "").trim() : null,
      }));

    const originalTelefones = normalizeTelefones(original.telefones);
    const currentTelefones = normalizeTelefones(current.telefones);
    if (JSON.stringify(originalTelefones) !== JSON.stringify(currentTelefones)) patch.telefones = currentTelefones;

    const originalEnderecos = normalizeEnderecos(original.enderecos);
    const currentEnderecos = normalizeEnderecos(current.enderecos);
    if (JSON.stringify(originalEnderecos) !== JSON.stringify(currentEnderecos)) patch.enderecos = currentEnderecos;

    const wantsPasswordChange = current.alterarSenha === true;
    if (wantsPasswordChange && passwordValidationState === "valid") {
      patch.senhaAtual = current.senhaAtual;
      patch.senhaNova = current.senhaNova;
    }

    const hasAnyChange =
      Object.keys(patch).some((k) => k !== "id" && k !== "telefones" && k !== "enderecos" && k !== "senhaAtual" && k !== "senhaNova") ||
      Boolean(patch.telefones) ||
      Boolean(patch.enderecos) ||
      Boolean(patch.senhaNova);

    return { patch, hasAnyChange, wantsPasswordChange };
  };

  const validateCurrentPassword = async () => {
    const alterarSenha = Boolean(form.getValues("alterarSenha"));
    if (!alterarSenha) {
      setPasswordValidationState("invalid");
      setPasswordValidationMessage("Ative a opção de alteração de senha para validar.");
      return;
    }
    const senhaAtual = String(form.getValues("senhaAtual") ?? "");
    const loginValue = String(form.getValues("login") ?? "");
    if (!senhaAtual.trim() || !loginValue.trim()) {
      setPasswordValidationState("invalid");
      setPasswordValidationMessage("Informe login e senha atual.");
      return;
    }

    setPasswordValidationState("validating");
    setPasswordValidationMessage("");
    try {
      const result = await apiClient.api.login({ login: loginValue, password: senhaAtual });
      const msg = String(result.user.mensagem ?? "").trim();
      const looksSuccess = msg.toLowerCase().includes("sucesso");
      const ok = result.user.autenticado !== false && (looksSuccess || !msg);

      if (!ok) {
        setPasswordValidationState("invalid");
        setPasswordValidationMessage(msg || "Senha atual inválida.");
        return;
      }

      setPasswordValidationState("valid");
      setPasswordValidationMessage("Senha atual validada.");
    } catch (err) {
      const apiErr = ApiError.fromUnknown(err);
      setPasswordValidationState("invalid");
      setPasswordValidationMessage(apiErr.message || "Não foi possível validar a senha atual.");
    }
  };

  const onEditSubmit = async (values: ProfileUpdateValues) => {
    if (!user?.id) return;
    const original = originalValuesRef.current;
    if (!original) return;

    const { hasAnyChange, wantsPasswordChange } = buildPatchFromForm(original, values);
    if (!hasAnyChange) {
      toast({ title: "Sem alterações", description: "Nenhum campo foi modificado." });
      setIsEditOpen(false);
      return;
    }

    if (wantsPasswordChange && passwordValidationState !== "valid") {
      toast({
        title: "Validação de senha",
        description: "Valide a senha atual antes de alterar a senha.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const cnpjDigits = onlyDigits(String(selectedCnpj || user.cnpj || ""));
      if (!/^\d{14}$/.test(cnpjDigits)) {
        throw new Error("CNPJ da empresa não encontrado para atualizar o perfil.");
      }

      const nowIso = new Date().toISOString();

      const normalizeTelefones = (list: ProfileUpdateValues["telefones"]) =>
        list.map((t) => ({
          ddi: onlyDigits(String(t.ddi ?? "")),
          ddd: onlyDigits(String(t.ddd ?? "")),
          numero: onlyDigits(String(t.numero ?? "")),
          tipoTelefone: Number(t.tipoTelefone) as TipoTelefone,
          observacoes: String(t.observacoes ?? "").trim() ? String(t.observacoes ?? "").trim() : null,
        }));

      const normalizeEnderecos = (list: ProfileUpdateValues["enderecos"]) =>
        list.map((e) => ({
          id: e.id,
          tipoLogradouro: e.tipoLogradouro,
          nomeLogradouro: String(e.nomeLogradouro ?? "").trim(),
          numero: String(e.numero ?? "").trim(),
          complemento: String(e.complemento ?? "").trim() ? String(e.complemento ?? "").trim() : null,
          bairro: String(e.bairro ?? "").trim(),
          municipio: {
            id: e.municipio.id,
            descricao: String(e.municipio.descricao ?? "").trim(),
            estado: {
              id: e.municipio.estado.id,
              descricao: String(e.municipio.estado.descricao ?? "").trim() || null,
              sigla: String(e.municipio.estado.sigla ?? "").trim(),
            },
          },
          cep: onlyDigits(String(e.cep ?? "")),
          observacoes: String(e.observacoes ?? "").trim() ? String(e.observacoes ?? "").trim() : null,
        }));

      const tipoUsuarioFromRole = user.role === "ADMIN_SISTEMA" ? 1 : 2;
      const base = apiUsuario ?? ({ id: user.id } as Usuario);
      const departamentoTrimmed = String(values.departamento ?? "").trim();
      const updatedUsuario: Usuario & { datanascimento?: string | null } = {
        ...base,
        id: user.id,
        nome: String(values.nome ?? "").trim(),
        login: String(values.login ?? "").trim(),
        email: String(values.email ?? "").trim(),
        cpf: onlyDigits(String(values.cpf ?? "")),
        dataNascimento: String(values.dataNascimento ?? "").slice(0, 10),
        datanascimento: String(values.dataNascimento ?? "").slice(0, 10),
        cargo: String(values.cargo ?? "").trim(),
        departamento: departamentoTrimmed ? departamentoTrimmed : null,
        aceiteLGPD: Boolean(values.aceiteLGPD),
        tipoUsuario: (base.tipoUsuario ?? user.tipoUsuario ?? tipoUsuarioFromRole) as any,
        telefones: normalizeTelefones(values.telefones),
        enderecos: normalizeEnderecos(values.enderecos),
        autenticado: true,
        authToken: "",
        mensagem: "",
        senhaExpirada: false,
        sessaoRegistrada: true,
        dataCadastro: base.dataCadastro ?? nowIso,
        dataAlteracaoSenha: nowIso,
      };

      if (wantsPasswordChange) {
        updatedUsuario.senhaAtual = String(values.senhaAtual ?? "");
        updatedUsuario.senhaNova = String(values.senhaNova ?? "");
        updatedUsuario.dataAlteracaoSenha = nowIso;
      } else {
        const senhaConfirmacao = String(values.senhaConfirmacao ?? "").trim();
        if (senhaConfirmacao) {
          updatedUsuario.senhaAtual = senhaConfirmacao;
          updatedUsuario.senhaNova = senhaConfirmacao;
        } else {
          updatedUsuario.senhaAtual = null;
          updatedUsuario.senhaNova = null;
        }
      }

      const result = await apiClient.api.upsertAdminEmpresaPost({ usuario: updatedUsuario, cnpj: cnpjDigits });
      if (result && result.result === false) {
        throw new Error(result.message?.trim() ? String(result.message) : "Atualização não confirmada pela API.");
      }

      const refreshed = await apiClient.api.getUserById(user.id);
      if (refreshed) {
        setApiUsuario(refreshed);
        const mapped = mapApiUsuarioToUiUser(refreshed);
        await updateUser(mapped);
      }

      toast({ title: "Perfil atualizado", description: "Suas informações foram salvas com sucesso." });
      setIsEditOpen(false);
    } catch (err) {
      const apiErr = ApiError.fromUnknown(err);
      const title =
        apiErr.kind === "http" && apiErr.status === 401
          ? "Não autorizado"
          : apiErr.kind === "http" && apiErr.status === 400
            ? "Erro de validação"
            : apiErr.kind === "http" && apiErr.status >= 500
              ? "Erro no servidor"
              : "Erro ao atualizar";

      if (originalValuesRef.current) {
        form.reset(originalValuesRef.current);
      }
      setPasswordValidationState("idle");
      setPasswordValidationMessage("");

      const meta =
        apiErr.kind === "http"
          ? ` (HTTP ${apiErr.status ?? "-"} ${apiErr.method ?? ""} ${apiErr.url ?? ""})`
          : apiErr.kind
            ? ` (${apiErr.kind})`
            : "";
      const dataDump = apiErr.data ? safeStringify(apiErr.data) : "";
      const fullMessage = `${apiErr.message || "Não foi possível salvar suas alterações."}${meta}${dataDump ? ` | ${dataDump}` : ""}`;

      toast({
        title,
        description: fullMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const u = displayUser ?? user;
  const addressFallback = normalizeEnderecoForDisplay(apiUsuario, { city: user.address?.city, state: user.address?.state });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Meu Perfil" subtitle="Visualize e gerencie suas informações pessoais" />

      <main className="flex-1 flex justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl space-y-6">
          <Card className="shadow-lg overflow-hidden border-t-4 border-t-primary">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-32 md:h-48 relative overflow-hidden">
              <FloatingElements className="absolute inset-0" />
            </div>

            <CardHeader className="px-6 md:px-10 pb-6 pt-0">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="-mt-16 flex-shrink-0">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                    <AvatarImage src={u.avatar} alt={u.name} />
                    <AvatarFallback className="text-4xl">{u.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mt-2 md:mt-0">
                  <div className="text-center md:text-left space-y-1">
                    <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">{u.name}</CardTitle>
                    <CardDescription className="text-lg font-medium text-primary flex flex-wrap justify-center md:justify-start items-center gap-2">
                      {u.position}
                      <Badge variant="outline" className="capitalize">
                        {u.role.replace("ADMIN_", "").replace("_", " ")}
                      </Badge>
                    </CardDescription>
                  </div>
                  <Button onClick={handleEditClick} className="flex-shrink-0" disabled={isUsuarioLoading}>
                    <Edit2 className="mr-2 h-4 w-4" /> Editar Perfil
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 md:px-10 pb-10 space-y-8">
              {usuarioLoadError && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-900/30">
                  <p className="text-sm text-red-700 dark:text-red-300">{usuarioLoadError}</p>
                </div>
              )}

              {u.bio && (
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                  <p className="text-muted-foreground italic">"{u.bio}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <User className="h-5 w-5 text-primary" /> Informações Pessoais
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Nome Completo</Label>
                      <span className="font-medium">{u.name}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">CPF</Label>
                      <span className="font-medium">{u.cpf?.trim() ? u.cpf : "-"}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Nascimento</Label>
                      <span className="font-medium">{formatDatePtBr(u.birthDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <Mail className="h-5 w-5 text-primary" /> Contato
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Email</Label>
                      <span className="font-medium">{u.email}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Telefone</Label>
                      <span className="font-medium">{u.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <Briefcase className="h-5 w-5 text-primary" /> Dados Profissionais
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Departamento</Label>
                      <span className="font-medium">{u.department}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <Label className="text-muted-foreground">Admissão</Label>
                      <span className="font-medium">{formatDatePtBr(u.admissionDate)}</span>
                    </div>
                    {(u.companyName || u.cnpj) && (
                      <>
                        {u.companyName && (
                          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                            <Label className="text-muted-foreground">Empresa</Label>
                            <span className="font-medium">{u.companyName}</span>
                          </div>
                        )}
                        {u.cnpj && (
                          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                            <Label className="text-muted-foreground">CNPJ</Label>
                            <span className="font-medium">{u.cnpj}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <MapPin className="h-5 w-5 text-primary" /> Endereço
                  </h3>

                  <div className="space-y-1">
                    <p className="font-medium">
                      {addressFallback.street?.trim() ? `${addressFallback.street}, ${addressFallback.number}` : "-"}
                    </p>
                    <p className="text-muted-foreground">{addressFallback.neighborhood?.trim() ? addressFallback.neighborhood : "-"}</p>
                    <p className="text-muted-foreground">{addressFallback.city?.trim() ? `${addressFallback.city} - ${addressFallback.state}` : "-"}</p>
                    <p className="text-muted-foreground text-sm">CEP: {addressFallback.zipCode?.trim() ? addressFallback.zipCode : "-"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Segurança da Conta
                </h3>
                <div className="flex items-center gap-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Alterar Senha</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Valide a senha atual para liberar a alteração.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleEditClick}
                    className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-200"
                    disabled={isUsuarioLoading}
                  >
                    Redefinir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-full max-w-5xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] p-0 overflow-hidden bg-card dark:bg-background/80 dark:backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50">
          <div className="w-full h-full p-6 sm:p-8 lg:p-10 flex flex-col min-h-0">
            <DialogHeader className="shrink-0">
              <DialogTitle>Editar Perfil</DialogTitle>
              <DialogDescription>Apenas os campos modificados serão enviados para atualização.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form id="edit-profile-form" onSubmit={form.handleSubmit(onEditSubmit)} className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0 minimal-scroll pr-1 space-y-8 pb-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Dados do Usuário</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={originalValuesRef.current?.nome ?? ""} disabled={isSaving} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="login"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Login</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={originalValuesRef.current?.login ?? ""} disabled={isSaving} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={originalValuesRef.current?.email ?? ""} disabled={isSaving} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={originalValuesRef.current?.cpf ?? ""} disabled={isSaving} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input value={u.companyName ?? ""} disabled />
                      </FormControl>
                    </FormItem>

                    {user?.role === "ADMIN_SISTEMA" && !/^\d{14}$/.test(onlyDigits(selectedCnpj || u.cnpj || "")) ? (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <Select
                          value={selectedCnpj}
                          onValueChange={(v) => {
                            if (v === "__create_company__") {
                              setIsEditOpen(false);
                              navigate("/registro-empresa");
                              return;
                            }
                            setSelectedCnpj(v);
                          }}
                          disabled={isSaving || isCompaniesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={isCompaniesLoading ? "Carregando empresas..." : "Selecione a empresa"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__create_company__">Cadastrar empresa</SelectItem>
                            {companies
                              .map((c) => {
                                const digits = onlyDigits(String(c.cnpj ?? ""));
                                if (!digits) return null;
                                const label = `${c.nomeFantasia ?? c.nomeOficial ?? "Empresa"} - ${digits}`;
                                return (
                                  <SelectItem key={String(c.id ?? digits)} value={digits}>
                                    {label}
                                  </SelectItem>
                                );
                              })
                              .filter(Boolean)}
                          </SelectContent>
                        </Select>
                        {companiesError ? <p className="text-sm text-destructive">{companiesError}</p> : null}
                      </FormItem>
                    ) : (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input value={selectedCnpj || u.cnpj || ""} disabled />
                        </FormControl>
                      </FormItem>
                    )}

                    <FormField
                      control={form.control}
                      name="dataNascimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} disabled={isSaving} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cargo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={originalValuesRef.current?.cargo ?? ""} disabled={isSaving} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="departamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={originalValuesRef.current?.departamento ?? ""} disabled={isSaving} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="aceiteLGPD"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSaving} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Aceite LGPD</FormLabel>
                          <p className="text-sm text-muted-foreground">Necessário para manter seu cadastro ativo.</p>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground">Telefones</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => phones.append({ ddi: "55", ddd: "", numero: "", tipoTelefone: "1", observacoes: "" })}
                        disabled={isSaving}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Adicionar telefone
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {phones.fields.map((p, index) => (
                        <div key={p.id} className="rounded-xl border border-border/50 bg-muted/10 p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Telefone {index + 1}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => phones.remove(index)}
                              disabled={isSaving || phones.fields.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <FormField
                              control={form.control}
                              name={`telefones.${index}.ddi`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>DDI</FormLabel>
                                  <FormControl>
                                    <Input {...field} disabled={isSaving} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`telefones.${index}.ddd`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>DDD</FormLabel>
                                  <FormControl>
                                    <Input {...field} disabled={isSaving} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`telefones.${index}.numero`}
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>Número</FormLabel>
                                  <FormControl>
                                    <Input {...field} disabled={isSaving} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`telefones.${index}.tipoTelefone`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo</FormLabel>
                                  <FormControl>
                                    <Select value={String(field.value)} onValueChange={field.onChange} disabled={isSaving}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(tiposTelefone.length ? tiposTelefone : [{ id: 1, descricao: "Telefone" }]).map((t) => (
                                          <SelectItem key={t.id} value={String(t.id)}>
                                            {t.descricao}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`telefones.${index}.observacoes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Observações</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Endereços</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        enderecosFieldArray.append({
                          id: undefined,
                          tipoLogradouro: 1,
                          nomeLogradouro: "",
                          numero: "",
                          complemento: "",
                          bairro: "",
                          municipio: { id: 0, descricao: "", estado: { id: 0, descricao: "", sigla: "" } },
                          cep: "",
                          observacoes: "",
                        })
                      }
                      disabled={isSaving}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Adicionar endereço
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {enderecosFieldArray.fields.map((e, index) => (
                      <div key={e.id ?? index} className="rounded-lg border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Endereço {index + 1}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => enderecosFieldArray.remove(index)}
                            disabled={isSaving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`enderecos.${index}.cep`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CEP</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`enderecos.${index}.tipoLogradouro`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <FormControl>
                                  <Select
                                    value={String(field.value ?? 1)}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    disabled={isSaving}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(tiposLogradouro.length ? tiposLogradouro : [{ id: 1, descricao: "Logradouro" }]).map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                          {t.descricao}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`enderecos.${index}.nomeLogradouro`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Logradouro</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`enderecos.${index}.numero`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`enderecos.${index}.complemento`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Complemento</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`enderecos.${index}.bairro`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bairro</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`enderecos.${index}.municipio.id`}
                          render={({ field }) => {
                            const selectedId = Number(field.value ?? 0);
                            return (
                              <FormItem>
                                <FormLabel>Município</FormLabel>
                                <FormControl>
                                  <Select
                                    value={selectedId ? String(selectedId) : ""}
                                    onValueChange={(v) => {
                                      const id = Number(v);
                                      field.onChange(id);

                                      const selected = municipios.find((m) => m.id === id);
                                      const estado = selected?.estado ?? estados.find((e2) => e2.id === selected?.estado?.id) ?? undefined;

                                      form.setValue(`enderecos.${index}.municipio.descricao`, String(selected?.descricao ?? ""));
                                      form.setValue(`enderecos.${index}.municipio.estado.id`, Number(estado?.id ?? 0));
                                      form.setValue(`enderecos.${index}.municipio.estado.descricao`, String(estado?.descricao ?? ""));
                                      form.setValue(`enderecos.${index}.municipio.estado.sigla`, String(estado?.sigla ?? ""));
                                    }}
                                    disabled={isSaving}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {municipios.slice(0, 200).map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                          {m.descricao ?? `Município ${m.id}`}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        <FormField
                          control={form.control}
                          name={`enderecos.${index}.observacoes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={isSaving} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">Alteração de Senha</h3>

                  <div className="rounded-xl border border-border/50 bg-muted/10 p-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="alterarSenha"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(v) => {
                                const next = Boolean(v);
                                field.onChange(next);
                                setPasswordValidationState("idle");
                                setPasswordValidationMessage("");
                                if (!next) {
                                  form.setValue("senhaConfirmacao", "");
                                  form.setValue("senhaAtual", "");
                                  form.setValue("senhaNova", "");
                                  form.setValue("confirmSenhaNova", "");
                                } else {
                                  form.setValue("senhaConfirmacao", "");
                                }
                              }}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Quero alterar minha senha</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Para sua segurança, valide a senha atual antes de definir a nova senha.
                            </p>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {Boolean(form.watch("alterarSenha")) && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <FormField
                            control={form.control}
                            name="senhaAtual"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Senha atual</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    {...field}
                                    disabled={isSaving || passwordValidationState === "validating"}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      if (passwordValidationState === "valid") {
                                        setPasswordValidationState("idle");
                                        setPasswordValidationMessage("");
                                        form.setValue("senhaNova", "");
                                        form.setValue("confirmSenhaNova", "");
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="button"
                            onClick={validateCurrentPassword}
                            disabled={isSaving || passwordValidationState === "validating"}
                          >
                            {passwordValidationState === "validating" && (
                              <div className="mr-2 h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                            )}
                            Validar senha
                          </Button>
                        </div>

                        {passwordValidationMessage && (
                          <p
                            className={
                              passwordValidationState === "valid"
                                ? "text-sm text-green-700"
                                : passwordValidationState === "invalid"
                                  ? "text-sm text-red-700"
                                  : "text-sm text-muted-foreground"
                            }
                          >
                            {passwordValidationMessage}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="senhaNova"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nova senha</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} disabled={isSaving || passwordValidationState !== "valid"} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="confirmSenhaNova"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirmar nova senha</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} disabled={isSaving || passwordValidationState !== "valid"} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}
                    {!Boolean(form.watch("alterarSenha")) && (
                      <FormField
                        control={form.control}
                        name="senhaConfirmacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha atual (se a API exigir)</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} disabled={isSaving} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
                </div>

                <div className="shrink-0 pt-4 border-t border-border/50 bg-transparent dark:bg-background/60 dark:backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="button" variant="outline" className="w-full h-11" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="default" className="w-full font-semibold h-11" disabled={isSaving}>
                      {isSaving && (
                        <div className="mr-2 h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
