/**
 * Maps Supabase Auth Admin invite errors to short Portuguese copy for the UI.
 */
export function mapInviteUserErrorMessage(raw: string): string {
  const m = raw.toLowerCase();

  if (
    m.includes("already") &&
    (m.includes("registered") || m.includes("exists") || m.includes("user"))
  ) {
    return "Este e-mail já possui conta ou um convite pendente.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Limite de envio atingido. Aguarde alguns minutos e tente de novo.";
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "O provedor recusou este formato de e-mail. Confira e tente de novo.";
  }
  if (m.includes("not authorized") || m.includes("forbidden")) {
    return "Sem permissão para enviar convites.";
  }

  return "Não foi possível enviar o convite. Tente de novo em instantes.";
}
