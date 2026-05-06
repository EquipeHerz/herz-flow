import type { User } from "@/types/auth";
import type { Usuario, TipoUsuarioEnum } from "./models";

const EMPTY_ADDRESS: User["address"] = {
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const mapTipoUsuarioToRole = (tipo: TipoUsuarioEnum | undefined): User["role"] => {
  if (tipo === 1) return "ADMIN_SISTEMA";
  return "ADMIN_EMPRESA";
};

export const mapApiUsuarioToUiUser = (usuario: Usuario): User => {
  const login = usuario.login ?? "";
  const email = usuario.email ?? "";
  const phone = usuario.telefones?.[0]
    ? `${onlyDigits(usuario.telefones[0].ddi ?? "")}${onlyDigits(usuario.telefones[0].ddd ?? "")}${onlyDigits(
        usuario.telefones[0].numero ?? ""
      )}`
    : "";

  return {
    id: usuario.id ?? (login ? `api:${login}` : crypto.randomUUID()),
    name: usuario.nome ?? "",
    email,
    username: login,
    corporateEmail: email,
    phone,
    position: usuario.cargo ?? "",
    department: usuario.departamento ?? "",
    admissionDate: usuario.dataCadastro ? String(usuario.dataCadastro).slice(0, 10) : new Date().toISOString().slice(0, 10),
    cpf: usuario.cpf ?? "",
    birthDate: usuario.dataNascimento ? String(usuario.dataNascimento).slice(0, 10) : "",
    address: EMPTY_ADDRESS,
    role: mapTipoUsuarioToRole(usuario.tipoUsuario),
    status: "active",
    bio: usuario.bio ?? undefined,
  };
};
