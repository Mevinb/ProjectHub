export function getEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase().trim() ?? '';
}

export function isAllowedEmail(email: string, domains: string[], overrides: string[]): boolean {
  const normalized = email.toLowerCase().trim();
  if (overrides.includes(normalized)) return true;
  // Open signup: '*' or empty list allows all mail IDs (gmail, yahoo, college, ...)
  if (domains.length === 0 || domains.includes('*')) return true;
  const domain = getEmailDomain(normalized);
  return domains.includes(domain);
}
