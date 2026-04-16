export type ChangelogEntry = {
  version: string;
  date: string;
  items: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.6",
    date: "2026-04-16",
    items: [
      "Removido snooze (adiar / lembrar depois) da lista e da fila do dia.",
      "Ícone do WhatsApp no botão de abrir conversa (marca em SVG).",
    ],
  },
  {
    version: "1.5",
    date: "2026-04-16",
    items: [
      "Removidos modelos de mensagem e o fluxo “Mensagens” na lista; texto do WhatsApp continua com uma saudação padrão em ?text=.",
    ],
  },
  {
    version: "1.4",
    date: "2026-04-16",
    items: [
      "Histórico de ritmo por contato no navegador (abrir canal e confirmar contato).",
      "Próximo contato planejado opcional no modal pós-canal e na edição do contato (local).",
      "Aviso na dashboard quando a fila do dia muda em relação à última vez marcada como vista.",
    ],
  },
  {
    version: "1.3",
    date: "2026-04-16",
    items: [
      "Snooze local (3, 7 ou 14 dias): ícone de relógio na lista e na fila do dia; não sincroniza entre dispositivos.",
      "Fila do dia respeita snooze após carregar no navegador.",
      "WhatsApp abre com texto sugerido (?text=) com saudação padrão e nome do contato.",
    ],
  },
  {
    version: "1.2",
    date: "2026-04-16",
    items: [
      "Meta leve: contagem de contatos com toque nos últimos 7 dias no dashboard.",
      "Sugestão de abordagem estática por segmento e recência na lista.",
      "Importação CSV com pré-visualização (até 200 linhas).",
      "Admin: changelog e página de saúde (versão + ping Supabase + doc de URLs).",
      "Banner quando o navegador está offline.",
    ],
  },
  {
    version: "1.1",
    date: "2026-04-16",
    items: [
      "Fila do dia e resumo por segmento no dashboard.",
      "Export CSV, modo compacto, onboarding e atalhos.",
      "Manifest PWA e páginas de privacidade/termos.",
    ],
  },
];
