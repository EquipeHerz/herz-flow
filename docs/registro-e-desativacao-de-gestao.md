# Registro público e desativação de gestão

## O que mudou

- As rotas e links de **gestão/cadastro de Usuários, Empresas e Contratos** foram desabilitados por flag.
- Foi criado um fluxo público de registro em etapas, seguindo o layout do Login:
  - `/registro/empresa`: verificação de CNPJ e cadastro de empresa (se necessário)
  - `/registro/usuario`: cadastro de usuário vinculado ao CNPJ

## Flag de funcionalidade

- `VITE_ENABLE_MANAGEMENT`
  - `true`: habilita as telas/rotas de gestão (listagens e cadastros administrativos).
  - qualquer outro valor (ou ausência): desabilita gestão.

Quando desabilitado:
- Os links do menu (Header) e atalhos do Dashboard para gestão não aparecem.
- As rotas administrativas continuam existindo para compatibilidade, mas exibem uma tela informando que a funcionalidade está desativada.

## Registro público (etapas)

### Etapa 1: Empresa (`/registro/empresa`)

- Primeiro input: CNPJ (verifica se a empresa já existe).
- Se o CNPJ existir, segue direto para a etapa do usuário.
- Se o CNPJ não existir, exibe campos para cadastro de empresa.

### Etapa 2: Usuário (`/registro/usuario`)

Campos obrigatórios (usuário):
- Nome completo
- E-mail
- Senha e confirmação de senha
- Login
- Cargo
- Telefones (com opção de adicionar/remover)
- Aceite LGPD

Comportamentos:
- Validação em tempo real via React Hook Form + Zod
- Feedback visual por campo (mensagens e borda em erro)
- Erros globais exibidos via toast
