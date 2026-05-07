import type { User } from "@/types/auth";

export const isTipoUsuario2 = (user: User | null | undefined) => user?.tipoUsuario === 2;

export const canCreateCompanies = (user: User | null | undefined) => {
  if (!user) return false;
  if (isTipoUsuario2(user)) return false;
  return user.role === "ADMIN_SISTEMA";
};

export const canCreateUsers = (user: User | null | undefined) => {
  if (!user) return false;
  if (isTipoUsuario2(user)) return false;
  return user.role === "ADMIN_SISTEMA";
};

