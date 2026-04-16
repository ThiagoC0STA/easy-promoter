import type { Contact } from "@/lib/contacts/types";
import { daysSinceContact } from "@/lib/contacts/utils";

/**
 * Static, non-AI copy suggestion based on recency and segments (Portuguese UI).
 */
export function getApproachHint(contact: Contact): string | null {
  const days = daysSinceContact(contact.last_contacted_at);
  const segs = contact.segments;

  if (days === null) {
    return "Primeiro contato: apresente o rolê, peça estilo musical e combine o melhor canal para falar.";
  }

  if (days >= 10) {
    if (segs.includes("mailing")) {
      return "Mailing frio: mensagem curta com data, line-up ou benefício claro. Evite texto longo.";
    }
    if (segs.includes("posta")) {
      return "Posta: lembre do último combinado e sugira conteúdo fácil de postar (story, tag, data).";
    }
    if (segs.includes("gasta_bem")) {
      return "Gasta bem: foque em experiência e exclusividade, sem pressão genérica.";
    }
    return "Retomada: cite o último papo se lembrar e proponha um próximo passo simples.";
  }

  if (days >= 5) {
    return "Ainda no ar quente/morno: confirme interesse antes de cobrar ação.";
  }

  return null;
}
