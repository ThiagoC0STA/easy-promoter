/**
 * Maps Supabase Auth Admin createUser errors to short Portuguese copy for the UI.
 */
export function mapCreateUserErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("already") || m.includes("registered")) {
    return "Este e-mail já está cadastrado. Tente entrar ou use outro endereço.";
  }
  if (m.includes("password") && m.includes("weak")) {
    return "Senha fraca demais. Use letras, números e pelo menos 8 caracteres.";
  }
  if (m.includes("password")) {
    return "Senha inválida. Tente uma senha mais forte (mínimo 8 caracteres).";
  }
  if (m.includes("email")) {
    return "E-mail inválido ou não aceito.";
  }
  return "Não foi possível criar a conta. Tente de novo em instantes.";
}
