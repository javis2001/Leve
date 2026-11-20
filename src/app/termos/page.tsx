import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { PUBLIC_CONFIG } from "@/lib/env";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsPage() {
  const owner = PUBLIC_CONFIG.companyName || "o responsável pela plataforma Vida Leve";
  return (
    <LegalPage title="Termos de Uso" updated="19 de novembro de 2026">
      <p>Estes Termos regulam o uso da plataforma Vida Leve, oferecida por {owner}{PUBLIC_CONFIG.companyDocument ? ` (CNPJ ${PUBLIC_CONFIG.companyDocument})` : ""}. Ao criar uma conta, você declara ter lido e concordado com eles.</p>
      <h2>1. O que é o Vida Leve</h2>
      <p>Programa digital educativo de 30 dias sobre hábitos saudáveis, com conteúdos, receitas, exercícios de baixo impacto e ferramentas de organização. O conteúdo tem caráter informativo e não constitui diagnóstico, tratamento, prescrição médica, nutricional ou de atividade física.</p>
      <h2>2. Saúde e segurança</h2>
      <ul>
        <li>Consulte um profissional de saúde antes de iniciar atividades físicas ou mudanças alimentares, especialmente se tiver condições de saúde, estiver gestante ou em recuperação de lesão.</li>
        <li>Interrompa qualquer atividade diante de dor, tontura, falta de ar ou outros sintomas e procure atendimento.</li>
        <li>Verifique sempre os rótulos dos alimentos quanto a alergênicos.</li>
        <li>Não há promessa de resultados físicos específicos.</li>
      </ul>
      <h2>3. Conta e acesso</h2>
      <p>O acesso é pessoal e intransferível, liberado após a confirmação do pagamento pelo provedor de checkout, vinculado ao e-mail usado na compra. Você é responsável por manter sua senha em sigilo. O compartilhamento da conta pode levar à suspensão do acesso.</p>
      <h2>4. Pagamento, cancelamento e reembolso</h2>
      <p>O pagamento é processado por provedor externo, segundo as condições exibidas no checkout. Em caso de reembolso, cancelamento ou contestação (chargeback), o acesso é encerrado automaticamente. Compras on-line contam com o direito de arrependimento de 7 dias previsto no art. 49 do Código de Defesa do Consumidor.</p>
      <h2>5. Propriedade intelectual</h2>
      <p>Textos, receitas, ilustrações, marca e materiais em PDF são protegidos. É permitido o uso pessoal, incluindo impressão dos PDFs para uso próprio. Não é permitido revender, redistribuir ou publicar o conteúdo.</p>
      <h2>6. Disponibilidade</h2>
      <p>Empregamos esforços razoáveis para manter a plataforma disponível, mas podem ocorrer interrupções para manutenção ou por fatores externos. Conteúdos podem ser atualizados e aprimorados.</p>
      <h2>7. Privacidade</h2>
      <p>O tratamento de dados pessoais segue a nossa Política de Privacidade e a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
      <h2>8. Contato e foro</h2>
      <p>Dúvidas podem ser enviadas pelos canais informados no rodapé. Aplica-se a legislação brasileira, ficando eleito o foro do domicílio do consumidor.</p>
    </LegalPage>
  );
}
