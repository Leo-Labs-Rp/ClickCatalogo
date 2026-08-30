import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  alternates: { canonical: "/privacidade" },
  title: "Política de privacidade",
};

export default function PrivacyPage() {
  return <LegalPage description="Como o ClickCatálogo trata os dados necessários à criação, cobrança e operação da sua loja." title="Política de privacidade"><section><h2>1. Dados coletados</h2><p>O ClickCatálogo coleta nome da loja, WhatsApp, e-mail, endereço público escolhido e dados inseridos no catálogo. Também registramos informações técnicas mínimas de segurança e eventos de pagamento. Dados de cartão são processados pelo Asaas e não armazenamos o número completo.</p></section><section><h2>2. Dados públicos</h2><p>Nome, descrição, logo, banner, WhatsApp, Instagram, endereço e produtos cadastrados pelo lojista podem aparecer publicamente no endereço da loja. O lojista deve publicar apenas informações que possa divulgar.</p></section><section><h2>3. Finalidades</h2><p>Usamos os dados para identificar e operar a conta, publicar a loja, processar a assinatura, recuperar o acesso, prevenir abuso, manter registros de segurança e cumprir obrigações legais.</p></section><section><h2>4. Fornecedores</h2><p>Usamos Netlify para hospedagem, Supabase para banco de dados, autenticação e imagens, Asaas para cobrança e Resend como SMTP dos e-mails de autenticação. Cada fornecedor trata somente os dados necessários à sua função.</p></section><section><h2>5. Retenção e segurança</h2><p>Mantemos as informações durante a prestação do serviço e pelos períodos necessários ao cumprimento de obrigações legais e defesa de direitos. Aplicamos isolamento entre lojas, controle de acesso, validação de origem, limitação de abuso e chaves exclusivas de servidor.</p></section><section><h2>6. Seus direitos</h2><p>O titular pode solicitar confirmação do tratamento, acesso, correção, informação sobre compartilhamento, portabilidade ou eliminação quando aplicável. A solicitação poderá exigir verificação de identidade e será analisada conforme a legislação brasileira.</p></section></LegalPage>;
}
