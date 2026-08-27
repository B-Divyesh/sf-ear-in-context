const SLUG = 'ear-in-context';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
// Production builds must always use the live Sociobot billing service. Local
// staging can opt into its test endpoint explicitly with VITE_BILLING_BASE.
const API_BASE = (import.meta.env.VITE_BILLING_BASE as string | undefined) ?? 'https://api.sociobot.in';

interface Verdict { valid: boolean; checkedAt: number; reason?: string }

export function checkoutUrl(): string {
  return `${API_BASE}/api/v1/products/${SLUG}/checkout`;
}

export function captureLicenseFromUrl(): boolean {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function storeLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function hasOptimisticUnlock(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '{}') as Partial<Verdict>;
    return verdict.valid !== false;
  } catch { return true; }
}

export async function verifyLicense(force = false): Promise<Verdict | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '{}') as Partial<Verdict>;
    if (!force && cached.checkedAt && Date.now() - cached.checkedAt < 86_400_000) return cached as Verdict;
  } catch { /* fetch a fresh verdict */ }
  try {
    const response = await fetch(`${API_BASE}/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const body = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: body.valid, reason: body.reason, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return verdict;
  } catch {
    return null; // offline: keep cached state and never block free practice
  }
}
