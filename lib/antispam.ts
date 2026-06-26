// Sdílené antispamové limity a kontroly. Server-only.

export const LIMITS = {
  reportsPerHour: 15,
  contributionsPerHour: 25,
  duplicateReportWindowMs: 10 * 60 * 1000, // stejné hlášení téhož místa do 10 min = duplicita
  minTipLength: 3,
  maxLinksInText: 1,
};

// Honeypot: skryté pole „website" – člověk ho nevyplní, bot ano.
export function isBot(body: Record<string, unknown>): boolean {
  const hp = body?.website;
  return typeof hp === "string" && hp.trim() !== "";
}

// Hrubý filtr spamu v textu (příliš mnoho odkazů).
export function looksSpammy(text: string | undefined): boolean {
  if (!text) return false;
  const links = (text.match(/https?:\/\/|www\./gi) || []).length;
  if (links > LIMITS.maxLinksInText) return true;
  if (/\b(viagra|casino|porn|bitcoin|loan|crypto)\b/i.test(text)) return true;
  return false;
}
