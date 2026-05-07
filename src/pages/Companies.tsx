import React, { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, FileSpreadsheet, FileText, Search, Landmark, Building2, Globe, MapPin, User, Mail, Briefcase } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Field } from "@/styles/components/Field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { companyRegistrationSchema, onlyDigits, type CompanyRegistrationValues } from "@/validation/companyRegistration";
import { createSistemaLoginBackClient, type EmpresaModel } from "@/services/sistemaLoginBack";
import { createSistemaUtilsBackClient, type DescricaoID, type EstadoModel, type MunicipioModel } from "@/services/sistemaUtilsBack";
import { allowOnlyDigitsKeyDown, digitsOnly, formatCnpj } from "@/utils/inputMasks";

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

const Companies = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const apiClient = useMemo(() => createSistemaLoginBackClient(), []);
  const utilsClient = useMemo(() => createSistemaUtilsBackClient(), []);
  const [companies, setCompanies] = useState<EmpresaModel[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState<EmpresaModel | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tiposLogradouro, setTiposLogradouro] = useState<DescricaoID[]>([]);
  const [estados, setEstados] = useState<EstadoModel[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioModel[]>([]);

  const editForm = useForm<CompanyRegistrationValues>({
    resolver: zodResolver(companyRegistrationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaults(""),
  });

  const enderecos = useFieldArray({
    control: editForm.control,
    name: "enderecos",
  });

  const empresaToFormValues = (empresa: EmpresaModel): CompanyRegistrationValues => {
    const cnpjDigits = digitsOnly(empresa.cnpj ?? "");
    const endereco = empresa.endereco;
    return {
      cnpj: formatCnpj(cnpjDigits),
      nomeOficial: empresa.nomeOficial ?? "",
      nomeFantasia: empresa.nomeFantasia ?? "",
      webSite: empresa.webSite ?? "",
      experiencia: empresa.experiencia ?? "",
      enderecos: [
        {
          tipoLogradouro: endereco?.tipoLogradouro ?? 1,
          nomeLogradouro: endereco?.nomeLogradouro ?? "",
          numero: endereco?.numero ?? "",
          complemento: endereco?.complemento ?? "",
          bairro: endereco?.bairro ?? "",
          municipio: {
            id: endereco?.municipio?.id as any,
            descricao: endereco?.municipio?.descricao ?? "",
            estado: {
              id: endereco?.municipio?.estado?.id as any,
              descricao: endereco?.municipio?.estado?.descricao ?? "",
              sigla: endereco?.municipio?.estado?.sigla ?? "",
            },
          },
          cep: endereco?.cep ?? "",
          observacoes: endereco?.observacoes ?? "",
        },
      ],
      responsavelLegalNome: empresa.responsavelLegalNome ?? "",
      responsavelLegalCPF: empresa.responsavelLegalCPF ?? "",
      responsavelLegalRG: empresa.responsavelLegalRG ?? "",
      responsavelLegalCargo: empresa.responsavelLegalCargo ?? "",
      responsavelLegalEmail: empresa.responsavelLegalEmail ?? "",
    };
  };

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

  const loadCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const list = await apiClient.api.listEmpresasFromBusca();
      setCompanies(list);
    } catch (e) {
      setCompanies([]);
      toast({
        title: "Erro ao carregar empresas",
        description: e instanceof Error ? e.message : "Não foi possível carregar a lista de empresas.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [apiClient]);

  const handleCreateClick = () => {
    navigate("/registro-empresa");
  };

  const handleEditClick = (company: EmpresaModel) => {
    setEditingCompany(company);
    editForm.reset(empresaToFormValues(company));
    setIsEditOpen(true);
  };

  const handleDeleteClick = () => {
    toast({
      title: "Ação não disponível",
      description: "Ainda não há endpoint de desativação/exclusão de empresa na API.",
    });
  };

  const exportToExcel = () => {
    if (companies.length === 0) {
      toast({ title: "Nada para exportar", description: "Nenhuma empresa encontrada." });
      return;
    }
    const ws = XLSX.utils.json_to_sheet(companies.map(c => ({
      'Razão Social': c.nomeOficial ?? "",
      'Nome Fantasia': c.nomeFantasia ?? "",
      'CNPJ': c.cnpj ?? "",
      'Cidade': c.endereco?.municipio?.descricao ?? "",
      'Estado': c.endereco?.municipio?.estado?.sigla ?? "",
      'Responsável': c.responsavelLegalNome ?? "",
      'E-mail Responsável': c.responsavelLegalEmail ?? "",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empresas");
    XLSX.writeFile(wb, "empresas.xlsx");
  };

  const exportToPDF = () => {
    if (companies.length === 0) {
      toast({ title: "Nada para exportar", description: "Nenhuma empresa encontrada." });
      return;
    }
    const doc = new jsPDF();
    doc.text("Listagem de Empresas", 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Nome Fantasia', 'CNPJ', 'Cidade/UF', 'Responsável']],
      body: companies.map(c => [
        c.nomeFantasia ?? "",
        c.cnpj ?? "",
        `${c.endereco?.municipio?.descricao ?? ""}/${c.endereco?.municipio?.estado?.sigla ?? ""}`,
        c.responsavelLegalNome ?? "",
      ]),
    });

    doc.save("empresas.pdf");
  };

  const filteredCompanies = companies.filter(company => {
    if (currentUser?.role === 'ADMIN_EMPRESA' && currentUser.companyId && company.id !== currentUser.companyId) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    const nomeFantasia = (company.nomeFantasia ?? "").toLowerCase();
    const nomeOficial = (company.nomeOficial ?? "").toLowerCase();
    const cnpjRaw = company.cnpj ?? "";
    return (
      nomeFantasia.includes(term) ||
      nomeOficial.includes(term) ||
      cnpjRaw.includes(searchTerm)
    );
  });

  const onSaveEdit = async (values: CompanyRegistrationValues) => {
    if (!editingCompany?.cnpj) return;
    try {
      setIsSaving(true);
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
        throw new Error("Sessão não validada. Faça login novamente (cookie/token) antes de atualizar empresa.");
      }

      await apiClient.api.updateEmpresaPost(payload);
      toast({ title: "Empresa atualizada", description: "Alterações salvas com sucesso." });
      setIsEditOpen(false);
      setEditingCompany(null);
      await loadCompanies();
    } catch (e) {
      toast({
        title: "Erro ao atualizar empresa",
        description: e instanceof Error ? e.message : "Não foi possível atualizar a empresa.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton title="Listagem de Empresas" subtitle="Gerencie as empresas cadastradas no sistema" />

      <main className="flex-1 flex justify-center p-6 md:p-10">
        <div className="w-full max-w-6xl space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 w-full sm:w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nome ou CNPJ..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="!pl-10"
                  />
                </div>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={exportToExcel} title="Exportar Excel">
                 <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
               </Button>
               <Button variant="outline" onClick={exportToPDF} title="Exportar PDF">
                 <FileText className="h-4 w-4 mr-2" /> PDF
               </Button>
               <Button onClick={handleCreateClick}>
                 <Plus className="mr-2 h-4 w-4" /> Nova Empresa
               </Button>
             </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Empresas Cadastradas</CardTitle>
              <CardDescription>Gerencie as empresas cadastradas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome Fantasia</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Cidade/UF</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.cnpj ?? company.id ?? Math.random()}>
                        <TableCell className="font-medium">{company.nomeFantasia ?? "-"}</TableCell>
                        <TableCell>{company.cnpj ? formatCnpj(company.cnpj) : "-"}</TableCell>
                        <TableCell>
                          {(company.endereco?.municipio?.descricao ?? "-") +
                            "/" +
                            (company.endereco?.municipio?.estado?.sigla ?? "-")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{company.responsavelLegalNome ?? "-"}</span>
                            <span className="text-xs text-muted-foreground">{company.responsavelLegalEmail ?? ""}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Ativo
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar"
                              onClick={() => {
                                toast({
                                  title: "Edição temporariamente desabilitada",
                                  description: "A edição de empresas está desabilitada no momento.",
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {isLoadingCompanies && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Carregando empresas...
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoadingCompanies && filteredCompanies.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Nenhuma empresa encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingCompany(null);
        }}
      >
        <DialogContent className="w-full max-w-5xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] p-0 overflow-hidden bg-card dark:bg-background/80 dark:backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50">
          <div className="w-full h-full p-6 sm:p-8 lg:p-10 flex flex-col min-h-0">
            <div className="text-center flex flex-col items-center scale-[0.85]">
              <div className="flex items-center gap-2 mb-6">
                <Building2 aria-hidden="true" className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Editar empresa</h1>
              <p className="text-muted-foreground mt-2">Atualize as informações da empresa selecionada.</p>
            </div>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSaveEdit)} className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0 minimal-scroll pr-1 space-y-6 pb-6">
                  <FormField
                    control={editForm.control}
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
                              disabled
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
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
                      control={editForm.control}
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
                  </div>

                  <FormField
                    control={editForm.control}
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
                    control={editForm.control}
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
                        const uf = editForm.watch(`enderecos.${idx}.municipio.estado.sigla`) || "";
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
                                control={editForm.control}
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
                                control={editForm.control}
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
                              control={editForm.control}
                              name={`enderecos.${idx}.nomeLogradouro`}
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium text-foreground block">Logradouro</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Rua..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <FormField
                                control={editForm.control}
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
                                control={editForm.control}
                                name={`enderecos.${idx}.bairro`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">Bairro</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Centro" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editForm.control}
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={editForm.control}
                                name={`enderecos.${idx}.municipio.estado.sigla`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">UF</FormLabel>
                                    <Select value={field.value ? String(field.value) : ""} onValueChange={field.onChange}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {estados.map((e) => (
                                          <SelectItem key={String(e.sigla ?? e.id)} value={String(e.sigla ?? "")}>
                                            {String(e.sigla ?? "")}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editForm.control}
                                name={`enderecos.${idx}.municipio.id`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground block">Município</FormLabel>
                                    <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {municipiosUf.map((m) => (
                                          <SelectItem key={String(m.id)} value={String(m.id)}>
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
                              control={editForm.control}
                              name={`enderecos.${idx}.municipio.descricao`}
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium text-foreground block">Descrição do município</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Município" {...field} />
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

                  <div className="space-y-4 border border-border/50 rounded-xl p-4">
                    <p className="text-sm font-medium text-foreground">Responsável legal</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="responsavelLegalNome"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-foreground block">Nome</FormLabel>
                            <FormControl>
                              <Field>
                                <User aria-hidden="true" className="field-icon h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Nome do responsável" className="pl-10" {...field} />
                              </Field>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={editForm.control}
                        name="responsavelLegalCPF"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-foreground block">CPF</FormLabel>
                            <FormControl>
                              <Input placeholder="00000000000" inputMode="numeric" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="responsavelLegalRG"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-foreground block">RG</FormLabel>
                            <FormControl>
                              <Input placeholder="RG" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
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
                  </div>
                </div>

                <div className="shrink-0 pt-4 border-t border-border/50 bg-transparent dark:bg-background/60 dark:backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11"
                      onClick={() => setIsEditOpen(false)}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full font-semibold h-11"
                      disabled={!editForm.formState.isValid || isSaving}
                    >
                      {isSaving ? "Salvando..." : "Salvar alterações"}
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

export default Companies;
