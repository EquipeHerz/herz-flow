# Deploy no Vercel

Este projeto está configurado para deploy no Vercel. Siga os passos abaixo:

## Pré-requisitos

Certifique-se de ter o Node.js instalado.

## Passo a Passo

1.  **Login no Vercel (caso ainda não esteja logado):**
    Abra o terminal na pasta do projeto e execute:
    ```bash
    npx vercel login
    ```
    Siga as instruções no navegador para autorizar.

2.  **Deploy de Produção:**
    Após o login, execute o comando para fazer o deploy:
    ```bash
    npx vercel --prod
    ```
    
    *   Se for a primeira vez, o Vercel fará algumas perguntas de configuração (pode aceitar os padrões pressionando Enter).
    *   O comando irá construir o projeto e fazer o upload.

3.  **Deploy via Git (Recomendado):**
    Se você já conectou este repositório ao Vercel via GitHub/GitLab, basta fazer o commit e push das alterações:
    ```bash
    git add .
    git commit -m "Atualizações do Dashboard e Chat"
    git push
    ```
    O Vercel detectará o push e fará o deploy automaticamente.

## Configuração Atual

*   O arquivo `vercel.json` já está configurado para lidar com as rotas do React (Single Page Application).
*   O build do projeto (`npm run build`) foi testado e está funcionando corretamente.

# Deploy na Hostinger (Static)

Para Hostinger (hospedagem de site estático via Apache/Nginx), o artefato de deploy é o diretório `dist/` gerado pelo Vite.

## Passo a Passo

1. Gere o build:
   ```bash
   npm run build
   ```

2. Envie o conteúdo de `dist/` para o diretório público do seu site (geralmente `public_html/`).
   - Envie os arquivos diretamente dentro de `dist/` (por exemplo, `index.html`, `assets/`, etc.), e não a pasta `dist` inteira dentro de `public_html`.

3. Garanta o fallback de SPA (React Router) no servidor.
   - Este projeto inclui um `.htaccess` no diretório `public/` para ser copiado ao `dist/` durante o build (Apache).
   - Se seu plano usar Nginx, configure o equivalente de fallback para `index.html`.
