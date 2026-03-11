import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from './authService';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should login successfully with valid credentials', async () => {
    const credentials = {
      email: 'admin@sistema.com',
      password: 'validpassword' // Mock service only checks length >= 8
    };

    const response = await authService.login(credentials);

    expect(response.user).toBeDefined();
    expect(response.token).toBeDefined();
    expect(response.user.email).toBe('admin@sistema.com');
    expect(localStorage.getItem('herz_auth_token')).toBe(response.token);
  });

  it('should fail login with invalid password', async () => {
    const credentials = {
      email: 'admin@sistema.com',
      password: 'short'
    };

    await expect(authService.login(credentials)).rejects.toThrow('Credenciais inválidas');
  });

  it('should register a new user', async () => {
    const newUser = {
      name: 'New User',
      email: 'new@user.com',
      password: 'password123',
      phone: '1234567890',
      document: '12345678901',
      role: 'OPERADOR' as const
    };

    const response = await authService.register(newUser);

    expect(response.user).toBeDefined();
    expect(response.user.email).toBe('new@user.com');
    expect(response.user.role).toBe('OPERADOR');
  });

  it('should check permissions correctly', () => {
    const adminSistema = { role: 'ADMIN_SISTEMA' } as any;
    const adminEmpresa = { role: 'ADMIN_EMPRESA' } as any;
    const operador = { role: 'OPERADOR' } as any;

    expect(authService.hasPermission(adminSistema, 'any', 'create')).toBe(true);
    
    expect(authService.hasPermission(adminEmpresa, 'user', 'create')).toBe(true);
    expect(authService.hasPermission(adminEmpresa, 'contract', 'read')).toBe(true);
    
    expect(authService.hasPermission(operador, 'profile', 'read')).toBe(true);
    expect(authService.hasPermission(operador, 'user', 'create')).toBe(false);
  });
});
