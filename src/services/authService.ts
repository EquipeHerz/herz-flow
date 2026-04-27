import { User, UserRole, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

const STORAGE_KEY = 'herz_auth_token';
const USER_KEY = 'herz_user_data';

const DEFAULT_ADDRESS = {
  street: 'Rua Principal',
  number: '123',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01000-000'
};

// Mock users for testing - 4 distinct profiles
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin Sistema',
    email: 'admin@sistema.com',
    username: 'admin.sistema',
    corporateEmail: 'admin@herz.com.br',
    phone: '(11) 99999-9999',
    position: 'Administrador Geral',
    department: 'TI',
    admissionDate: '2023-01-01',
    cpf: '123.456.789-00',
    birthDate: '1990-01-01',
    address: DEFAULT_ADDRESS,
    role: 'ADMIN_SISTEMA',
    status: 'active',
    bio: 'Administrador responsável por todo o sistema Herz.',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: '2',
    name: 'Admin Empresa',
    email: 'admin@empresa.com',
    username: 'admin.empresa',
    corporateEmail: 'contato@techsolutions.com.br',
    phone: '(11) 98888-8888',
    position: 'Gerente de TI',
    department: 'Tecnologia',
    admissionDate: '2023-06-01',
    cpf: '234.567.890-11',
    birthDate: '1992-05-15',
    address: DEFAULT_ADDRESS,
    role: 'ADMIN_EMPRESA',
    status: 'active',
    bio: 'Gerente de tecnologia da Tech Solutions.',
    companyId: '2',
    companyName: 'Tech Solutions',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: '3',
    name: 'Admin Setor',
    email: 'admin@setor.com',
    username: 'admin.setor',
    corporateEmail: 'suporte@techsolutions.com.br',
    phone: '(11) 97777-7777',
    position: 'Coordenador de Suporte',
    department: 'Suporte',
    admissionDate: '2023-08-01',
    cpf: '345.678.901-22',
    birthDate: '1995-10-20',
    address: DEFAULT_ADDRESS,
    role: 'ADMIN_SETOR',
    status: 'active',
    bio: 'Responsável pelo setor de suporte técnico.',
    companyId: '2',
    companyName: 'Tech Solutions',
    sectorId: 'sector-456',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: '4',
    name: 'Operador',
    email: 'operador@empresa.com',
    username: 'operador.1',
    corporateEmail: 'operador@techsolutions.com.br',
    phone: '(11) 96666-6666',
    position: 'Analista de Suporte Jr',
    department: 'Suporte',
    admissionDate: '2024-01-15',
    cpf: '456.789.012-33',
    birthDate: '2000-03-10',
    address: DEFAULT_ADDRESS,
    role: 'OPERADOR',
    status: 'active',
    bio: 'Atendimento ao cliente nível 1.',
    companyId: '2',
    companyName: 'Tech Solutions',
    sectorId: 'sector-456',
    avatar: 'https://github.com/shadcn.png',
  }
];

