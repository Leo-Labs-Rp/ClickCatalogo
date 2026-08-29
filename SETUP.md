# Setup atual — Supabase, Netlify e Asaas

Este é o guia principal para colocar o **ClickCatálogo** em um ambiente novo. Ele considera o estado atual do código: Next.js com App Router, banco e Auth no Supabase, deploy na Netlify e cobrança recorrente pelo Asaas.

## Antes de começar

- Não envie chaves secretas por chat e não as grave no Git.
- O arquivo local com valores reais é `C:\Projeto-Github\ClickCatálogo\.env.local`.
- A Netlify não usa o `.env.local` do computador durante o deploy. Cadastre as variáveis no painel dela.
- O `.env.local` existente ainda aponta para o ambiente anterior. Substitua os valores somente depois de copiar as credenciais do novo Supabase e a URL do novo site.
- O domínio `clickcatalogo.com` só deve ser usado quando estiver realmente vinculado. Até lá, use a URL `https://SEU-SITE.netlify.app`.

## 1. Ordem recomendada

1. Executar o schema consolidado no novo Supabase.
2. Em um banco já criado com uma versão anterior, executar somente a migration complementar indicada abaixo.
3. Executar a verificação somente leitura.
4. Copiar URL, Publishable key e Secret key do Supabase.
5. Configurar Auth e URLs de redirecionamento.
6. Verificar o domínio no Resend e conectar o SMTP ao Supabase Auth.
7. Preencher `.env.local` para testar localmente.
8. Conectar o repositório GitHub à Netlify.
9. Cadastrar as variáveis na Netlify e publicar o site.
10. Atualizar a URL do Auth com o domínio da Netlify.
11. Configurar Asaas e webhook.
12. Validar recuperação de senha, cadastro, pagamento, painel, uploads, catálogo e cancelamento.

## 2. Banco de dados completo

Para um projeto Supabase novo e vazio, execute somente este arquivo:

`C:\Projeto-Github\ClickCatálogo\supabase\schema.sql`

Passos:

1. Abra o novo projeto no Supabase.
2. Acesse **SQL Editor → New query**.
3. Abra o arquivo `schema.sql`, copie todo o conteúdo e cole no editor.
4. Clique em **Run**.
5. O resultado deve terminar sem erro.

Não execute também as migrations individuais. O `schema.sql` já consolida todas elas na ordem correta.

### Banco criado antes da correção de slugs expirados

Se o `schema.sql` foi executado antes de **29 de agosto de 2026**, rode agora somente este arquivo no SQL Editor:

`C:\Projeto-Github\ClickCatálogo\supabase\migrations\202608280005_expire_stale_signup_intents.sql`

Ele adiciona uma função restrita à `service_role` e libera reservas pendentes vencidas mesmo quando o webhook `CHECKOUT_EXPIRED` não chega. O arquivo é idempotente e não recria tabelas, bucket ou policies.

### O que o schema cria

- `public.tenants` — lojas e seus proprietários;
- `public.categories` — categorias isoladas por tenant;
- `public.products` — produtos e vínculo seguro com a categoria do mesmo tenant;
- `public.subscriptions` — assinatura e IDs do Asaas;
- `public.signup_intents` — cadastro antes da confirmação do pagamento;
- `public.asaas_webhook_events` — idempotência e auditoria de webhooks;
- constraints, índices e gatilhos de `updated_at`;
- RLS e grants para isolamento multi-tenant;
- RPCs `get_public_catalog` e `get_public_store_status` para a loja pública;
- RPC administrativa `expire_stale_signup_intents` para liberar reservas vencidas;
- bucket público `produtos`, limite de 2 MB e tipos JPEG, PNG e WebP;
- policies de Storage que restringem escrita ao proprietário do tenant.

O bucket `produtos` é criado pelo próprio SQL. Não o crie manualmente.

### Verificar a instalação

Depois do schema, execute no SQL Editor:

`C:\Projeto-Github\ClickCatálogo\supabase\verify-setup.sql`

Esse arquivo não altera dados. Ele deve listar:

- seis tabelas com RLS ativo;
- quatro funções esperadas, incluindo a função administrativa de expiração;
- o bucket `produtos` como público;
- policies das tabelas e do Storage.

## 3. O que copiar do Supabase

