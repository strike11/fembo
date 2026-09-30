import { prisma } from "@/lib/db";

export const PLUS_PRICE_USD = 5.99;
export const PLUS_PRICE_CENTS = 599;

export function plusActive(plusUntil: Date | null | undefined) {
  return Boolean(plusUntil && plusUntil.getTime() > Date.now());
}

export async function hasPlus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plusUntil: true },
  });
  return plusActive(user?.plusUntil);
}

export function canDevUnlock() {
  return process.env.NODE_ENV !== "production";
}

export function stripeReady() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