// Mock password validation (simple check)
const isValidPassword = (password: string) => {
  // Mock check: in reality we would hash and compare
  // For dev purposes, accept any password >= 8 chars
  return password.length >= 8; 
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = MOCK_USERS.find(u => u.email === credentials.email);

    if (!user || !isValidPassword(credentials.password)) {
      throw new Error('Credenciais inválidas');
    }

    // Generate mock JWT
    const token = btoa(JSON.stringify({
      id: user.id,
      role: user.role,
      companyId: user.companyId,
      sectorId: user.sectorId,
      exp: Date.now() + 3600000 * 24 // 24 hours
    }));

    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user, token };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists
    if (MOCK_USERS.some(u => u.email === data.email)) {
      throw new Error('E-mail já cadastrado');
    }

    const today = new Date().toISOString().slice(0, 10);

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      username: data.username ?? data.email.split("@")[0],
      corporateEmail: data.corporateEmail ?? data.email,
      phone: data.phone,
      phones: data.phones,
      position: data.position,
      department: data.department ?? data.companyName ?? "Geral",
      admissionDate: data.admissionDate ?? today,
      cpf: data.document ?? "",
      birthDate: data.birthDate ?? "2000-01-01",
      address: data.address,
      role: data.role,
      status: data.status,
      bio: data.bio || '',
      companyId: data.companyId,
      companyName: data.companyName,
      company: data.company,
      sectorId: data.sectorId,
      cnpj: data.cnpj,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`
    };

    // In a real app, we would save to DB here. 
    // For mock, we'll just return it as logged in.
    
    const token = btoa(JSON.stringify({
      id: newUser.id,
      role: newUser.role,
      exp: Date.now() + 3600000
    }));

    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    return { user: newUser, token };
  },

  async createUser(data: RegisterData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists
    if (MOCK_USERS.some(u => u.email === data.email)) {
      throw new Error('E-mail já cadastrado');
    }

    const today = new Date().toISOString().slice(0, 10);

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      username: data.username ?? data.email.split("@")[0],
      corporateEmail: data.corporateEmail ?? data.email,
      phone: data.phone,
      phones: data.phones,
      position: data.position,
      department: data.department ?? data.companyName ?? "Geral",
      admissionDate: data.admissionDate ?? today,
      cpf: data.document ?? "",
      birthDate: data.birthDate ?? "2000-01-01",
      address: data.address,
      role: data.role,
      status: data.status,
      bio: data.bio || '',
      companyId: data.companyId,
      companyName: data.companyName,
      company: data.company,
      sectorId: data.sectorId,
      cnpj: data.cnpj,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`
    };

    // In a real app, we would save to DB here.
    // For mock, we just return the user.
    return newUser;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEY);
    return !!token;
  },

  // Permission Logic
  canManageUser(currentUser: User, targetRole: UserRole): boolean {
    if (currentUser.role === 'ADMIN_SISTEMA') return true;
    
    if (currentUser.role === 'ADMIN_EMPRESA') {
      // Can manage own role (edit self), sector admins, sector employees, and operators
      return ['ADMIN_EMPRESA', 'ADMIN_SETOR', 'FUNCIONARIO_SETOR', 'OPERADOR'].includes(targetRole);
    }
    
    if (currentUser.role === 'ADMIN_SETOR') {
      return ['FUNCIONARIO_SETOR', 'OPERADOR'].includes(targetRole);
    }
    
    return false;
  },

  getAvailableRoles(currentUser: User): UserRole[] {
    if (currentUser.role === 'ADMIN_SISTEMA') {
      return ['ADMIN_EMPRESA', 'ADMIN_SETOR', 'FUNCIONARIO_SETOR', 'OPERADOR'];
    }
    if (currentUser.role === 'ADMIN_EMPRESA') {
      return ['ADMIN_EMPRESA', 'ADMIN_SETOR', 'FUNCIONARIO_SETOR', 'OPERADOR'];
    }
    if (currentUser.role === 'ADMIN_SETOR') {
      return ['FUNCIONARIO_SETOR', 'OPERADOR'];
    }
    return [];
  },

  hasPermission(role: UserRole, resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean {
    // System Admin has full access
    if (role === 'ADMIN_SISTEMA') return true;

    // Company Admin
    if (role === 'ADMIN_EMPRESA') {
      if (resource === 'company') return true; // Can create/manage companies (scope handled in UI)
      if (resource === 'user') return true; // Can manage users
      if (resource === 'contract') return action === 'read'; // Read-only access to contracts
      if (resource === 'dashboard') return true;
      return true;
    }

    // Sector Admin
    if (role === 'ADMIN_SETOR') {
      if (resource === 'company') return false;
      if (resource === 'user') return true; // Can manage operators/employees
      if (resource === 'contract') return action === 'read'; // Read-only access to contracts
      if (resource === 'dashboard') return true;
      return true;
    }

    // Operator or Sector Employee
    if (role === 'OPERADOR' || role === 'FUNCIONARIO_SETOR') {
      if (resource === 'dashboard') return true;
      if (resource === 'profile') return true;
      if (resource === 'user') return false;
      if (resource === 'company') return false;
      if (resource === 'contract') return false;
      return false;
    }

    return false;
  }
};
