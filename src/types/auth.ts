export type UserRole = 'ADMIN_SISTEMA' | 'ADMIN_EMPRESA' | 'ADMIN_SETOR' | 'OPERADOR';

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string; // Login email
  username: string;
  corporateEmail: string;
  phone: string;
  position: string; // Cargo/Função
  department: string;
  admissionDate: string;
  cpf: string;
  birthDate: string;
  address: Address;
  role: UserRole;
  status: 'active' | 'inactive';
  bio: string;
  
  // Optional legacy fields or specific logic
  companyId?: string;
  sectorId?: string;
  token?: string;
  avatar?: string;
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
  document: string; // CPF or CNPJ
  role: UserRole;
  companyId?: string;
  sectorId?: string;
  
  // Extended fields
  username: string;
  corporateEmail: string;
  position: string;
  department: string;
  admissionDate: string;
  birthDate: string;
  address: Address;
  bio?: string;
  status: 'active' | 'inactive';
}