No projeto, abra **Connect** ou **Settings → API Keys**.

| Valor no Supabase | Variável do projeto | Exposição |
|---|---|---|
| Project URL, formato `https://PROJECT_REF.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` | Pública |
| Publishable key, formato `sb_publishable_...` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública |
| Secret key, formato `sb_secret_...` | `SUPABASE_SERVICE_ROLE_KEY` | Segredo de servidor |

Os nomes `ANON_KEY` e `SERVICE_ROLE_KEY` foram mantidos por compatibilidade interna, mas aceitam as chaves modernas Publishable e Secret. Prefira essas chaves novas; não é necessário usar as chaves JWT legadas `anon` e `service_role`.

A Secret key ignora RLS. Cadastre-a apenas no `.env.local` e na Netlify, marcada como segredo. Nunca use prefixo `NEXT_PUBLIC_` nela.

Não é necessário copiar a senha do banco, connection string, JWT secret ou Project ID para este projeto.

## 4. Configurar Supabase Auth

Em **Authentication → Providers**, confirme que o provedor de e-mail e senha está habilitado.

Em **Authentication → URL Configuration**:

- durante o teste publicado, defina **Site URL** como `https://SEU-SITE.netlify.app`;
- adicione `https://SEU-SITE.netlify.app/auth/callback` em **Redirect URLs**;
- mantenha `http://localhost:3000/auth/callback` para desenvolvimento local;
- quando o domínio final entrar no ar, adicione `https://clickcatalogo.com/auth/callback` e troque a Site URL para `https://clickcatalogo.com`.

O pagamento não depende de e-mail: o webhook cria o usuário e a tela de sucesso permite definir a senha inicial. Porém a recuperação de senha depende de entrega de e-mail.

Antes de vender para clientes reais, configure um SMTP próprio em **Authentication → Emails → SMTP Settings**. O SMTP padrão do Supabase é apenas para testes, restringe destinatários e tem limite baixo.

### Resend recomendado para o lançamento

O ClickCatálogo usa o Resend apenas como SMTP do Supabase Auth. A recuperação de senha já está implementada no código; não é necessário instalar pacote, criar rota de e-mail ou adicionar `RESEND_API_KEY` ao `.env.local` ou à Netlify.

1. No Resend, abra **Domains → Add Domain**.
2. Cadastre o subdomínio `auth.clickcatalogo.com`. O subdomínio separa a reputação dos e-mails de autenticação de futuras campanhas de marketing.
3. No painel DNS que controla `clickcatalogo.com`, crie exatamente os registros SPF, DKIM e MX exibidos pelo Resend. Adicione também o DMARC recomendado.
4. Volte ao Resend e clique em **Verify DNS Records**. Só avance quando o domínio aparecer como `Verified`.
5. Desative rastreamento de abertura e de links nesse domínio de autenticação. Links de recuperação são de uso único e não devem ser reescritos por rastreadores.
6. No Resend, abra **API Keys → Create API Key**. Use o nome `Supabase Auth — ClickCatálogo`, permissão somente de envio e restrinja ao domínio `auth.clickcatalogo.com`. Copie a chave quando ela for exibida; o Resend não mostra o valor novamente.
7. No Supabase, abra **Authentication → Notifications → Email → SMTP Settings** e habilite o SMTP personalizado.
8. Preencha os campos com os valores abaixo e salve:

```text
Host: smtp.resend.com
Porta: 465
Usuário: resend
Senha: API Key criada no passo anterior
Remetente: nao-responda@auth.clickcatalogo.com
Nome: ClickCatálogo
```

Não registre essa API Key no Git. Ela fica somente no campo de senha SMTP do Supabase. Se a integração guiada Resend aparecer no seu painel no futuro, ela será apenas uma alternativa a esta configuração manual e não será necessária.

Em **Authentication → Email Templates → Reset password**, mantenha o link de confirmação fornecido pelo Supabase e use um texto curto, sem publicidade. Depois envie uma recuperação real para um Gmail e um Outlook e confirme recebimento, abertura do callback, troca da senha e novo login.

