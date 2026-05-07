export type UserRole = 'ADMIN_SISTEMA' | 'ADMIN_EMPRESA';

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
  tipoUsuario?: number;
  status: 'active' | 'inactive';
  bio?: string;
  avatar?: string;
  
  companyId?: string;
  companyName?: string;
  company?: string;
  sectorId?: string;
  cnpj?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  phones?: string[];
  document?: string;
  role: UserRole;
  
  companyId?: string;
  companyName?: string;
  company?: string;
  cnpj?: string;
  sectorId?: string;
  
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
