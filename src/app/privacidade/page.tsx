import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { PUBLIC_CONFIG } from "@/lib/env";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPage() {
  const owner = PUBLIC_CONFIG.companyName || "o responsável pela plataforma Vida Leve";
  return (
    <LegalPage title="Política de Privacidade" updated="19 de novembro de 2026">
      <p>Esta Política explica como {owner} (controlador) trata seus dados pessoais na plataforma Vida Leve, em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
      <h2>1. Dados que coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome e e-mail; a senha é armazenada de forma criptografada pelo provedor de autenticação (nunca em texto simples).</li>
        <li><strong>Compra:</strong> e-mail, nome, status do pagamento, valor e parâmetros de campanha (UTMs), recebidos do provedor de checkout. Não recebemos dados de cartão.</li>
        <li><strong>Uso da plataforma:</strong> progresso da jornada, hábitos, receitas favoritas, cardápios, listas de compras e registros do diário (humor, energia, sono e textos que você escrever).</li>
        <li><strong>Navegação:</strong> cookies essenciais de sessão e cookies de medição (Meta Pixel, Google Analytics 4 e UTMify) nas páginas públicas. Você pode recusar a medição no aviso de cookies ou em “Preferências de cookies”, no rodapé.</li>
      </ul>
      <p>Não solicitamos peso, medidas, diagnósticos ou outros dados de saúde desnecessários. Os registros do diário são opcionais.</p>
      <h2>2. Para que usamos</h2>
      <ul>
        <li>Executar o contrato: criar sua conta, liberar o acesso após o pagamento e salvar seu progresso (art. 7º, V).</li>
        <li>Cumprir obrigações legais, como registros fiscais de compra (art. 7º, II).</li>
        <li>Medir campanhas de divulgação, com base no legítimo interesse (art. 7º, IX), com opção de recusa a qualquer momento. A medição nunca acontece na área de membros.</li>
        <li>Os registros do diário são usados exclusivamente para mostrar a você seus próprios dados.</li>
      </ul>
      <h2>3. Compartilhamento</h2>
      <p>Usamos operadores necessários ao serviço: Supabase (banco de dados e autenticação), Vercel (hospedagem) e o provedor de checkout. Para quem não recusou a medição, eventos de navegação e compra (sem dados de saúde, do diário ou hábitos) podem ser enviados à Meta, ao Google e à UTMify para medir campanhas. Não vendemos seus dados.</p>
      <h2>4. Segurança</h2>
      <p>Adotamos conexão criptografada (HTTPS), controle de acesso por linha no banco de dados (cada pessoa acessa apenas os próprios dados), senhas com hash e segredos guardados em variáveis de ambiente.</p>
      <h2>5. Seus direitos</h2>
      <p>Você pode confirmar o tratamento, acessar, corrigir, exportar (portabilidade) e excluir seus dados, além de recusar os cookies de medição a qualquer momento. Na área de membros, em <strong>Perfil</strong>, há botões para exportar seus dados e excluir sua conta. Para outros pedidos, use o contato do rodapé.</p>
      <h2>6. Retenção</h2>
      <p>Dados da conta são mantidos enquanto ela estiver ativa. Ao excluir a conta, os dados pessoais de uso são apagados; registros de compra podem ser mantidos pelo prazo legal, sem vínculo com a conta.</p>
      <h2>7. Cookies</h2>
      <p>Você pode alterar sua escolha em “Preferências de cookies”, no rodapé do site. A área de membros não carrega pixels de anúncio.</p>
      <h2>8. Contato</h2>
      <p>Para falar sobre privacidade, use os canais informados no rodapé. Você também pode contatar a Autoridade Nacional de Proteção de Dados (ANPD).</p>
    </LegalPage>
  );
}
