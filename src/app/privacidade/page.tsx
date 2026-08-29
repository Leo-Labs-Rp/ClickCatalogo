import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacyPage() {
  return <LegalPage description="Como o ClickCatálogo trata os dados necessários à criação, cobrança e operação da sua loja." title="Política de privacidade"><section><h2>1. Dados coletados</h2><p>O ClickCatálogo coleta nome da loja, WhatsApp, e-mail, endereço público escolhido e dados inseridos no catálogo. O e-mail identifica o proprietário da conta. Dados de pagamento são processados pelo Asaas e não armazenamos números completos de cartão.</p></section><section><h2>2. Finalidades</h2><p>Usamos os dados para identificar e operar sua conta, publicar a loja, processar a assinatura, prevenir fraudes e cumprir obrigações legais.</p></section><section><h2>3. Compartilhamento</h2><p>Dados são compartilhados apenas com fornecedores necessários à operação do ClickCatálogo, como Supabase e Asaas, sob medidas contratuais e técnicas adequadas.</p></section><section><h2>4. Retenção e segurança</h2><p>Mantemos as informações pelo tempo necessário ao serviço e às obrigações legais. Aplicamos isolamento entre lojas, controle de acesso e chaves exclusivas de servidor.</p></section><section><h2>5. Seus direitos</h2><p>Você pode solicitar acesso, correção, portabilidade ou exclusão de dados quando aplicável. Pedidos serão avaliados conforme a legislação brasileira de proteção de dados.</p></section></LegalPage>;
}
