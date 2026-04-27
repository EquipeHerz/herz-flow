export type UserRole = 'ADMIN_SISTEMA' | 'ADMIN_EMPRESA' | 'ADMIN_SETOR' | 'FUNCIONARIO_SETOR' | 'OPERADOR';

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  corporateEmail: string;
  phone: string;
  phones?: string[];
  position: string;
  department: string;
  admissionDate: string;
  cpf: string;
  birthDate: string;
  address: Address;
  role: UserRole;
  status: 'active' | 'inactive';
  bio?: string;
  avatar?: string;
  
  // Hierarchy fields
  companyId?: string;
  companyName?: string;
  company?: string; // Legacy field
  sectorId?: string;
  cnpj?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  phones?: string[];
  document?: string; // CPF
  role: UserRole;
  
  // Hierarchy
  companyId?: string;
  companyName?: string;
  company?: string;
  cnpj?: string;
  sectorId?: string;
  
  // Extended fields
  username?: string;
  corporateEmail?: string;
  position: string;
  department?: string;
  admissionDate?: string;
  birthDate?: string;
  address: Address;
  bio?: string;
  status: 'active' | 'inactive';
}
