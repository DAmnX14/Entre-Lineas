export type Personalization = {
  recipientName?: string;
  fromName?: string;
  dedication?: string;
  occasion?: string;
  specialDate?: string;
  giftWrap?: boolean;
  giftCard?: boolean;
  giftCardText?: string;
};

export function cleanPersonalization(p: unknown): Personalization | undefined {
  if (!p || typeof p !== "object") return undefined;
  const o = p as Record<string, unknown>;
  const s = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
  const out: Personalization = {
    recipientName: s(o.recipientName, 60),
    fromName: s(o.fromName, 60),
    dedication: s(o.dedication, 600),
    occasion: s(o.occasion, 40),
    specialDate: s(o.specialDate, 20),
    giftWrap: o.giftWrap === true,
    giftCard: o.giftCard === true,
    giftCardText: s(o.giftCardText, 300),
  };
  const has = Object.values(out).some((v) => v !== undefined && v !== false);
  return has ? out : undefined;
}
