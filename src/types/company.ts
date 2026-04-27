export type CompanyAddress = {
  tipoLogradouro?: number;
  nomeLogradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: {
    id?: number;
    descricao: string;
    estado: {
      id?: number;
      descricao?: string;
      sigla: string;
    };
  };
  cep: string;
  observacoes?: string;
};

export type Company = {
  id: string;
  nomeOficial: string;
  nomeFantasia: string;
  cnpj: string;
  webSite?: string;
  experiencia?: string;
  endereco: CompanyAddress;
  responsavelLegalNome: string;
  responsavelLegalCPF: string;
  responsavelLegalRG?: string;
  responsavelLegalCargo: string;
  responsavelLegalEmail: string;
};