Referências oficiais: [SMTP do Resend](https://resend.com/docs/send-with-smtp), [domínios no Resend](https://resend.com/docs/dashboard/domains/introduction) e [SMTP do Supabase Auth](https://supabase.com/docs/guides/auth/auth-smtp).

## 5. Variáveis locais

Edite:

`C:\Projeto-Github\ClickCatálogo\.env.local`

Use este formato:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

DEMO_ACCESS_ENABLED=true

SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=
ASAAS_API_URL=
```

Para validar banco, login e CRUD localmente, as três variáveis do Supabase são suficientes. Para o cadastro pago também são necessárias `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN`, além de uma URL HTTPS pública.

Teste local:

```powershell
cd C:\Projeto-Github\ClickCatálogo
node --version
npm install
npm run check
npm run dev
```

O comando deve mostrar Node.js 22 ou superior. A versão atual do cliente Supabase depende do WebSocket nativo disponível nessas versões. Depois abra `http://localhost:3000`.

## 6. Deploy na Netlify

O arquivo abaixo já deixa o build versionado:

`C:\Projeto-Github\ClickCatálogo\netlify.toml`

Ele configura:

- build: `npm run build`;
- publish directory: `.next`;
- Node.js 22;
- proteção contra incompatibilidade entre deploys ativos.

A Netlify detecta Next.js e aplica automaticamente o adaptador OpenNext. Não instale nem fixe `@netlify/plugin-nextjs`.

### Conectar o repositório

1. Na Netlify, abra **Add new project → Import an existing project**.
2. Escolha GitHub e selecione `Leo-Labs-Rp/ClickCatalogo`.
3. Production branch: `master`.
4. Base directory: raiz do repositório, sem subpasta.
5. Confirme `npm run build` e `.next` — o `netlify.toml` já fornece os valores.
6. Copie a URL principal exibida pela Netlify, por exemplo `https://nome-do-site.netlify.app`.

### Variáveis obrigatórias na Netlify

Abra **Project configuration → Environment variables** e cadastre para o contexto de Produção:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
DEMO_ACCESS_ENABLED
SUPABASE_SERVICE_ROLE_KEY
ASAAS_API_KEY
ASAAS_WEBHOOK_TOKEN
```

Use na variável `NEXT_PUBLIC_SITE_URL` a URL principal exata da Netlify, com `https://` e sem barra final.

Marque como segredo:

- `SUPABASE_SERVICE_ROLE_KEY`;
- `ASAAS_API_KEY`;
- `ASAAS_WEBHOOK_TOKEN`.

`ASAAS_API_URL` deve permanecer ausente ou vazia com chaves atuais. O código escolhe Sandbox ou Produção pelo prefixo da chave.

Depois de criar ou alterar variáveis, faça um novo deploy. As variáveis `NEXT_PUBLIC_*` são incorporadas durante o build e não mudam em deploys antigos.

Em contas Netlify Free novas, confirme também que o projeto foi publicado e não ficou privado.

## 7. Asaas

### Valores necessários

- `ASAAS_API_KEY`: gerada na conta Asaas correta;
- `ASAAS_WEBHOOK_TOKEN`: segredo aleatório criado por você e repetido exatamente na Netlify e no webhook.

Chaves `$aact_hmlg_...` usam Sandbox. Chaves `$aact_prod_...` usam Produção. Não é necessária mudança de código.

### Webhook

Depois do primeiro deploy público, crie no painel do Asaas:

```text
Nome: ClickCatálogo
URL: https://SEU-SITE.netlify.app/api/webhooks/asaas
Token: mesmo valor de ASAAS_WEBHOOK_TOKEN
API: v3
Envio: sequencial
Webhook ativo: sim
Fila de sincronização: ativa
```

Ative estes eventos:

```text
CHECKOUT_PAID
CHECKOUT_CANCELED
CHECKOUT_EXPIRED
PAYMENT_CONFIRMED
PAYMENT_RECEIVED
PAYMENT_OVERDUE
SUBSCRIPTION_DELETED
SUBSCRIPTION_INACTIVATED
```

O checkout custa R$ 27 por mês e atualmente usa cartão de crédito recorrente. Pix recorrente não faz parte deste fluxo.

## 8. Tenant manual para testar sem Asaas

1. Em **Authentication → Users**, crie um usuário com e-mail e senha e copie o UUID dele.
2. No SQL Editor, execute substituindo o UUID, slug, nome e WhatsApp:

```sql
with nova_loja as (
  insert into public.tenants (
    slug,
    nome_loja,
    whatsapp,
    owner_user_id,
    status,
    tema
  ) values (
    'loja-teste',
    'Loja Teste',
    '5511999999999',
    'UUID_DO_USUARIO_AUTH'::uuid,
    'ativo',
    'natural'
  )
  returning id
)
insert into public.subscriptions (tenant_id, valor, status)
select id, 27.00, 'ativo'
from nova_loja;
```

Depois entre em `/painel` com o e-mail e a senha desse usuário. Categorias, produtos, uploads e loja pública usarão dados reais do novo Supabase.

## 9. Teste de ponta a ponta

1. Abra `/cadastro` no domínio da Netlify.
2. Use um slug novo e um e-mail que ainda não exista no novo Supabase.
3. Conclua o checkout no ambiente escolhido do Asaas.
4. Aguarde `/cadastro/sucesso?ref=...` confirmar o webhook.
5. Crie a senha inicial na própria tela.
6. Confirme no Supabase:
   - usuário em **Authentication → Users**;
   - `signup_intents.status = 'pago'`;
   - tenant com `status = 'ativo'`;
   - assinatura ativa com IDs do Asaas;
   - eventos com `processed_at` preenchido e `processing_error` vazio.
7. Entre no painel, crie categoria e produto, envie uma imagem e abra `/loja/SLUG`.
8. Teste pedido individual e carrinho consolidado pelo WhatsApp.
9. No Sandbox, escolha uma assinatura descartável e valide o cancelamento self-service.

## 10. Trocar para `clickcatalogo.com`

Quando o domínio for vinculado à Netlify:

1. Configure o domínio e aguarde SSL ativo.
2. Troque `NEXT_PUBLIC_SITE_URL` para `https://clickcatalogo.com` na Netlify.
3. Faça novo deploy.
4. Troque a Site URL do Supabase Auth e adicione o callback final.
5. Troque a URL do webhook do Asaas para `https://clickcatalogo.com/api/webhooks/asaas`.
6. Teste login, recuperação, checkout e webhook novamente.

## 11. O que está pronto e o que ainda bloqueia venda real

### Pronto no código

- landing, cadastro em duas etapas e checkout;
- webhook idempotente e provisionamento automático;
- login por senha e definição inicial de senha sem depender de e-mail;
- CRUD de loja, categorias e produtos;
- uploads protegidos por tenant;
- catálogo público com busca, paginação, temas e otimização de imagens;
- carrinho client-side e pedido consolidado pelo WhatsApp;
- assinatura e cancelamento self-service;
- termos e política de privacidade.

### Obrigatório antes do primeiro cliente real

- executar e verificar o schema no novo Supabase;
- trocar todas as variáveis do ambiente antigo pelas novas;
- publicar o estado local atual no GitHub — há funcionalidades ainda não commitadas;
- configurar SMTP próprio e testar recuperação de senha;
- configurar webhook na conta Asaas de Produção;
- realizar uma cobrança real controlada e um cancelamento controlado;
- revisar logs da Netlify, Supabase e Asaas após o teste.

### Limites do gratuito

- Netlify Free possui limite mensal rígido; ao esgotá-lo, os projetos podem pausar até o próximo ciclo ou upgrade.
- Projetos Supabase Free podem pausar por baixa atividade e não oferecem a mesma garantia operacional de um plano de Produção.
- O gratuito é adequado para validação e lançamento pequeno, mas deve haver monitoramento e plano de upgrade antes de depender da plataforma para receita recorrente.

## 12. Mapa de arquivos

- schema completo: `C:\Projeto-Github\ClickCatálogo\supabase\schema.sql`;
- migration complementar de slugs expirados: `C:\Projeto-Github\ClickCatálogo\supabase\migrations\202608280005_expire_stale_signup_intents.sql`;
- verificação do banco: `C:\Projeto-Github\ClickCatálogo\supabase\verify-setup.sql`;
- exemplo de variáveis: `C:\Projeto-Github\ClickCatálogo\.env.example`;
- valores locais reais: `C:\Projeto-Github\ClickCatálogo\.env.local`;
- configuração Netlify: `C:\Projeto-Github\ClickCatálogo\netlify.toml`;
- estado e pendências: `C:\Projeto-Github\ClickCatálogo\STATUS.md`.
