# Checklist de pré-lançamento do ClickCatálogo

Atualizado em 29 de agosto de 2026. Marque cada item somente depois de validar no ambiente público.

## Bloqueios antes de receber o primeiro cliente real

- [x] Executar `supabase/migrations/202608290006_prelaunch_hardening.sql` no Supabase atual.
- [x] Executar `supabase/verify-setup.sql` e confirmar sete tabelas, sete funções e o bucket `produtos`.
- [ ] Publicar o commit auditado e confirmar que o workflow **Qualidade** passou no GitHub.
- [x] Apontar `clickcatalogo.com` para a Netlify e validar o certificado HTTPS para o domínio raiz e `www`.
- [x] Trocar `NEXT_PUBLIC_SITE_URL` na Netlify para `https://clickcatalogo.com`. A publicação da versão auditada é validada no item acima.
- [ ] Atualizar Site URL e Redirect URLs no Supabase Auth para o domínio final.
- [ ] Atualizar a URL do webhook no Asaas para `https://clickcatalogo.com/api/webhooks/asaas`.
- [ ] Trocar `ASAAS_API_KEY` pela chave de Produção e manter `ASAAS_WEBHOOK_TOKEN` secreto.
- [ ] Fazer uma cobrança real controlada de R$ 27, conferir webhook, tenant, assinatura e acesso.
- [ ] Cancelar uma assinatura controlada e conferir Asaas, Supabase, painel e loja pública.

## E-mail e acesso

- [x] SMTP Resend configurado no Supabase e recuperação funcional.
- [ ] Colar `docs/supabase-email-templates/recovery.html` em **Authentication → Email Templates → Reset Password**.
- [ ] Marcar as mensagens de teste como “Não é spam” e validar Gmail e Outlook.
- [ ] Confirmar que SPF, DKIM e DMARC continuam válidos após qualquer alteração DNS.

## Segurança e operação

- [ ] Confirmar que `DEMO_ACCESS_ENABLED=false` em produção se a demonstração pública não fizer parte do lançamento.
- [ ] Rodar `npm run verify` e `npm audit --omit=dev` antes de cada release.
- [ ] Rodar `npm run audit:live` depois das migrations e após testes de pagamento.
- [ ] Conferir semanalmente falhas de Function na Netlify, erros do Supabase e fila do webhook no Asaas.
- [ ] Configurar alertas de consumo e orçamento na Netlify, Supabase, Resend e Asaas.
- [ ] Definir rotina de exportação/backup compatível com o plano escolhido do Supabase.
- [ ] Rotacionar imediatamente qualquer chave que seja enviada em chat, issue, log ou commit público.

## Decisões de produto e legais ainda necessárias

- [x] Uma conta administra uma loja; um segundo checkout com o mesmo e-mail é bloqueado.
- [ ] Informar nome/razão social, documento quando aplicável, canal oficial de contato e foro para completar Termos e Privacidade.
- [ ] Definir prazo de retenção para intenções de checkout, eventos de webhook e dados de contas canceladas.
- [ ] Definir o procedimento de exclusão de conta e dados solicitado pelo titular.
- [ ] Obter revisão jurídica dos textos antes de tráfego pago ou escala comercial.

## Critério de liberação

O lançamento real está liberado apenas quando todos os itens de **Bloqueios**, **E-mail e acesso** e **Segurança e operação** estiverem concluídos. Decisões legais não devem ser preenchidas com dados fictícios.
