const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const normalizeEmptyPassword = (value) => {
  if (value == null) return null;
  if (typeof value !== "string") return value;
  return value.trim() === "" ? null : value;
};

const removePasswordFieldsWhenEmpty = (usuario) => {
  if (!isObject(usuario)) return usuario;

  const next = { ...usuario };
  const senhaAtual = normalizeEmptyPassword(next.senhaAtual);
  const senhaNova = normalizeEmptyPassword(next.senhaNova);

  const hasSenhaAtual = typeof senhaAtual === "string" && senhaAtual.length > 0;
  const hasSenhaNova = typeof senhaNova === "string" && senhaNova.length > 0;

  if (!hasSenhaAtual && !hasSenhaNova) {
    delete next.senhaAtual;
    delete next.senhaNova;
    return { usuario: next, passwordAction: "preserved" };
  }

  next.senhaAtual = senhaAtual;
  next.senhaNova = senhaNova;
  return { usuario: next, passwordAction: "changed" };
};

export const normalizeAdminEmpresaPayload = (raw) => {
  if (!isObject(raw)) {
    return { payload: raw, audit: { passwordAction: "unknown" } };
  }

  const cnpj = typeof raw.cnpj === "string" ? raw.cnpj : undefined;
  const rawUsuario = raw.usuario ?? raw.Usuario;

  const { usuario, passwordAction } = removePasswordFieldsWhenEmpty(rawUsuario);

  const payload = {
    ...raw,
    cnpj,
    usuario,
    Usuario: usuario,
  };

  delete payload.alterarSenha;

  const audit = {
    passwordAction,
    userId: isObject(usuario) && typeof usuario.id === "string" ? usuario.id : undefined,
    login: isObject(usuario) && typeof usuario.login === "string" ? usuario.login : undefined,
  };

  return { payload, audit };
};

