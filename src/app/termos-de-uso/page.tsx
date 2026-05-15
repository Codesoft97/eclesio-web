import type { Metadata } from "next";

import {
  LegalDocumentPage,
  type LegalSection,
} from "@/components/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Termos de Uso | Gerencia Igreja",
  description:
    "Termos de uso do Gerencia Igreja para administradores, membros e obreiros.",
};

const sections: LegalSection[] = [
  {
    title: "1. Aceite dos termos",
    paragraphs: [
      "Ao criar uma conta, acessar o painel administrativo, usar o portal dos membros ou confirmar uma escala, você declara que leu e concorda com estes Termos de Uso.",
      "Se você estiver utilizando o Gerencia Igreja em nome de uma igreja ou organização religiosa, declara também que possui autorização para representar essa organização no uso do sistema.",
    ],
  },
  {
    title: "2. Sobre o Gerencia Igreja",
    paragraphs: [
      "O Gerencia Igreja é uma plataforma de apoio à gestão de igrejas, com recursos para cadastro de membros e obreiros, eventos, escalas, comunicados, financeiro, doações via Pix e portal dos membros.",
      "O sistema organiza informações e automatiza rotinas administrativas, mas não substitui a responsabilidade da igreja sobre a conferência, atualização e uso correto dos dados inseridos.",
    ],
  },
  {
    title: "3. Contas e responsabilidades de acesso",
    items: [
      "O administrador da igreja é responsável por manter seus dados de acesso seguros e por gerenciar quem pode acessar informações da igreja.",
      "Membros e obreiros devem usar apenas a própria conta e manter senha, email e demais dados atualizados.",
      "A igreja é responsável por cadastrar informações corretas de membros, obreiros, eventos, escalas, chaves Pix, comunicados e lançamentos financeiros.",
      "É proibido compartilhar credenciais, tentar acessar dados de outra igreja ou usar o sistema para finalidade ilícita, abusiva ou incompatível com a rotina da igreja.",
    ],
  },
  {
    title: "4. Portal dos membros e escalas",
    paragraphs: [
      "O portal dos membros permite que pessoas vinculadas à igreja acompanhem informações disponibilizadas pelo administrador, como eventos, comunicados, doações e, quando aplicável, suas escalas.",
      "As confirmações de escala feitas por links ou pelo portal representam uma manifestação do obreiro sobre sua disponibilidade, cabendo à igreja acompanhar e ajustar a organização do evento quando necessário.",
    ],
  },
  {
    title: "5. Doações via Pix",
    paragraphs: [
      "O Gerencia Igreja permite que o administrador cadastre objetivos de doação com chave Pix, QR Code e Pix copia e cola para exibição aos membros.",
      "A plataforma não processa pagamentos, não intermedeia valores e não confirma automaticamente se uma doação foi paga. A responsabilidade pela chave Pix, titularidade, conferência dos recebimentos e prestação de contas é da igreja.",
    ],
  },
  {
    title: "6. Comunicações e automações",
    paragraphs: [
      "O sistema pode enviar mensagens relacionadas às escalas de obreiros, como convites e lembretes, usando canais de comunicação configurados pela igreja.",
      "A igreja é responsável por informar dados de contato corretos e por observar regras aplicáveis ao envio de comunicações aos seus membros e obreiros.",
    ],
  },
  {
    title: "7. Planos, cobranças e disponibilidade",
    paragraphs: [
      "Durante a fase de MVP ou testes, funcionalidades podem ser disponibilizadas gratuitamente ou com limitações. Planos pagos, preços e condições comerciais poderão ser adicionados ou alterados mediante comunicação adequada.",
      "Buscamos manter o sistema disponível e seguro, mas interrupções temporárias podem ocorrer por manutenção, falhas técnicas, atualizações, indisponibilidade de provedores externos ou motivos fora do nosso controle.",
    ],
  },
  {
    title: "8. Propriedade intelectual",
    paragraphs: [
      "A marca, layout, código, textos, componentes e demais elementos do Gerencia Igreja pertencem aos seus respectivos titulares e não podem ser copiados, revendidos ou explorados sem autorização.",
      "Os dados inseridos pela igreja continuam pertencendo à igreja ou aos respectivos titulares, conforme aplicável.",
    ],
  },
  {
    title: "9. Encerramento ou suspensão",
    paragraphs: [
      "Podemos suspender ou restringir o acesso em caso de violação destes termos, uso indevido, risco de segurança, tentativa de fraude ou obrigação legal.",
      "A igreja pode solicitar orientações sobre encerramento de conta ou tratamento dos dados pelo contato informado nestes termos.",
    ],
  },
  {
    title: "10. Alterações dos termos",
    paragraphs: [
      "Estes termos podem ser atualizados para refletir mudanças no sistema, requisitos legais ou melhorias operacionais. A versão mais recente ficará disponível nesta página.",
    ],
  },
  {
    title: "11. Contato",
    paragraphs: [
      "Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo email contato@gerenciaigreja.com.br.",
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <LegalDocumentPage
      eyebrow="Termos de uso"
      title="Termos de Uso"
      description="Condições gerais para uso do Gerencia Igreja por administradores, membros e obreiros."
      updatedAt="maio de 2026"
      sections={sections}
    />
  );
}
