import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermsPage() {
  return <LegalPage description="Regras essenciais para usar a plataforma ClickCatálogo e manter seu catálogo publicado." title="Termos de uso"><section><h2>1. O serviço</h2><p>O ClickCatálogo oferece uma ferramenta para criar e administrar catálogos digitais com direcionamento de pedidos ao WhatsApp. O lojista é responsável pelo conteúdo, pelos preços, pelo atendimento e pelas vendas realizadas.</p></section><section><h2>2. Conta e acesso</h2><p>O acesso ao painel é pessoal e protegido pelo e-mail da assinatura e pela senha criada após o pagamento. O usuário deve manter seus dados de acesso seguros e não compartilhar sua sessão com terceiros.</p></section><section><h2>3. Assinatura</h2><p>O plano custa R$ 27 por mês e é renovado de forma recorrente pelo Asaas. Atrasos podem limitar o serviço; o cancelamento deixa a loja pública offline, preservando os dados conforme a política aplicável.</p></section><section><h2>4. Conteúdo e uso aceitável</h2><p>Não é permitido publicar conteúdo ilegal, enganoso, que viole direitos de terceiros ou tente comprometer a segurança da plataforma. Conteúdos e contas podem ser suspensos para proteção do serviço e dos usuários.</p></section><section><h2>5. Disponibilidade</h2><p>Trabalhamos para manter a plataforma disponível, mas manutenções e serviços de terceiros podem causar interrupções. Sempre que possível, comunicaremos mudanças relevantes.</p></section></LegalPage>;
}
