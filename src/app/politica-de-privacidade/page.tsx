import type { Metadata } from "next";

import {
  LegalDocumentPage,
  type LegalSection,
} from "@/components/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Política de Privacidade | Gerencia Igreja",
  description:
    "Política de privacidade do Gerencia Igreja para administradores, membros e obreiros.",
};

const sections: LegalSection[] = [
  {
    title: "1. Visão geral",
    paragraphs: [
      "Esta Política de Privacidade explica como o Gerencia Igreja trata dados pessoais no uso da plataforma por administradores, membros e obreiros.",
      "A igreja que usa o sistema é responsável pelas informações que cadastra e disponibiliza. Em muitos casos, o Gerencia Igreja atua como operador, tratando dados conforme as configurações e instruções da igreja usuária.",
    ],
  },
  {
    title: "2. Dados que podem ser tratados",
    items: [
      "Dados de cadastro da igreja, como nome, informações administrativas e configurações da conta.",
      "Dados de usuários, membros e obreiros, como nome, email, WhatsApp, função, ministério, status de acesso e informações necessárias para login.",
      "Dados de eventos, cultos, escalas, confirmações, recusas e registros relacionados à participação de obreiros.",
      "Comunicados publicados pela igreja e interações necessárias para exibição no portal dos membros.",
      "Dados financeiros lançados pelo administrador, como receitas, despesas, categorias, saldos e pendências.",
      "Dados de doações cadastradas pela igreja, como objetivo, descrição, chave Pix, Pix copia e cola e QR Code gerado.",
      "Dados técnicos e de uso, como logs de acesso, endereço IP, navegador, dispositivo, páginas acessadas e eventos de analytics.",
    ],
  },
  {
    title: "3. Como usamos os dados",
    items: [
      "Criar e manter contas de acesso para administradores, membros e obreiros.",
      "Permitir a gestão de membros, obreiros, eventos, escalas, comunicados, financeiro e doações.",
      "Enviar comunicações operacionais relacionadas ao uso do sistema, como recuperação de senha, convites e lembretes de escala.",
      "Exibir informações da igreja no portal dos membros, conforme configurado pelo administrador.",
      "Melhorar segurança, estabilidade, desempenho, suporte e experiência de uso da plataforma.",
      "Cumprir obrigações legais, responder solicitações legítimas e proteger direitos do Gerencia Igreja, das igrejas e dos usuários.",
    ],
  },
  {
    title: "4. Compartilhamento com terceiros",
    paragraphs: [
      "Podemos utilizar provedores de infraestrutura, hospedagem, banco de dados, email, analytics, automação de mensagens e outros serviços técnicos necessários para operar o Gerencia Igreja.",
      "Esses provedores recebem apenas os dados necessários para executar suas funções e devem tratar as informações conforme medidas adequadas de segurança e confidencialidade.",
      "Não vendemos dados pessoais de usuários, membros ou obreiros.",
    ],
  },
  {
    title: "5. WhatsApp, email e comunicações",
    paragraphs: [
      "Mensagens de escala, recuperação de senha e outros avisos operacionais podem ser enviados por email, WhatsApp ou canais configurados pela igreja.",
      "A igreja deve garantir que os dados de contato cadastrados sejam corretos e que possui base adequada para comunicações com seus membros e obreiros.",
    ],
  },
  {
    title: "6. Doações e Pix",
    paragraphs: [
      "Quando a igreja cadastra uma doação, o sistema pode exibir chave Pix, QR Code e Pix copia e cola aos membros.",
      "O Gerencia Igreja não processa o pagamento, não armazena dados bancários do doador e não confirma automaticamente a transação. A conferência do recebimento ocorre fora da plataforma, diretamente pela igreja.",
    ],
  },
  {
    title: "7. Segurança e retenção",
    paragraphs: [
      "Adotamos medidas técnicas e organizacionais para proteger os dados contra acessos não autorizados, perda, alteração indevida ou divulgação não permitida.",
      "Os dados são mantidos enquanto forem necessários para operação da conta, cumprimento de obrigações legais, segurança, auditoria, suporte ou exercício de direitos. A igreja pode solicitar orientações sobre exclusão ou exportação de informações pelo canal de contato.",
    ],
  },
  {
    title: "8. Direitos dos titulares",
    paragraphs: [
      "Nos termos da legislação aplicável, titulares de dados podem solicitar confirmação de tratamento, acesso, correção, atualização, anonimização, bloqueio, eliminação, portabilidade, informação sobre compartilhamento e revisão de consentimento quando aplicável.",
      "Quando os dados forem administrados diretamente pela igreja dentro da plataforma, algumas solicitações poderão precisar ser direcionadas ou validadas pela própria igreja.",
    ],
  },
  {
    title: "9. Cookies e analytics",
    paragraphs: [
      "Podemos utilizar cookies, armazenamento local e ferramentas de analytics para manter sessão, lembrar preferências, medir uso do produto e melhorar a experiência.",
      "Esses recursos ajudam a entender fluxos de navegação e problemas de usabilidade, sempre buscando limitar a coleta ao necessário para operação e melhoria do sistema.",
    ],
  },
  {
    title: "10. Alterações desta política",
    paragraphs: [
      "Esta Política de Privacidade pode ser atualizada para refletir mudanças no sistema, novos recursos, requisitos legais ou melhorias de segurança. A versão mais recente ficará disponível nesta página.",
    ],
  },
  {
    title: "11. Contato",
    paragraphs: [
      "Para dúvidas, solicitações ou exercício de direitos relacionados a dados pessoais, entre em contato pelo email contato@gerenciaigreja.com.br.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      eyebrow="Privacidade"
      title="Política de Privacidade"
      description="Como o Gerencia Igreja coleta, utiliza, protege e compartilha dados pessoais no uso da plataforma."
      updatedAt="maio de 2026"
      sections={sections}
    />
  );
}
